import urllib.request
import urllib.parse
import ssl
import re

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
        
        # Search for any script tag with type="application/json" or containing PWS or other data
        scripts = re.findall(r'<script([^>]*)>(.*?)</script>', html, re.DOTALL)
        for i, (attrs, content) in enumerate(scripts):
            if "PWS" in attrs or "PWS" in content:
                print(f"Script {i} has PWS. Attrs: '{attrs}', Content Length: {len(content)}")
                print(content[:300])
            if "application/json" in attrs:
                print(f"Script {i} is JSON. Attrs: '{attrs}', Content Length: {len(content)}")
                print(content[:300])
            if "initial-state" in attrs or "initial-state" in content:
                print(f"Script {i} has initial-state. Attrs: '{attrs}'")
except Exception as e:
    print("Error:", e)
