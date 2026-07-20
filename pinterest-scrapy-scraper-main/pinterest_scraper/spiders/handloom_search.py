"""
handloom_search.py
==================
Pinterest demand-sensing spider for the AntiGravity handloom cooperative.

This spider is a purpose-built fork of the generic pinterest_search spider,
hardcoded to crawl handloom / traditional silk saree queries only.

Run Commands
------------
  # Single query (quick test):
  scrapy crawl handloom_search -a search_query="Kanjivaram silk saree" -a max_results=50

  # Full multi-query sweep (recommended for production demand radar):
  scrapy crawl handloom_search -a mode=full -a max_results=30

  # Output to raw JSON for rank_trends.py:
  scrapy crawl handloom_search -a mode=full -o output/raw_handloom_pins.json

Architecture Note
-----------------
  Spider → raw_handloom_pins.json → rank_trends.py → ranked_trends.json → Next.js API
"""

import scrapy
import json
import re
from datetime import datetime
from urllib.parse import urljoin, quote_plus
from pinterest_scraper.items import HandloomPinItem


# ============================================================
# HANDLOOM DEMAND RADAR — Targeted Search Queries
# These exact strings are submitted to the Pinterest search API.
# Add / remove keywords here to adjust demand signal coverage.
# ============================================================
HANDLOOM_QUERIES = [
    "Silk handloom Saree",
    "Kanjivaram Pure handloom Silks",
]

# Maps partial keyword → geographic region tag surfaced in the frontend
REGION_MAP = {
    "kanjivaram":    "Pan-India",
    "south indian":  "Pan-India",
    "banarasi":      "Pan-India",
    "temple border": "Pan-India",
    "bridal":        "Pan-India",
    "peacock":       "Pan-India",
    "zari":          "Pan-India",
    "pallu":         "Pan-India",
    "weaving":       "Pan-India",
}


