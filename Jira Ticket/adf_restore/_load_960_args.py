import json
from pathlib import Path

payload = json.loads(
    Path(__file__).parent.joinpath("KS-960_mcp_payload.json").read_text(encoding="utf-8")
)
print(json.dumps(payload["arguments"], ensure_ascii=False))
