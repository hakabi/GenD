"""Build merged Jira description .md + fields .json for KS-984..988."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
STORIES = Path(r"D:\source\GenD\Dynamo Server\Test Guide\dynamo_mcp_testing_stories_v1.2.md")
BLOCKS = ROOT / "E4_Jira_v1.4_description_blocks.md"

keys = ["KS-984", "KS-985", "KS-986", "KS-987", "KS-988"]
stories = STORIES.read_text(encoding="utf-8")
blocks_raw = BLOCKS.read_text(encoding="utf-8")


def extract_block(k: str) -> str:
    pat = rf"## Block for {re.escape(k)}[^\n]*\n\n(.*?)(?=\n---\n\n## Block for KS-|\Z)"
    m = re.search(pat, blocks_raw, re.DOTALL)
    if not m:
        raise SystemExit(f"Missing appendix block for {k}")
    return m.group(1).strip()


def extract_story(k: str) -> str:
    m = re.search(
        rf"### \[{re.escape(k)}\].*?(?=\n---\n\n### \[KS-|\n---\n\n## E5)",
        stories,
        re.DOTALL,
    )
    if not m:
        raise SystemExit(f"Missing story section for {k}")
    body = m.group(0).strip()
    body = body.replace(
        "**Epic:** Dynamo MCP — Security & Abuse-Case Testing",
        "**Epic:** [KS-1000](https://gendvn.atlassian.net/browse/KS-1000) — Dynamo MCP — Security & Abuse-Case Testing",
    )
    if k == "KS-986":
        body = body.replace(
            "`Dynamo MCP Security QA - Execute PIJ suite on notes, descriptions, documents, search`",
            "`Dynamo MCP Security QA - Execute PIJ suite on notes, descriptions, documents, activity`",
        )
    return body


def main() -> None:
    for k in keys:
        story = extract_story(k)
        block = extract_block(k)
        merged = story + "\n\n---\n\n" + block + "\n"
        md_path = ROOT / f"{k}_merged_jira_description.md"
        md_path.write_text(merged, encoding="utf-8")
        js_path = ROOT / f"{k}_jira_fields.json"
        js_path.write_text(json.dumps({"description": merged}, ensure_ascii=False), encoding="utf-8")
        print(k, "chars", len(merged), "->", md_path.name, js_path.name)


if __name__ == "__main__":
    main()
