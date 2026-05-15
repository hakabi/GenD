import importlib.util
import json
import sys
from pathlib import Path

append_path = Path(__file__).with_name(".tmp_jira_v14_append.py")
spec = importlib.util.spec_from_file_location("append_mod", append_path)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

key = sys.argv[1]
existing = Path(sys.argv[2]).read_text(encoding="utf-8")
if mod.MARKER in existing:
    print("SKIP")
    sys.exit(0)
merged = existing.rstrip() + mod.build_append(key)
payload = json.dumps({"description": merged}, ensure_ascii=False)
if len(sys.argv) > 3:
    Path(sys.argv[3]).write_text(payload, encoding="utf-8")
else:
    sys.stdout.buffer.write(payload.encode("utf-8"))
