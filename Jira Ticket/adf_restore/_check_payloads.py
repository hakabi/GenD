import json
from pathlib import Path

root = Path(__file__).parent
for k in ["KS-960", "KS-961", "KS-963"]:
    p = root / f"{k}_adf_push.json"
    d = json.loads(p.read_text(encoding="utf-8"))
    desc = d["description"]
    s = json.dumps(desc)
    print(k, "bytes", len(s), "mediaSingle", s.count('"type": "mediaSingle"'))
