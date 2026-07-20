"""
rank_trends.py
==============
Post-processing ranking engine for the AntiGravity Handloom Demand Radar.

This script is the second stage of the two-stage data pipeline:

    Stage 1 (Spider):
        scrapy crawl handloom_search -a mode=full
        └── writes: output/raw_handloom_pins.json

    Stage 2 (This script):
        python rank_trends.py
        └── reads:  output/raw_handloom_pins.json
        └── writes: output/ranked_trends.json   ← Next.js API consumes this

    In Next.js (Stage 3):
        GET /api/demand-radar
        └── reads:  output/ranked_trends.json (via fs.readFileSync)
        └── returns JSON to the Demand Radar UI

Usage
-----
    # Default (reads raw_handloom_pins.json, writes ranked_trends.json):
    python rank_trends.py

    # Custom input/output paths:
    python rank_trends.py --input path/to/raw.json --output path/to/ranked.json

    # Adjust top-N limit:
    python rank_trends.py --top 25

    # Use duplicate-pin deduplication (recommended for full-mode scrapes):
    python rank_trends.py --dedupe

Ranking Formula (§ Directive 2)
--------------------------------
    engagement_score = (saves * 2) + repins

    Items are sorted descending by engagement_score.
    Items with equal engagement_score are sub-sorted by saves (descending).

Standard Library Only
---------------------
    Dependencies: json, argparse, operator, pathlib, datetime, collections
    No pip install required.
"""

import json
import argparse
import operator
from pathlib import Path
from datetime import datetime
from collections import defaultdict


# ─────────────────────────────────────────────────────────────────────────────
# Configuration defaults
# ─────────────────────────────────────────────────────────────────────────────

DEFAULT_INPUT  = Path("output/raw_handloom_pins.json")
DEFAULT_OUTPUT = Path("output/ranked_trends.json")
TOP_N          = 60   # Keep only the strongest demand signals


# ─────────────────────────────────────────────────────────────────────────────
# Frontend contract — these fields are injected into every output record
# They are consumed by the Demand Radar UI's handoff logic.
# ─────────────────────────────────────────────────────────────────────────────

FRONTEND_DEFAULTS = {
    "matchesExistingJacquardCard": False,   # Set True by the Next.js API if a matching card ID is found
    "associatedCardId":            None,    # Populated by the card-library lookup route
}


# ─────────────────────────────────────────────────────────────────────────────
# Step 1: Ingest
# ─────────────────────────────────────────────────────────────────────────────

def load_raw_pins(input_path: Path) -> list[dict]:
    """
    Read the raw JSON output produced by the handloom_search spider.

    Raises FileNotFoundError with actionable instructions if the file is missing.
    """
    if not input_path.exists():
        raise FileNotFoundError(
            f"\n[rank_trends.py] Input file not found: '{input_path}'\n\n"
            "  Run the spider first:\n"
            "    cd pinterest-scrapy-scraper-main\n"
            "    scrapy crawl handloom_search -a mode=full\n"
        )

    with open(input_path, "r", encoding="utf-8") as fh:
        data = json.load(fh)

    if not isinstance(data, list):
        raise ValueError(
            f"[rank_trends.py] Expected a JSON array in '{input_path}', "
            f"got {type(data).__name__}."
        )

    print(f"[INGEST]  Loaded {len(data):,} raw pins from '{input_path}'")
    return data


# ─────────────────────────────────────────────────────────────────────────────
# Step 2: Clean (filter)
# ─────────────────────────────────────────────────────────────────────────────

