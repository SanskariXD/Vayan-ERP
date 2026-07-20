import os
import re

search_root = r"x:\Handloom Hackahton"
pattern = re.compile(r"scrapeops_api_key", re.IGNORECASE)

print("Searching for SCRAPEOPS_API_KEY in workspace...")
for root, dirs, files in os.walk(search_root):
    # Skip virtual environments and next.js folders
    if ".venv" in root or ".next" in root or "node_modules" in root or ".git" in root:
        continue
    for file in files:
        if file.endswith((".py", ".ts", ".tsx", ".json", ".env", ".cfg", ".md", ".txt")):
            path = os.path.join(root, file)
            try:
                with open(path, "r", encoding="utf-8", errors="ignore") as f:
                    for line_num, line in enumerate(f, 1):
                        if pattern.search(line):
                            print(f"{os.path.relpath(path, search_root)}:{line_num}: {line.strip()}")
            except Exception as e:
                pass
