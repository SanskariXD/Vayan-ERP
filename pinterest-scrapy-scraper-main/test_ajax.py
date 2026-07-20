import urllib.request
import urllib.parse
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

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

url = "https://www.pinterest.com/resource/BaseSearchResource/get/?" + urllib.parse.urlencode(params)

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/javascript, */*, q=0.01",
    "X-Requested-With": "XMLHttpRequest"
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req, context=ctx) as response:
        content = response.read().decode('utf-8')
        data = json.loads(content)
        # Check if we got results
        results = data.get("resource_response", {}).get("data", {}).get("results", [])
        print(f"Success! Found {len(results)} pins.")
        if results:
            print("First pin title:", results[0].get("title"))
            print("First pin image:", results[0].get("images", {}).get("orig", {}).get("url"))
except Exception as e:
    print("Error:", e)
