import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from importlib import import_module

mod = import_module(".tmp_jira_v14_append".replace("/", ".").lstrip("."))
# direct import workaround
exec(Path(r"D:\source\GenD\.tmp_jira_v14_append.py").read_text(encoding="utf-8"), globals())

descriptions = json.loads(Path(r"D:\source\GenD\.tmp_jira_v14_descriptions.json").read_text(encoding="utf-8"))
results = []
for key in KEYS:
    existing = descriptions.get(key) or ""
    if MARKER in existing:
        results.append({"key": key, "action": "skip", "note": "marker already present"})
        continue
    merged = existing.rstrip() + build_append(key)
    results.append({"key": key, "action": "update", "description": merged})

Path(r"D:\source\GenD\.tmp_jira_v14_batch_out.json").write_text(json.dumps(results, ensure_ascii=False), encoding="utf-8")
print(json.dumps([{k: r[k] for k in r if k != "description"} for r in results], indent=2))
