"""Fetch Jira issue descriptions (ADF), merge v1.4 markdown append, write merged files for editJiraIssue."""
import json
import re
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent
APPENDS = ROOT / ".tmp_e3_appends"
OUT = ROOT / ".tmp_e3_merged_out"
OUT.mkdir(exist_ok=True)

KEYS = ["KS-978", "KS-979", "KS-980", "KS-981", "KS-982", "KS-983", "KS-993"]

cfg = json.loads((Path.home() / ".cursor" / "mcp.json").read_text(encoding="utf-8"))
env = cfg["mcpServers"]["mcp-atlassian"]["env"]
base_url = env["JIRA_URL"].rstrip("/")
auth = (env["JIRA_USERNAME"], env["JIRA_API_TOKEN"])


def adf_to_markdown(node):
    if node is None:
        return ""
    if isinstance(node, str):
        return node
    if isinstance(node, list):
        return "".join(adf_to_markdown(n) for n in node)
    node_type = node.get("type")
    content = node.get("content") or []
    if node_type == "doc":
        return adf_to_markdown(content).rstrip() + "\n"
    if node_type == "paragraph":
        t = adf_to_markdown(content)
        return t + "\n\n" if t else "\n"
    if node_type == "text":
        text = node.get("text", "")
        for mark in node.get("marks") or []:
            mt = mark.get("type")
            if mt == "strong":
                text = f"**{text}**"
            elif mt == "em":
                text = f"_{text}_"
            elif mt == "code":
                text = f"`{text}`"
            elif mt == "link":
                href = (mark.get("attrs") or {}).get("href", "")
                text = f"[{text}]({href})"
        return text
    if node_type == "heading":
        level = (node.get("attrs") or {}).get("level", 3)
        prefix = "#" * min(max(level, 1), 6)
        return f"{prefix} {adf_to_markdown(content).strip()}\n\n"
    if node_type == "bulletList":
        lines = []
        for item in content:
            if item.get("type") == "listItem":
                lines.append(f"* {adf_to_markdown(item.get('content') or []).strip()}")
        return "\n".join(lines) + "\n\n"
    if node_type == "orderedList":
        lines = []
        for i, item in enumerate(content, 1):
            if item.get("type") == "listItem":
                lines.append(f"{i}. {adf_to_markdown(item.get('content') or []).strip()}")
        return "\n".join(lines) + "\n\n"
    if node_type == "blockquote":
        inner = adf_to_markdown(content).strip()
        return "> " + inner.replace("\n", "\n> ") + "\n\n"
    if node_type == "codeBlock":
        inner = adf_to_markdown(content).rstrip("\n")
        return f"```\n{inner}\n```\n\n"
    if node_type in {"tableRow", "tableCell", "tableHeader", "listItem", "hardBreak"}:
        return adf_to_markdown(content)
    if node_type == "table":
        rows = []
        for row in content:
            if row.get("type") == "tableRow":
                cells = []
                for cell in row.get("content") or []:
                    cells.append(adf_to_markdown(cell.get("content") or []).strip())
                rows.append(cells)
        if not rows:
            return ""
        header = rows[0]
        body = rows[1:]
        out = ["| " + " | ".join(header) + " |", "| " + " | ".join(["---"] * len(header)) + " |"]
        for row in body:
            row = row + [""] * (len(header) - len(row))
            out.append("| " + " | ".join(row[: len(header)]) + " |")
        return "\n".join(out) + "\n\n"
    if node_type == "inlineCard":
        url = (node.get("attrs") or {}).get("url", "")
        return f"[{url}]({url})"
    if node_type == "rule":
        return "---\n\n"
    return adf_to_markdown(content)


def strip_old_v14(md: str) -> str:
    markers = [
        "\n\n---\n\n---\n\nUPDATED REQUIREMENTS",
        "\n\n---\n\n---\n\n## Updated requirements",
        "\n\n---\n\nUPDATED REQUIREMENTS",
        "\n\n---\n\n## Updated requirements",
        "\n---\n\nUPDATED REQUIREMENTS",
        "\n---\n\n## Updated requirements",
    ]
    best = len(md)
    for m in markers:
        i = md.find(m)
        if i != -1 and i < best:
            best = i
    return md[:best].rstrip() if best < len(md) else md.rstrip()


def main():
    for key in KEYS:
        r = requests.get(
            f"{base_url}/rest/api/3/issue/{key}",
            auth=auth,
            params={"fields": "description"},
            timeout=60,
        )
        r.raise_for_status()
        adf = r.json()["fields"]["description"]
        md = adf_to_markdown(adf)
        md = re.sub(r"\n{3,}", "\n\n", md).strip()
        base = strip_old_v14(md)
        append = (APPENDS / f"{key}.md").read_text(encoding="utf-8").strip()
        merged = base + "\n\n---\n\n---\n\n" + append
        (OUT / f"{key}.md").write_text(merged, encoding="utf-8")
        print(key, len(merged))


if __name__ == "__main__":
    main()
