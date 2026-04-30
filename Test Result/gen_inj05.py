import json
s = "x" * 2000
print(json.dumps({"search_text": s}))
