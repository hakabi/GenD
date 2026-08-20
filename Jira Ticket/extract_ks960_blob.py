import json
import re
from pathlib import Path

text = Path(r"C:\Users\XPS 9520\.cursor\projects\d-source-GenD\agent-tools\b8ec15b5-986f-4b10-a168-b7d01c1f7d88.txt").read_text(encoding="utf-8")
img = re.search(r"!\[\]\(blob:[^)]*041da4ab-31e1-4a72-b98b-2b94481631cf[^)]*\)", text)
print(img.group(0) if img else "NOT FOUND")
