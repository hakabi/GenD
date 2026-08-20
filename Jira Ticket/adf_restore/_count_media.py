import json
from pathlib import Path

for name in [
    "304097b4-2d95-48d3-82ee-5b0f11148449.txt",
    "ed472bcb-4410-49ce-a396-d44c4c8adbd3.txt",
]:
    p = Path(r"C:/Users/XPS 9520/.cursor/projects/d-source-GenD/agent-tools") / name
    if not p.exists():
        print(name, "missing")
        continue
    t = p.read_text(encoding="utf-8")
    count = t.count('"type": "mediaSingle"')
    print(name, "mediaSingle", count)
