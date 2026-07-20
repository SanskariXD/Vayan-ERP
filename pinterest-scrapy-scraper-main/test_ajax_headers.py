import urllib.request
import urllib.parse
import ssl
import json
import http.cookiejar

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Create a cookie jar to persist cookies between requests
cookie_jar = http.cookiejar.CookieJar()

# Configure the opener to bypass SSL verification
opener = urllib.request.build_opener(
    urllib.request.HTTPSHandler(context=ctx),
    urllib.request.HTTPCookieProcessor(cookie_jar)
)

# 1. Visit the home page to establish cookies
home_url = "https://www.pinterest.com/"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9"
}

print("Visiting Pinterest home page...")
req = urllib.request.Request(home_url, headers=headers)
try:
    with opener.open(req, timeout=10) as resp:
        html = resp.read().decode('utf-8')
        print(f"Home page response: {resp.status} {resp.reason}")
        print("Cookies gathered:", [c.name for c in cookie_jar])
except Exception as e:
    print("Failed to load home page:", e)

# 2. Extract CSRF token from cookies if available
csrf_token = ""
for cookie in cookie_jar:
    if cookie.name == "csrftoken":
        csrf_token = cookie.value
        break

# 3. Call the AJAX resource search endpoint
query = "Silk Saree design"
options = {
    "options": {
        "isPrefetch": False,
        "query": query,
        "scope": "pins",
        "no_meta": True,
        "page_size": 25
    },
    "context": {}
}

data_str = json.dumps(options)
params = {
    "source_url": f"/search/pins/?q={urllib.parse.quote(query)}",
    "data": data_str
}

ajax_url = "https://www.pinterest.com/resource/BaseSearchResource/get/?" + urllib.parse.urlencode(params)

ajax_headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/javascript, */*, q=0.01",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": f"https://www.pinterest.com/search/pins/?q={urllib.parse.quote(query)}",
    "X-Requested-With": "XMLHttpRequest",
    "X-Pinterest-AppState": "active"
}

if csrf_token:
    ajax_headers["X-CSRFToken"] = csrf_token

print(f"\nQuerying AJAX search for '{query}'...")
req2 = urllib.request.Request(ajax_url, headers=ajax_headers)
try:
    with opener.open(req2, timeout=10) as resp2:
        content = resp2.read().decode('utf-8')
        data = json.loads(content)
        results = data.get("resource_response", {}).get("data", {}).get("results", [])
        print(f"Success! Found {len(results)} pins.")
        if results:
            print("First pin title:", results[0].get("title"))
            print("First pin image:", results[0].get("images", {}).get("orig", {}).get("url"))
except Exception as e:
    print("AJAX call failed:", e)