def clean_pins(raw_pins: list[dict]) -> list[dict]:
    """
    Filter out noise records. A pin is kept only if:
      - image_url is non-empty (visual signal required for frontend rendering)
      - pin_id    is non-empty (required for deduplication and linking)
      - The image URL contains a recognisable CDN host (pinimg.com or pinterest.*)
        OR is a fallback stub (for test/mock data tolerance)

    Engagement-zero pins ARE kept at this stage — the spider captures
    many pins without engagement data (Pinterest hides raw counts).
    The engagement_score calculation still works with zeros; they simply
    rank at the bottom before the TOP_N slice.
    """
    clean = []
    dropped_no_image   = 0
    dropped_no_id      = 0
    dropped_bad_url    = 0

    for pin in raw_pins:
        image_url = (pin.get("image_url") or "").strip()
        pin_id    = (pin.get("pin_id")    or "").strip()

        if not image_url:
            dropped_no_image += 1
            continue

        if not pin_id:
            dropped_no_id += 1
            continue

        # Accept pinimg CDN URLs, any https image, or test stubs
        url_lower = image_url.lower()
        if not (
            "pinimg.com"   in url_lower
            or "pinterest." in url_lower
            or url_lower.startswith("https://")    # accept any HTTPS image
            or url_lower.startswith("http://")     # accept HTTP (dev/mock)
        ):
            dropped_bad_url += 1
            continue

        clean.append(pin)

    total_dropped = dropped_no_image + dropped_no_id + dropped_bad_url
    print(
        f"[CLEAN]   {len(clean):,} pins retained, "
        f"{total_dropped:,} dropped "
        f"(no_image={dropped_no_image}, no_id={dropped_no_id}, "
        f"bad_url={dropped_bad_url})"
    )
    return clean


# ─────────────────────────────────────────────────────────────────────────────
# Step 2b (optional): Deduplicate across queries
# ─────────────────────────────────────────────────────────────────────────────

def dedupe_by_pin_id(pins: list[dict]) -> list[dict]:
    """
    When running in full mode, the same popular pin may appear for multiple
    search queries (e.g. the same Kanjivaram pin appearing for both
    "Kanjivaram silk saree" and "Temple border silk saree").

    This function keeps the instance with the highest engagement_score and
    accumulates the query contexts by joining them with ' | '.

    Only activated when --dedupe flag is passed.
    """
    seen: dict[str, dict] = {}

    for pin in pins:
        pid = pin.get("pin_id", "")
        if not pid:
            continue

        if pid not in seen:
            seen[pid] = pin.copy()
        else:
            existing = seen[pid]
            # Prefer the higher engagement_score record
            if _compute_score(pin) > _compute_score(existing):
                query_context = existing.get("search_query_used", "")
                seen[pid] = pin.copy()
                seen[pid]["search_query_used"] = (
                    f"{pin.get('search_query_used', '')} | {query_context}"
                    if query_context
                    else pin.get("search_query_used", "")
                )
            else:
                # Append the alternate query context
                current_q = existing.get("search_query_used", "")
                new_q     = pin.get("search_query_used", "")
                if new_q and new_q not in current_q:
                    existing["search_query_used"] = f"{current_q} | {new_q}"

    result = list(seen.values())
    print(f"[DEDUPE]  {len(result):,} unique pins after deduplication")
    return result


# ─────────────────────────────────────────────────────────────────────────────
# Step 3: Rank
# ─────────────────────────────────────────────────────────────────────────────

def _compute_score(pin: dict) -> int:
    """
    Engagement Score formula (§ Directive 2):
        score = (saves * 2) + repins

    We re-compute here rather than trusting the spider's pre-computed field
    because the raw JSON may have been manually edited or generated by
    a different pipeline version.
    """
    saves  = _safe_int(pin.get("saves",  0))
    repins = _safe_int(pin.get("repins", 0))
    return (saves * 2) + repins


