"""Read MCP edit args JSON; write copy to out path (utf-8)."""
import sys
from pathlib import Path

src = Path(sys.argv[1])
out = Path(sys.argv[2]) if len(sys.argv) > 2 else None
text = src.read_text(encoding="utf-8")
if out:
    out.write_text(text, encoding="utf-8")
    print(out.stat().st_size)
else:
    sys.stdout.buffer.write(text.encode("utf-8"))