class HandloomSearchSpider(scrapy.Spider):
    """
    Demand-sensing spider targeting handloom & traditional silk saree pins.

    Key differences from the generic PinterestSearchSpider:
      1. Hardcoded HANDLOOM_QUERIES — no generic 'home decor' noise.
      2. Extracts HandloomPinItem (saves, repins, comments, image_url).
      3. Computes engagement_score = (saves * 2) + repins before yielding.
      4. Assigns region_tag from REGION_MAP for frontend rendering.
      5. JSON output is consumed directly by rank_trends.py.
    """

    name = "handloom_search"
    allowed_domains = ["pinterest.com", "proxy.scrapeops.io"]

    # Polite crawl settings — Pinterest rate-limits aggressively
    custom_settings = {
        "DOWNLOAD_DELAY": 2,
        "RANDOMIZE_DOWNLOAD_DELAY": 0.5,
        "CONCURRENT_REQUESTS": 1,
        "AUTOTHROTTLE_ENABLED": True,
        "AUTOTHROTTLE_START_DELAY": 2,
        "AUTOTHROTTLE_MAX_DELAY": 30,
        # Write raw JSON for rank_trends.py; rank_trends.py creates ranked_trends.json
        "FEEDS": {
            "output/raw_handloom_pins.json": {
                "format": "json",
                "overwrite": True,
                "encoding": "utf-8",
            }
        },
    }

    def __init__(self, search_query=None, mode="single", max_results=20, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.mode = mode  # "single" | "full"
        self.max_results = int(max_results)
        self.base_url = "https://www.pinterest.com"
        self.results_scraped = 0

        # Determine which queries to run
        if mode == "full":
            self.queries = HANDLOOM_QUERIES
            self.logger.info(
                f"🧵 Handloom Demand Radar — FULL MODE: {len(self.queries)} queries, "
                f"{self.max_results} results each"
            )
        else:
            # Single-query mode: use provided arg or fallback to first query
            self.queries = [search_query or HANDLOOM_QUERIES[0]]
            self.logger.info(
                f"🧵 Handloom Demand Radar — SINGLE MODE: '{self.queries[0]}'"
            )

    # ------------------------------------------------------------------
    # Request generation
    # ------------------------------------------------------------------

    async def start(self):
        """Generate one Pinterest search request per query."""
        print("!!! SPIDER START_REQUESTS EXECUTING !!!", flush=True)
        api_key = self.settings.get("SCRAPEOPS_API_KEY", "")

        for query in getattr(self, 'queries', []):
            search_url = f"{self.base_url}/search/pins/?q={quote_plus(query)}"
            self.logger.info(f"🔍 Queueing search: {query}")

            if api_key and api_key != "Your API Key here":
                # Route through ScrapeOps proxy with JS rendering
                proxied_url = (
                    f"https://proxy.scrapeops.io/v1/"
                    f"?api_key={api_key}"
                    f"&url={quote_plus(search_url)}"
                    f"&render_js=true"
                    f"&wait=3000"
                    f"&residential=false"
                    f"&country=IN"          # India endpoint for regional relevance
                )
                yield scrapy.Request(
                    url=proxied_url,
                    callback=self.parse_pins,
                    meta={"search_query": query, "search_url": search_url},
                    errback=self.handle_error,
                )
            else:
                # Direct request (dev / test mode — likely blocked by Pinterest)
                self.logger.warning(
                    "⚠  No ScrapeOps API key — running in direct mode. "
                    "Pinterest will likely block this; set SCRAPEOPS_API_KEY in settings.py."
                )
                yield scrapy.Request(
                    url=search_url,
                    callback=self.parse_pins,
                    meta={"search_query": query, "search_url": search_url},
                    errback=self.handle_error,
                    headers={
                        "User-Agent": (
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                            "AppleWebKit/537.36 (KHTML, like Gecko) "
                            "Chrome/124.0.0.0 Safari/537.36"
                        )
                    },
                )

    # ------------------------------------------------------------------
    # Pin extraction — main parse callback
    # ------------------------------------------------------------------

    def parse_pins(self, response):
        """
        Parse a Pinterest search result page and yield HandloomPinItems.

        Pinterest renders content via React (server-rendered JSON embedded in
        a <script id="__PWS_INITIAL_DATA__"> tag). We attempt three strategies
        in priority order:

          1. JSON blob extraction (most reliable — structured data)
          2. CSS selectors on rendered HTML (ScrapeOps JS render)
          3. Meta tags / og:image fallback (last resort)
        """
        query = response.meta.get("search_query", "unknown")
        self.logger.info(f"📊 Parsing results for: {query}")

        pins_found = 0

        # ---- Strategy 1: Extract embedded JSON state ----
        json_pins = self._extract_from_json_state(response, query)
        if json_pins:
            for item in json_pins[: self.max_results]:
                yield item
                pins_found += 1
            self.logger.info(
                f"✅ JSON strategy: {pins_found} pins extracted for '{query}'"
            )
            return

        # ---- Strategy 2: CSS selectors on rendered HTML ----
        css_pins = self._extract_from_css(response, query)
        if css_pins:
            for item in css_pins[: self.max_results]:
                yield item
                pins_found += 1
            self.logger.info(
                f"✅ CSS strategy: {pins_found} pins extracted for '{query}'"
            )
            return

        # ---- Strategy 3: OG / meta tag fallback ----
        fallback_item = self._extract_fallback(response, query)
        if fallback_item:
            yield fallback_item
            pins_found = 1

        if pins_found == 0:
            self.logger.warning(
                f"⚠  No pins extracted for '{query}'. "
                "Pinterest may have blocked the request or DOM structure changed."
            )

    # ------------------------------------------------------------------
    # Strategy 1 — JSON state blob extraction
    # ------------------------------------------------------------------

    def _extract_from_json_state(self, response, query):
        """
        Pinterest embeds full pin data in a JSON blob inside:
          <script id="__PWS_INITIAL_DATA__">{ ... }</script>
        or in window.__PWS_DATA__ inside inline <script> tags.

        We parse it with the standard library json module (no extra deps).
        """
        items = []

        # Try multiple script patterns Pinterest has used over the years
        script_patterns = [
            r'<script id="__PWS_INITIAL_DATA__">(.+?)</script>',
            r'window\.__PWS_DATA__\s*=\s*(\{.+?\});\s*</script>',
            r'"resourceResponses"\s*:\s*(\[.+?\])',
        ]

        raw_html = response.text
        json_blob = None

        for pattern in script_patterns:
            match = re.search(pattern, raw_html, re.DOTALL)
            if match:
                try:
                    json_blob = json.loads(match.group(1))
                    break
                except (json.JSONDecodeError, IndexError):
                    continue

        if not json_blob:
            return []

        # Pinterest nests pin data deep inside the state blob.
        # Walk the blob recursively looking for objects that contain
        # "pin_id" or "id" + "image_signature" patterns.
        raw_pins = self._walk_json_for_pins(json_blob)
        self.logger.debug(f"JSON walk found {len(raw_pins)} raw pin objects")

        for raw_pin in raw_pins:
            item = self._build_item_from_json(raw_pin, query)
            if item:
                items.append(item)

        return items

    def _walk_json_for_pins(self, obj, depth=0, max_depth=12):
        """
        Recursively walk a nested JSON structure to find pin-like dicts.
        Pinterest's state structure changes often; this approach is resilient.
        """
        results = []
        if depth > max_depth:
            return results

        if isinstance(obj, dict):
            # A pin-like object typically has an image URL, an id, and metrics
            has_image = any(
                k in obj for k in ("image_signature", "images", "image_url")
            )
            has_id = any(k in obj for k in ("pin_id", "id"))

            if has_id and has_image:
                results.append(obj)
            else:
                for value in obj.values():
                    results.extend(self._walk_json_for_pins(value, depth + 1, max_depth))

        elif isinstance(obj, list):
            for element in obj:
                results.extend(self._walk_json_for_pins(element, depth + 1, max_depth))

        return results

    def _build_item_from_json(self, raw_pin, query):
        """Map a raw Pinterest JSON pin object → HandloomPinItem."""
        # Extract image URL — try highest resolution first
        image_url = ""
        images = raw_pin.get("images", {})
        if isinstance(images, dict):
            for res_key in ("orig", "736x", "474x", "236x"):
                if res_key in images:
                    image_url = images[res_key].get("url", "")
                    if image_url:
                        break
        if not image_url:
            image_url = raw_pin.get("image_url", "")
        if not image_url:
            return None  # image_url is non-negotiable

        # Extract engagement metrics
        saves    = self._safe_int(raw_pin.get("aggregated_pin_data", {}).get("saves", 0)
                                  or raw_pin.get("repin_count", 0)
                                  or raw_pin.get("pin_saves", 0))
        repins   = self._safe_int(raw_pin.get("repins", 0)
                                  or raw_pin.get("repin_count", 0))
        comments = self._safe_int(raw_pin.get("comment_count", 0)
                                  or raw_pin.get("comments", 0))

        # Compute engagement score before yielding
        engagement_score = (saves * 2) + repins

        # Determine region from the query keyword
        region_tag = self._infer_region(query)

        item = HandloomPinItem()
        item["pin_id"]            = str(raw_pin.get("pin_id") or raw_pin.get("id", ""))
        item["pin_url"]           = urljoin(
            "https://www.pinterest.com", f"/pin/{item['pin_id']}/"
        )
        item["title"]             = (
            raw_pin.get("title")
            or raw_pin.get("grid_title")
            or raw_pin.get("description", "")[:120]
            or "Handloom Design"
        )
        item["description"]       = raw_pin.get("description", "")
        item["image_url"]         = image_url
        item["saves"]             = saves
        item["repins"]            = repins
        item["comments"]          = comments
        item["engagement_score"]  = engagement_score
        item["search_query_used"] = query
        item["region_tag"]        = region_tag
        item["scraped_at"]        = datetime.now().isoformat()

        return item

    # ------------------------------------------------------------------
    # Strategy 2 — CSS selector extraction (rendered HTML)
    # ------------------------------------------------------------------

    def _extract_from_css(self, response, query):
        """
        Extract pins from rendered HTML using CSS selectors.
        Pinterest's class names are obfuscated so we use structural
        selectors that target known stable attributes.
        """
        items = []

        # Structural selectors that target pin containers
        pin_container_selectors = [
            "div[data-test-id='pin']",
            "div[data-test-id='pinrep']",
            "div.GrowthUnauthPinImage",
            "a[href*='/pin/']",
        ]

        pin_elements = []
        for selector in pin_container_selectors:
            elements = response.css(selector)
            if elements:
                pin_elements = elements
                self.logger.debug(
                    f"CSS selector '{selector}' matched {len(elements)} elements"
                )
                break

        for element in pin_elements[: self.max_results]:
            item = self._build_item_from_css(element, query)
            if item:
                items.append(item)

        return items

    def _build_item_from_css(self, element, query):
        """Map a CSS-selected pin element → HandloomPinItem."""
        # Extract image URL — prefer high-resolution pinimg variants
        image_url = ""
        img_candidates = [
            element.css("img::attr(src)").get(""),
            element.css("img::attr(data-src)").get(""),
            element.css("[data-test-id='pin-image']::attr(src)").get(""),
        ]
        for candidate in img_candidates:
            if candidate and "pinimg.com" in candidate:
                # Upgrade to 736x resolution if available
                image_url = re.sub(r"/\d+x/", "/736x/", candidate)
                break
        if not image_url:
            return None  # Must have an image

        # Extract pin ID from href
        pin_url_rel = element.css("a::attr(href)").get("")
        pin_id_match = re.search(r"/pin/(\d+)/", pin_url_rel)
        pin_id = pin_id_match.group(1) if pin_id_match else ""

        # Extract title / alt text
        title = (
            element.css("img::attr(alt)").get("")
            or element.css("a::attr(aria-label)").get("")
            or element.css("[data-test-id='pinTitle']::text").get("")
            or "Handloom Design"
        ).strip()

        # Engagement: Pinterest rarely surfaces raw counts in HTML.
        # We extract what we can; rank_trends.py handles zeros gracefully.
        saves_text    = element.css("[data-test-id='save-count']::text").get("0")
        repins_text   = element.css("[data-test-id='repins']::text").get("0")
        comments_text = element.css("[data-test-id='comment-count']::text").get("0")

        saves    = self.parse_number(saves_text)
        repins   = self.parse_number(repins_text)
        comments = self.parse_number(comments_text)
        engagement_score = (saves * 2) + repins

        item = HandloomPinItem()
        item["pin_id"]            = pin_id
        item["pin_url"]           = urljoin("https://www.pinterest.com", pin_url_rel)
        item["title"]             = title[:200]
        item["description"]       = element.css("p::text").get("") or ""
        item["image_url"]         = image_url
        item["saves"]             = saves
        item["repins"]            = repins
        item["comments"]          = comments
        item["engagement_score"]  = engagement_score
        item["search_query_used"] = query
        item["region_tag"]        = self._infer_region(query)
        item["scraped_at"]        = datetime.now().isoformat()

        return item

    # ------------------------------------------------------------------
    # Strategy 3 — OG / meta tag fallback
    # ------------------------------------------------------------------

    def _extract_fallback(self, response, query):
        """
        Last resort: build a single item from Open Graph meta tags.
        Useful for testing against a static cached HTML page.
        """
        image_url = (
            response.css("meta[property='og:image']::attr(content)").get("")
            or response.css("meta[name='twitter:image']::attr(content)").get("")
        )
        if not image_url:
            return None

        title = (
            response.css("meta[property='og:title']::attr(content)").get("")
            or response.css("title::text").get("")
            or query
        ).strip()

        item = HandloomPinItem()
        item["pin_id"]            = "og-fallback"
        item["pin_url"]           = response.url
        item["title"]             = title[:200]
        item["description"]       = response.css(
            "meta[property='og:description']::attr(content)"
        ).get("") or ""
        item["image_url"]         = image_url
        item["saves"]             = 0
        item["repins"]            = 0
        item["comments"]          = 0
        item["engagement_score"]  = 0
        item["search_query_used"] = query
        item["region_tag"]        = self._infer_region(query)
        item["scraped_at"]        = datetime.now().isoformat()
        return item

    # ------------------------------------------------------------------
    # Error handler
    # ------------------------------------------------------------------

    def handle_error(self, failure):
        """Log failed requests without crashing the spider."""
        self.logger.error(
            f"❌ Request failed: {failure.request.url}\n"
            f"   Reason: {failure.value}"
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _infer_region(self, query):
        """Map a search query to a geographic region tag."""
        q = query.lower()
        for keyword, region in REGION_MAP.items():
            if keyword in q:
                return region
        return "Pan-India"

    def _safe_int(self, value):
        """Safely coerce any value to int without raising."""
        try:
            return int(float(str(value).replace(",", "").strip()))
        except (ValueError, TypeError):
            return 0

    def parse_number(self, text):
        """
        Parse Pinterest engagement count strings to int.
        Handles: '12.3K', '1.2M', '4,500', '17', etc.
        Reused from the base spider to keep this file self-contained.
        """
        if not text:
            return 0
        text = str(text).strip().replace(",", "")
        if text.lower().endswith("k"):
            try:
                return int(float(text[:-1]) * 1_000)
            except ValueError:
                return 0
        elif text.lower().endswith("m"):
            try:
                return int(float(text[:-1]) * 1_000_000)
            except ValueError:
                return 0
        elif text.lower().endswith("b"):
            try:
                return int(float(text[:-1]) * 1_000_000_000)
            except ValueError:
                return 0
        else:
            numbers = re.findall(r"\d+", text)
            return int(numbers[0]) if numbers else 0