def rank_pins(pins: list[dict]) -> list[dict]:
    """
    1. Recompute engagement_score for every pin (enforces formula correctness).
    2. Sort descending by engagement_score; break ties by saves (descending).
    3. Attach rank position (1-indexed).
    """
    # Recompute scores
    for pin in pins:
        pin["engagement_score"] = _compute_score(pin)

    # Sort: primary key = engagement_score DESC, secondary key = saves DESC
    ranked = sorted(
        pins,
        key=lambda p: (_compute_score(p), _safe_int(p.get("saves", 0))),
        reverse=True,
    )

    # Attach rank
    for i, pin in enumerate(ranked, start=1):
        pin["rank"] = i

    print(
        f"[RANK]    Sorted {len(ranked):,} pins by engagement_score DESC "
        f"(formula: saves×2 + repins)"
    )
    return ranked


# ─────────────────────────────────────────────────────────────────────────────
# Step 4: Slice to Top N
# ─────────────────────────────────────────────────────────────────────────────

def slice_top_n(ranked: list[dict], n: int) -> list[dict]:
    """Keep only the top N strongest demand signals."""
    sliced = ranked[:n]
    print(f"[SLICE]   Keeping top {n} pins (from {len(ranked):,} ranked)")
    return sliced


# ─────────────────────────────────────────────────────────────────────────────
# Step 5: Format — inject frontend contract fields
# ─────────────────────────────────────────────────────────────────────────────

def format_for_frontend(pins: list[dict]) -> list[dict]:
    """
    Inject default frontend handoff keys into every record:
      - matchesExistingJacquardCard : bool  (default False)
      - associatedCardId            : None

    Also ensures every numeric field is a proper int/float (not a string)
    so the Next.js API can sort/filter without extra type coercion.

    Finally, adds a 'pipeline_metadata' envelope to the root of the output
    for observability (when was this file generated, how many items, etc.)
    """
    formatted = []

    for pin in pins:
        record = {}

        # ---- Core fields (guaranteed present, type-coerced) ----
        record["rank"]             = int(pin.get("rank", 0))
        record["pin_id"]           = str(pin.get("pin_id", ""))
        record["pin_url"]          = str(pin.get("pin_url", ""))
        record["title"]            = str(pin.get("title", "Handloom Design"))
        record["description"]      = str(pin.get("description", ""))
        record["image_url"]        = str(pin.get("image_url", ""))

        # ---- Engagement metrics (int-coerced) ----
        record["saves"]            = _safe_int(pin.get("saves",            0))
        record["repins"]           = _safe_int(pin.get("repins",           0))
        record["comments"]         = _safe_int(pin.get("comments",         0))
        record["engagement_score"] = _safe_int(pin.get("engagement_score", 0))

        # ---- Context fields ----
        record["search_query_used"] = str(pin.get("search_query_used", ""))
        record["region_tag"]        = str(pin.get("region_tag",        "Pan-India"))
        record["scraped_at"]        = str(pin.get("scraped_at",        ""))

        # ---- Frontend handoff defaults (§ Directive 2 requirement) ----
        record.update(FRONTEND_DEFAULTS)

        formatted.append(record)

    print(
        f"[FORMAT]  Injected frontend defaults "
        f"(matchesExistingJacquardCard=false, associatedCardId=null) "
        f"into {len(formatted):,} records"
    )
    return formatted


# ─────────────────────────────────────────────────────────────────────────────
# Step 6: Write output
# ─────────────────────────────────────────────────────────────────────────────

