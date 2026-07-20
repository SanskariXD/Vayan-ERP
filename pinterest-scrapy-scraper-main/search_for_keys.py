import os
import re

search_dir = r"x:\Handloom Hackahton"
pattern = re.compile(r"scrapeops|f7308163|api_key|api-key", re.IGNORECASE)

print("Searching files for API key mentions...")
count = 0
for root, dirs, files in os.walk(search_dir):
    # Skip virtual env and next.js build dirs
    if any(p in root for p in [".venv", "node_modules", ".next", ".git"]):
        continue
    for file in files:
        if file.endswith(('.py', '.ts', '.tsx', '.js', '.json', '.txt', '.sh', '.env', '.local')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    for line_num, line in enumerate(f, 1):
                        if pattern.search(line) and "YOUR_SCRAPEOPS" not in line and "Your API Key" not in line:
                            print(f"{path}:{line_num} -> {line.strip()}")
                            count += 1
            except Exception as e:
                pass

print(f"Done. Found {count} potential matches.")
