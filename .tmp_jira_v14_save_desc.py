import json
import sys
from pathlib import Path

key = sys.argv[1]
out = Path(__file__).with_name(".tmp_jira_v14_desc") / f"{key}.txt"
data = json.loads(sys.stdin.read())
desc = data.get("description") or ""
out.write_text(desc, encoding="utf-8")
print(f"saved {key} ({len(desc)} chars)")
