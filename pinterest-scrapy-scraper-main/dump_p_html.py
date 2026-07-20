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
        print(f"HTML size: {len(html)} bytes")
        
        # Look for script tags containing PWS_INITIAL_DATA or initial-state
        matches = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
        print(f"Found {len(matches)} script tags.")
        for i, script in enumerate(matches):
            if "__PWS_INITIAL_DATA__" in script or "initial-state" in script or "resourceResponses" in script:
                print(f"Script {i} contains key data! Length: {len(script)}")
                print(script[:500])
except Exception as e:
    print("Error:", e)
