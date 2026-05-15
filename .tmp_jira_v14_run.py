import importlib.util
import json
from pathlib import Path

append_path = Path(__file__).with_name(".tmp_jira_v14_append.py")
spec = importlib.util.spec_from_file_location("append_mod", append_path)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

desc_path = Path(__file__).with_name(".tmp_jira_v14_descriptions.json")
descriptions = json.loads(desc_path.read_text(encoding="utf-8"))

out = []
for key in mod.KEYS:
    existing = descriptions.get(key)
    if existing is None:
        out.append({"key": key, "action": "missing", "note": "description not in input file"})
        continue
    if mod.MARKER in existing:
        out.append({"key": key, "action": "skip", "note": "marker already present"})
        continue
    merged = existing.rstrip() + mod.build_append(key)
    out.append({"key": key, "action": "update", "fields": json.dumps({"description": merged}, ensure_ascii=False)})

Path(__file__).with_name(".tmp_jira_v14_run_out.json").write_text(
    json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8"
)
for row in out:
    print(f"{row['key']}\t{row['action']}\t{row.get('note', '')}")
