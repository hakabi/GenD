#!/usr/bin/env python3
"""Push image-restored descriptions to KS-960, KS-961, KS-963 via Jira REST."""
import json
import os
import sys
from pathlib import Path

import requests

BLOB_960 = "![](blob:https://media.staging.atl-paas.net/?type=file&localId=b1b598682e79&id=041da4ab-31e1-4a72-b98b-2b94481631cf&&collection=&height=624&occurrenceKey=null&width=396&__contextId=null&__displayType=null&__external=false&__fileMimeType=null&__fileName=null&__fileSize=null&__mediaTraceId=null&url=null)"

ROOT = Path(__file__).parent
OUT = ROOT / "adf_restore"


def build_ks960() -> str:
    raw = json.loads((ROOT / "ks960_current.json").read_text(encoding="utf-8"))["description"]
    return raw.replace("PLACEHOLDER_IMAGE", BLOB_960)


def load_descriptions() -> dict[str, str]:
    ks960 = build_ks960()
    (OUT / "KS-960_description.md").write_text(ks960, encoding="utf-8")
    return {
        "KS-960": ks960,
        "KS-961": (OUT / "KS-961_description.md").read_text(encoding="utf-8"),
        "KS-963": (OUT / "KS-963_description.md").read_text(encoding="utf-8"),
    }


def jira_session():
    email = os.environ.get("JIRA_EMAIL") or os.environ.get("ATLASSIAN_EMAIL")
    token = os.environ.get("JIRA_API_TOKEN") or os.environ.get("ATLASSIAN_API_TOKEN")
    base = os.environ.get("JIRA_BASE_URL", "https://gendvn.atlassian.net")
    if not email or not token:
        return None
    s = requests.Session()
    s.auth = (email, token)
    s.headers.update({"Accept": "application/json", "Content-Type": "application/json"})
    return s, base.rstrip("/")


def verify(desc: str, key: str) -> None:
    blobs = desc.count("blob:https://media")
    broken = desc.count("](image-")
    print(f"{key}: blob_refs={blobs}, broken_filename_refs={broken}, chars={len(desc)}")


def main():
    descs = load_descriptions()
    for key, desc in descs.items():
        verify(desc, key)

    auth = jira_session()
    if auth is None:
        print("NO_JIRA_CREDS — descriptions written to adf_restore/ only")
        for key, desc in descs.items():
            (OUT / f"{key}_fields.json").write_text(
                json.dumps({"description": desc}, ensure_ascii=False), encoding="utf-8"
            )
        return 2

    session, base = auth
    for key, desc in descs.items():
        url = f"{base}/rest/api/3/issue/{key}"
        r = session.put(url, json={"fields": {"description": desc}})
        print(f"{key}: HTTP {r.status_code}")
        if r.status_code >= 400:
            print(r.text[:500])
            sys.exit(1)
    print("DONE")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
