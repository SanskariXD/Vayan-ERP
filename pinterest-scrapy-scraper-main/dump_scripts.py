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
        
        # Match all application/json script tags
        scripts = re.findall(r'<script id="([^"]+)" type="application/json">(.*?)</script>', html, re.DOTALL)
        for sid, content in scripts:
            print(f"\nFound JSON script ID: {sid}, length: {len(content)}")
            try:
                data = json.loads(content)
                print("Root keys:", list(data.keys())[:10])
                
                # Check for pins in this specific JSON
                results = []
                def walk(obj):
                    if isinstance(obj, dict):
                        has_image = any(k in obj for k in ("image_signature", "images", "image_url"))
                        has_id = any(k in obj for k in ("pin_id", "id"))
                        if has_id and has_image:
                            results.append(obj)
                        for v in obj.values():
                            walk(v)
                    elif isinstance(obj, list):
                        for item in obj:
                            walk(item)
                walk(data)
                print(f"Walk found {len(results)} raw items with image and id")
                if results:
                    p = results[0]
                    print("Sample item keys:", list(p.keys()))
                    print("Sample ID:", p.get("id") or p.get("pin_id"))
                    print("Sample Title:", p.get("title") or p.get("grid_title"))
            except Exception as je:
                print("JSON Parse error:", je)
except Exception as e:
    print("Error:", e)
