import urllib.request
import urllib.parse
import ssl
import re
import json

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

query = "Silk Saree design"
url = f"https://www.pinterest.com/search/pins/?q={urllib.parse.quote(query)}"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9"
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req, context=ctx) as response:
        html = response.read().decode('utf-8')
        
        # Match <script id="__PWS_DATA__" type="application/json">...</script>
        match = re.search(r'<script id="__PWS_DATA__"[^>]*>(.*?)</script>', html, re.DOTALL)
        if match:
            js_content = match.group(1)
            print(f"Extracted __PWS_DATA__ of length {len(js_content)}")
            data = json.loads(js_content)
            
            # Let's inspect the keys at the root
            print("Root keys:", list(data.keys()))
            
            # Let's recursively search for pin-like objects (having images/id)
            def walk_json(obj, results):
                if isinstance(obj, dict):
                    has_image = any(k in obj for k in ("image_signature", "images", "image_url"))
                    has_id = any(k in obj for k in ("pin_id", "id"))
                    # Make sure it's a real pin (usually id is numeric string and length > 5)
                    if has_id and has_image:
                        pid = str(obj.get("pin_id") or obj.get("id"))
                        if pid.isdigit() and len(pid) > 5:
                            results.append(obj)
                    for k, v in obj.items():
                        walk_json(v, results)
                elif isinstance(obj, list):
                    for item in obj:
                        walk_json(item, results)
            
            pins = []
            walk_json(data, pins)
            # De-duplicate by pin_id
            unique_pins = {}
            for p in pins:
                pid = str(p.get("pin_id") or p.get("id"))
                unique_pins[pid] = p
            
            print(f"Found {len(unique_pins)} unique pins!")
            for idx, (pid, p) in enumerate(list(unique_pins.items())[:3]):
                print(f"\nPin {idx+1}: ID={pid}")
                print(f"Title: {p.get('title') or p.get('grid_title')}")
                print(f"Description: {p.get('description')}")
                images = p.get("images", {})
                orig_url = images.get("orig", {}).get("url") if isinstance(images, dict) else None
                print(f"Image: {orig_url or p.get('image_url')}")
        else:
            print("Could not find __PWS_DATA__ tag.")
except Exception as e:
    print("Error:", e)
