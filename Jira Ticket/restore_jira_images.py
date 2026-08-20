#!/usr/bin/env python3
"""Extract ADF descriptions from backup issue JSON files for image recovery."""
import json
import re
from pathlib import Path

BACKUPS = {
    "KS-960": Path(r"C:\Users\XPS 9520\.cursor\projects\d-source-GenD\agent-tools\0146e896-f9f8-44ec-8da4-ce07b974d00a.txt"),
    "KS-961": Path(r"C:\Users\XPS 9520\.cursor\projects\d-source-GenD\agent-tools\3046e4e1-27c7-4f93-bbb7-ef418cd12998.txt"),
    "KS-963": Path(r"C:\Users\XPS 9520\.cursor\projects\d-source-GenD\agent-tools\f1b8ae74-c946-4c62-8d76-b1c1c163b9c2.txt"),
}

OUT_DIR = Path(__file__).parent / "adf_restore"
OUT_DIR.mkdir(exist_ok=True)


def load_adf(key: str) -> dict:
    data = json.loads(BACKUPS[key].read_text(encoding="utf-8"))
    desc = data["fields"]["description"]
    if not isinstance(desc, dict) or desc.get("type") != "doc":
        raise ValueError(f"{key}: description is not ADF")
    return desc


def adf_text(doc: dict) -> str:
    parts = []

    def walk(node):
        if isinstance(node, dict):
            if node.get("type") == "text":
                parts.append(node.get("text", ""))
            for v in node.values():
                walk(v)
        elif isinstance(node, list):
            for item in node:
                walk(item)

    walk(doc)
    return "".join(parts)


def count_media(doc: dict) -> int:
    s = json.dumps(doc)
    return s.count('"type": "mediaSingle"')


def replace_text_in_adf(doc: dict, old: str, new: str) -> bool:
    changed = False

    def walk(node):
        nonlocal changed
        if isinstance(node, dict):
            if node.get("type") == "text" and old in node.get("text", ""):
                node["text"] = node["text"].replace(old, new)
                changed = True
            for v in node.values():
                walk(v)
        elif isinstance(node, list):
            for item in node:
                walk(item)

    walk(doc)
    return changed


def main():
    for key in BACKUPS:
        doc = load_adf(key)
        media = count_media(doc)
        print(f"{key}: mediaSingle={media}, chars={len(adf_text(doc))}")

        if key == "KS-960":
            replace_text_in_adf(
                doc,
                "and current endowment beta in one structured view",
                "policy illiquid NAV metrics, and current endowment beta in one structured view",
            )
        elif key == "KS-961":
            replace_text_in_adf(
                doc,
                "Calculating USD amounts are shown correctly (HALF_UP, whole number)",
                "Calculating USD amounts are shown correctly (HALF_UP, thousand separators on $K/$M displays)",
            )

        out = OUT_DIR / f"{key}_adf.json"
        out.write_text(json.dumps(doc, ensure_ascii=False), encoding="utf-8")
        print(f"  wrote {out}")


if __name__ == "__main__":
    main()
