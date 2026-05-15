import importlib.util
import json
from pathlib import Path

append_path = Path(__file__).with_name(".tmp_jira_v14_append.py")
spec = importlib.util.spec_from_file_location("append_mod", append_path)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

desc_path = Path(__file__).with_name(".tmp_jira_v14_descriptions.json")
descriptions = json.loads(desc_path.read_text(encoding="utf-8"))

payloads = []
for key in mod.KEYS:
    existing = descriptions.get(key, "")
    if mod.MARKER in existing:
        payloads.append({"key": key, "status": "skipped", "note": "marker already present"})
        continue
    merged = existing.rstrip() + mod.build_append(key)
    payloads.append(
        {
            "key": key,
            "status": "pending",
            "fields": json.dumps({"description": merged}, ensure_ascii=False),
        }
    )

out_path = Path(__file__).with_name(".tmp_jira_v14_payloads.json")
out_path.write_text(json.dumps(payloads, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"wrote {len(payloads)} payloads to {out_path}")
