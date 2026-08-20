import json
from pathlib import Path

path = Path(r"d:\source\GenD\Jira Ticket\adf_restore\KS-963_mcp_payload.json")
payload = json.loads(path.read_text(encoding="utf-8"))
args = payload["arguments"]
desc = args.get("fields", {}).get("description")
print("issueIdOrKey:", args.get("issueIdOrKey"))
print("cloudId:", args.get("cloudId"))
print("contentFormat:", args.get("contentFormat"))
print("description bytes:", len(json.dumps(desc, ensure_ascii=False).encode("utf-8")))
print("mediaSingle in payload:", json.dumps(desc).count('"type": "mediaSingle"'))
# Write args-only for MCP invocation via separate mechanism if needed
out = Path(r"d:\source\GenD\Jira Ticket\adf_restore\_963_args_runtime.json")
out.write_text(json.dumps(args, ensure_ascii=False), encoding="utf-8")
print("wrote", out, "bytes:", out.stat().st_size)
