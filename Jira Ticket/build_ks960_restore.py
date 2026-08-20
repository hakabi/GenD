#!/usr/bin/env python3
"""Build KS-960 restore markdown: Policy Illiquid text + blob image URL."""
import json
import re
from pathlib import Path

OUT = Path(__file__).parent / "adf_restore"
BLOB = "![](blob:https://media.staging.atl-paas.net/?type=file&localId=b1b598682e79&id=041da4ab-31e1-4a72-b98b-2b94481631cf&&collection=&height=624&occurrenceKey=null&width=396&__contextId=null&__displayType=null&__external=false&__fileMimeType=null&__fileName=null&__fileSize=null&__mediaTraceId=null&url=null)"

# Current broken description from Jira (Policy Illiquid NAV updates preserved)
broken = Path(__file__).parent / "ks960_current.json"
if not broken.exists():
    raise SystemExit("Run fetch first or place ks960_current.json")

desc = json.loads(broken.read_text(encoding="utf-8"))["description"]
desc = desc.replace("\\*\\*", "**").replace("\\_", "_")
desc = re.sub(
    r'!\[[^\]]*\]\(image-20260416-175957\.png\)',
    BLOB,
    desc,
)
# Normalize heading spacing
desc = re.sub(r"\n## ", r"\n\n## ", desc)
desc = re.sub(r"\n\n\n+", "\n\n", desc)

(OUT / "KS-960_description.md").write_text(desc.strip() + "\n", encoding="utf-8")
print("KS-960_description.md", len(desc))
