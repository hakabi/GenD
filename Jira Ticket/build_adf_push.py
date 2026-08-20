#!/usr/bin/env python3
"""Build ADF push payloads from Jira backup JSON (preserves mediaSingle nodes)."""
import copy
import json
from pathlib import Path

ROOT = Path(__file__).parent
OUT = ROOT / "adf_restore"
OUT.mkdir(exist_ok=True)

BACKUPS = {
    "KS-960": Path(
        r"C:\Users\XPS 9520\.cursor\projects\d-source-GenD\agent-tools\0146e896-f9f8-44ec-8da4-ce07b974d00a.txt"
    ),
    "KS-961": Path(
        r"C:\Users\XPS 9520\.cursor\projects\d-source-GenD\agent-tools\f069949d-0b6c-43be-99ce-ed3490e61290.txt"
    ),
    "KS-963": Path(
        r"C:\Users\XPS 9520\.cursor\projects\d-source-GenD\agent-tools\f1b8ae74-c946-4c62-8d76-b1c1c163b9c2.txt"
    ),
}

# Newer inline media IDs from working markdown backup (6f531d9b)
KS961_MEDIA = [
    {
        "old_id": "80afb54d-1201-44f7-bb28-c697a9667b07",
        "id": "bd7b64b5-a5b6-43bc-b6e4-8d7d46d773a3",
        "localId": "864d3a9f3f1c",
        "height": 670,
        "width": 1656,
        "mediaSingle_width": 828,
    },
    {
        "old_id": "b6de9c5f-b51e-4b71-8244-4fa7cab8923d",
        "id": "97da5f31-502c-48b4-8f40-2c785d0c7f6e",
        "localId": "e36d49300b34",
        "height": 387,
        "width": 445,
        "mediaSingle_width": 445,
    },
    {
        "old_id": "3c41b014-11a1-4c49-83d1-83002e20976e",
        "id": "68de95d5-89c6-479d-8a5e-704a8ec02892",
        "localId": "cce841bff169",
        "height": 617,
        "width": 619,
        "mediaSingle_width": 619,
    },
]


def load_adf(key: str) -> dict:
    data = json.loads(BACKUPS[key].read_text(encoding="utf-8"))
    desc = data["fields"]["description"]
    if not isinstance(desc, dict) or desc.get("type") != "doc":
        raise ValueError(f"{key}: not ADF")
    return copy.deepcopy(desc)


def walk_replace_text(node, replacements: list[tuple[str, str]]) -> None:
    if isinstance(node, dict):
        if node.get("type") == "text":
            for old, new in replacements:
                if old in node.get("text", ""):
                    node["text"] = node["text"].replace(old, new)
        for v in node.values():
            walk_replace_text(v, replacements)
    elif isinstance(node, list):
        for item in node:
            walk_replace_text(item, replacements)


def update_media_ids(doc: dict, mapping: list[dict]) -> None:
    by_old = {m["old_id"]: m for m in mapping}

    def walk(node):
        if isinstance(node, dict):
            if node.get("type") == "media":
                mid = node.get("attrs", {}).get("id")
                if mid in by_old:
                    m = by_old[mid]
                    node["attrs"]["id"] = m["id"]
                    node["attrs"]["localId"] = m["localId"]
                    node["attrs"]["height"] = m["height"]
                    node["attrs"]["width"] = m["width"]
            if node.get("type") == "mediaSingle" and node.get("content"):
                media = node["content"][0]
                if media.get("type") == "media":
                    mid = media.get("attrs", {}).get("id")
                    if mid in by_old:
                        node["attrs"]["width"] = by_old[mid]["mediaSingle_width"]
            for v in node.values():
                walk(v)
        elif isinstance(node, list):
            for item in node:
                walk(item)

    walk(doc)


def count_media(doc: dict) -> int:
    return json.dumps(doc).count('"type": "mediaSingle"')


def main():
    # --- KS-960: ADF backup + Policy Illiquid NAV text hints in user story/overview ---
    adf960 = load_adf("KS-960")
    walk_replace_text(
        adf960,
        [
            (
                "and current endowment beta in one structured view",
                "policy illiquid NAV metrics, and current endowment beta in one structured view",
            ),
            (
                "and a **footer** row for **Current Endowment Beta**.",
                "**Policy Illiquid NAV** metrics, and a **footer** row for **Current Endowment Beta**.",
            ),
        ],
    )

    # --- KS-961: ADF backup + refresh media UUIDs to current inline set ---
    adf961 = load_adf("KS-961")
    update_media_ids(adf961, KS961_MEDIA)
    walk_replace_text(
        adf961,
        [
            (
                "Apply button stores parameters in session state; Cancel discards",
                "Apply — saves parameters and triggers KS-964 without hypothetical flows; Apply with Hypothetical Flows — saves parameters and triggers KS-964 with toggled-ON rows; Close — discards changes",
            ),
        ],
    )

    # --- KS-963: full ADF backup (16 images) — structure already correct ---
    adf963 = load_adf("KS-963")

    for key, adf in [("KS-960", adf960), ("KS-961", adf961), ("KS-963", adf963)]:
        payload = {"description": adf}
        out = OUT / f"{key}_adf_push.json"
        out.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
        print(f"{key}: mediaSingle={count_media(adf)} bytes={out.stat().st_size}")


if __name__ == "__main__":
    main()
