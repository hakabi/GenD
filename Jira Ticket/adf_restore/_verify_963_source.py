import json
from pathlib import Path

def count_ms(o):
    c = 0
    if isinstance(o, dict):
        if o.get("type") == "mediaSingle":
            c += 1
        for v in o.values():
            c += count_ms(v)
    elif isinstance(o, list):
        for i in o:
            c += count_ms(i)
    return c

push = json.loads(Path("KS-963_adf_push.json").read_text(encoding="utf-8"))
call = json.loads(Path("KS-963_call.json").read_text(encoding="utf-8"))
print("source mediaSingle:", count_ms(push["description"]))
print("call mediaSingle:", count_ms(call["fields"]["description"]))
print("match:", push["description"] == call["fields"]["description"])
