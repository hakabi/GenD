"""Build MCP-ready JSON payloads: ALT -> ATL in titles and bodies."""
import json
from pathlib import Path

DIR = Path(__file__).resolve().parent
CLOUD = "a5cab9f1-9fa7-40f1-9025-cd77c2fdcfb4"


def fix_body(s: str) -> str:
    s = s.replace("Skill Classification for ALT", "Skill Classification for ATL")
    s = s.replace("Skill+Classification+for+ALT", "Skill+Classification+for+ATL")
    # Document control title cell (markdown from Confluence may use * or _ for italics)
    for old, new in (
        (
            "Skill Classification for ATL — *interpreted as **ATL** (Automation Testing Lifecycle); update title in Confluence if you strictly require the acronym \"ALT\".*",
            "Skill Classification for ATL — *ATL = Automation Testing Lifecycle.*",
        ),
        (
            "Skill Classification for ATL — _interpreted as **ATL** (Automation Testing Lifecycle); update title in Confluence if you strictly require the acronym \"ALT\"._",
            "Skill Classification for ATL — _ATL = Automation Testing Lifecycle._",
        ),
    ):
        s = s.replace(old, new)
    s = s.replace(
        "for *Skill Classification for ATL* (interpreted as **ATL** in sources)",
        "for *Skill Classification for ATL*",
    )
    s = s.replace(
        "for _Skill Classification for ATL_ (interpreted as **ATL** in sources)",
        "for _Skill Classification for ATL_",
    )
    return s


def write_update(page_id: str, title: str, body: str, version: str, name: str) -> None:
    payload = {
        "cloudId": CLOUD,
        "pageId": page_id,
        "title": title,
        "body": body,
        "contentFormat": "markdown",
        "versionMessage": version,
    }
    out = DIR / f"mcp-rename-{name}.json"
    out.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    print(name, out.name, "json_bytes", out.stat().st_size)


def main() -> None:
    hub = json.loads((DIR / "mcp-update-parent-final.json").read_text(encoding="utf-8"))["body"]
    hub = fix_body(hub)
    write_update(
        "467304449",
        "Skill Classification for ATL",
        hub,
        "Rename ALT to ATL (title + body)",
        "hub",
    )

    p1 = json.loads((DIR / "mcp-update-part1-full.json").read_text(encoding="utf-8"))["body"]
    p1 = fix_body(p1)
    write_update(
        "467304478",
        "Skill Classification for ATL — Part 1 (Detailed 1–13)",
        p1,
        "Rename ALT to ATL (title + body)",
        "part1",
    )

    p2 = json.loads((DIR / "mcp-update-part2-full.json").read_text(encoding="utf-8"))["body"]
    p2 = fix_body(p2)
    write_update(
        "467337217",
        "Skill Classification for ATL — Part 2 (Detailed 14–26)",
        p2,
        "Rename ALT to ATL (title + body)",
        "part2",
    )


if __name__ == "__main__":
    main()
