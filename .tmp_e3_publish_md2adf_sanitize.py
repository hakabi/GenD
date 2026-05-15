"""Publish with md2adf + simple sanitization for Jira ADF."""
import copy
import json
from pathlib import Path

import md2adf
import requests

ROOT = Path(__file__).resolve().parent
MERGED = ROOT / ".tmp_e3_merged_out"
KEYS = ["KS-978", "KS-979", "KS-980", "KS-981", "KS-982", "KS-983", "KS-993"]

cfg = json.loads((Path.home() / ".cursor" / "mcp.json").read_text(encoding="utf-8"))
env = cfg["mcpServers"]["mcp-atlassian"]["env"]
base_url = env["JIRA_URL"].rstrip("/")
auth = (env["JIRA_USERNAME"], env["JIRA_API_TOKEN"])


def flatten_link_text(node):
    """Turn link marks into trailing plain URL in same text node."""
    if isinstance(node, dict):
        if node.get("type") == "text":
            marks = node.get("marks") or []
            hrefs = [(m.get("attrs") or {}).get("href", "") for m in marks if m.get("type") == "link"]
            if hrefs:
                suffix = " (" + ", ".join(hrefs) + ")"
                node = dict(node)
                node["text"] = node.get("text", "") + suffix
                node["marks"] = [m for m in marks if m.get("type") != "link"]
            return node
        out = {}
        for k, v in node.items():
            if k == "content" and isinstance(v, list):
                out[k] = [flatten_link_text(x) for x in v]
            else:
                out[k] = flatten_link_text(v)
        return out
    if isinstance(node, list):
        return [flatten_link_text(x) for x in node]
    return node


def drop_block_types(node, bad_types):
    if isinstance(node, dict):
        if node.get("type") in bad_types:
            return None
        out = {}
        for k, v in node.items():
            if k == "content" and isinstance(v, list):
                items = []
                for x in v:
                    d = drop_block_types(x, bad_types)
                    if d is not None:
                        items.append(d)
                out[k] = items
            else:
                out[k] = drop_block_types(v, bad_types)
        return out
    if isinstance(node, list):
        return [x for x in (drop_block_types(y, bad_types) for y in node) if x is not None]
    return node


def cap_headings(node, max_level=3):
    if isinstance(node, dict):
        if node.get("type") == "heading":
            node.setdefault("attrs", {})
            node["attrs"]["level"] = min(node["attrs"].get("level", 3), max_level)
        for k, v in list(node.items()):
            node[k] = cap_headings(v, max_level)
    elif isinstance(node, list):
        return [cap_headings(x, max_level) for x in node]
    return node


def main():
    for key in KEYS:
        md = (MERGED / f"{key}.md").read_text(encoding="utf-8")
        adf = copy.deepcopy(md2adf.convert(md))
        adf = drop_block_types(adf, frozenset(["rule"]))
        adf = flatten_link_text(adf)
        adf = cap_headings(adf, 3)
        r = requests.put(
            f"{base_url}/rest/api/3/issue/{key}",
            auth=auth,
            json={"fields": {"description": adf}},
            headers={"Accept": "application/json", "Content-Type": "application/json"},
            timeout=120,
        )
        print(key, r.status_code, r.text[:200] if r.status_code >= 400 else "ok")


if __name__ == "__main__":
    main()