def write_output(pins: list[dict], output_path: Path) -> None:
    """
    Write the ranked, cleaned, formatted pins to ranked_trends.json.

    Output structure:
    {
      "metadata": { "generated_at": "...", "total_pins": 20, "formula": "..." },
      "trends": [ { rank, pin_id, title, image_url, saves, ..., matchesExistingJacquardCard, associatedCardId }, ... ]
    }
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)

    payload = {
        "metadata": {
            "generated_at"        : datetime.now().isoformat(),
            "source_file"         : str(DEFAULT_INPUT),
            "total_pins"          : len(pins),
            "ranking_formula"     : "(saves * 2) + repins",
            "top_n_limit"         : TOP_N,
            "pipeline_version"    : "1.0.0",
            "consumer"            : "Next.js /api/demand-radar",
        },
        "trends": pins,
    }

    with open(output_path, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=2)

    print(f"[OUTPUT]  Done. Wrote {len(pins):,} ranked trends to '{output_path}'")


# ─────────────────────────────────────────────────────────────────────────────
# Diagnostic: print a summary table to stdout
# ─────────────────────────────────────────────────────────────────────────────

def print_summary(pins: list[dict]) -> None:
    """Print a human-readable ranking table for quick verification."""
    sep = "-" * 80
    print("\n" + sep)
    print(f"  HANDLOOM DEMAND RADAR -- TOP {len(pins)} RANKED DESIGNS")
    print(sep)
    print(f"  {'Rank':<5} {'Score':>7}  {'Saves':>7}  {'Repins':>7}  Title")
    print(sep)

    for pin in pins:
        rank   = pin.get("rank",   "?")
        score  = pin.get("engagement_score", 0)
        saves  = pin.get("saves",  0)
        repins = pin.get("repins", 0)
        raw_title = str(pin.get("title", ""))
        title  = raw_title.encode('ascii', 'ignore').decode('ascii')[:55]
        print(f"  {rank:<5} {score:>7,}  {saves:>7,}  {repins:>7,}  {title}")

    print(sep + "\n")


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _safe_int(value) -> int:
    """Coerce any value to int without raising."""
    try:
        return int(float(str(value).replace(",", "").strip()))
    except (ValueError, TypeError):
        return 0


# ─────────────────────────────────────────────────────────────────────────────
# CLI entrypoint
# ─────────────────────────────────────────────────────────────────────────────

def parse_args():
    parser = argparse.ArgumentParser(
        description=(
            "AntiGravity Handloom — trend ranking post-processor.\n"
            "Reads raw_handloom_pins.json → ranks → writes ranked_trends.json."
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--input", "-i",
        type=Path,
        default=DEFAULT_INPUT,
        help=f"Path to raw spider output JSON (default: {DEFAULT_INPUT})",
    )
    parser.add_argument(
        "--output", "-o",
        type=Path,
        default=DEFAULT_OUTPUT,
        help=f"Path for ranked output JSON (default: {DEFAULT_OUTPUT})",
    )
    parser.add_argument(
        "--top", "-n",
        type=int,
        default=TOP_N,
        help=f"Number of top designs to keep (default: {TOP_N})",
    )
    parser.add_argument(
        "--dedupe",
        action="store_true",
        default=False,
        help=(
            "Deduplicate pins that appeared in multiple search queries. "
            "Recommended for full-mode scrapes."
        ),
    )
    return parser.parse_args()


def main():
    args = parse_args()

    print("\n" + "=" * 60)
    print("  AntiGravity — Handloom Trend Ranking Pipeline")
    print("=" * 60)
    print(f"  Input  : {args.input}")
    print(f"  Output : {args.output}")
    print(f"  Top-N  : {args.top}")
    print(f"  Dedupe : {args.dedupe}")
    print("=" * 60 + "\n")

    # ── Pipeline stages ──────────────────────────────────────────────

    # 1. Ingest
    raw_pins = load_raw_pins(args.input)

    # 2. Clean
    clean    = clean_pins(raw_pins)

    # 2b. Deduplicate (optional)
    if args.dedupe:
        clean = dedupe_by_pin_id(clean)

    # 3. Rank
    ranked   = rank_pins(clean)

    # 4. Slice
    top      = slice_top_n(ranked, args.top)

    # 5. Format (inject frontend contract fields)
    final    = format_for_frontend(top)

    # 6. Write
    write_output(final, args.output)

    # Summary table
    print_summary(final)

    print(
        f"  Pipeline complete. Next step:\n"
        f"  -> Ensure your Next.js API route reads:\n"
        f"    '{args.output.resolve()}'\n"
    )


if __name__ == "__main__":
    main()
