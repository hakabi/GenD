import json
from pathlib import Path

ROOT = Path(__file__).parent


def push_key(key: str) -> dict:
    args = json.loads((ROOT / f"{key}_call.json").read_text(encoding="utf-8"))
    desc = args["fields"]["description"]
    return {
        "key": key,
        "nodes": len(desc["content"]),
        "mediaSingle_in_payload": json.dumps(desc).count('"type": "mediaSingle"'),
        "args": args,
    }


if __name__ == "__main__":
    import sys
    key = sys.argv[1]
    info = push_key(key)
    print(json.dumps({k: v for k, v in info.items() if k != "args"}))
    (ROOT / f"{key}_full_args.json").write_text(
        json.dumps(info["args"], ensure_ascii=False), encoding="utf-8"
    )
