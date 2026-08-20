import json
from pathlib import Path

payload = json.loads(
    (Path(__file__).parent / "KS-963_mcp_payload.json").read_text(encoding="utf-8")
)
(Path(__file__).parent / "_ks963_args_only.json").write_text(
    json.dumps(payload["arguments"], ensure_ascii=False), encoding="utf-8"
)
print("ok", len(json.dumps(payload["arguments"])))
