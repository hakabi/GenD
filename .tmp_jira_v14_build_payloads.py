import importlib.util
import json
from pathlib import Path

append_path = Path(__file__).with_name(".tmp_jira_v14_append.py")
spec = importlib.util.spec_from_file_location("append_mod", append_path)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

desc_dir = Path(__file__).with_name(".tmp_jira_v14_desc")
out_dir = Path(__file__).with_name(".tmp_jira_v14_payloads")
out_dir.mkdir(exist_ok=True)

summary = []
for key in mod.KEYS:
    desc_file = desc_dir / f"{key}.txt"
    existing = desc_file.read_text(encoding="utf-8") if desc_file.exists() else ""
    if mod.MARKER in existing:
        summary.append({"key": key, "status": "skipped", "note": "marker already present"})
        continue
    merged = existing.rstrip() + mod.build_append(key)
    fields = json.dumps({"description": merged}, ensure_ascii=False)
    (out_dir / f"{key}.json").write_text(fields, encoding="utf-8")
    summary.append({"key": key, "status": "pending", "note": "payload ready"})

Path(__file__).with_name(".tmp_jira_v14_summary.json").write_text(
    json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
)
print(json.dumps(summary, indent=2))
