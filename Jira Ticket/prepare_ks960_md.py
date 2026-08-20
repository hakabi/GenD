import re
from pathlib import Path

BLOB = "![](blob:https://media.staging.atl-paas.net/?type=file&localId=b1b598682e79&id=041da4ab-31e1-4a72-b98b-2b94481631cf&&collection=&height=624&occurrenceKey=null&width=396&__contextId=null&__displayType=null&__external=false&__fileMimeType=null&__fileName=null&__fileSize=null&__mediaTraceId=null&url=null)"

# Clean markdown from our last KS-960 update (Policy Illiquid NAV included)
desc = Path(r"d:\source\GenD\Jira Ticket\adf_restore\KS-960_source.md")
if not desc.exists():
    raise SystemExit("missing source")

text = desc.read_text(encoding="utf-8")
text = re.sub(r"!\[[^\]]*\]\(image-20260416-175957\.png\)", BLOB, text)
Path(r"d:\source\GenD\Jira Ticket\adf_restore\KS-960_description.md").write_text(text, encoding="utf-8")
print("written KS-960_description.md", len(text))
