import json
import md2adf
from pathlib import Path

md = Path(r"D:/source/GenD/.tmp_e3_merged_out/KS-982.md").read_text(encoding="utf-8")
adf = md2adf.convert(md)
s = json.dumps(adf)

def walk_empty(n, path=""):
    bad = []
    if isinstance(n, dict):
        if n.get("type") == "text" and n.get("text") == "":
            bad.append(path)
        for k, v in n.items():
            bad.extend(walk_empty(v, f"{path}/{k}"))
    elif isinstance(n, list):
        for i, x in enumerate(n):
            bad.extend(walk_empty(x, f"{path}[{i}]"))
    return bad


print("empty text nodes", walk_empty(adf)[:20])
