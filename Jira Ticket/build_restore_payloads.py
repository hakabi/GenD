#!/usr/bin/env python3
"""Build Jira restore payloads: ADF for KS-960, blob-markdown for KS-961/963."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).parent
OUT = ROOT / "adf_restore"
OUT.mkdir(exist_ok=True)

KS960_BACKUP = Path(r"C:\Users\XPS 9520\.cursor\projects\d-source-GenD\agent-tools\0146e896-f9f8-44ec-8da4-ce07b974d00a.txt")
KS961_BACKUP = Path(r"C:\Users\XPS 9520\.cursor\projects\d-source-GenD\agent-tools\6f531d9b-1bc6-4fea-9067-ee027ea374f9.txt")
KS963_BACKUP = Path(r"C:\Users\XPS 9520\.cursor\projects\d-source-GenD\agent-tools\fb74b52c-d7dd-4207-bec5-ea55d3578577.txt")


def load_issue(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def extract_blob_images(desc: str) -> list[str]:
    return re.findall(r"!\[\]\(blob:[^)]+\)", desc)


def main():
    # --- KS-960: pure ADF backup (1 image) ---
    ks960 = load_issue(KS960_BACKUP)
    adf960 = ks960["fields"]["description"]
    (OUT / "KS-960_adf.json").write_text(json.dumps(adf960, ensure_ascii=False), encoding="utf-8")
    print("KS-960 ADF mediaSingle:", json.dumps(adf960).count("mediaSingle"))

    # --- KS-961: markdown with blob URLs from backup + text patches ---
    ks961_desc = load_issue(KS961_BACKUP)["fields"]["description"]
    ks961_desc = ks961_desc.replace(
        "* Apply button stores parameters in session state; Cancel discards",
        "* **Apply** — saves the current parameter values to session state and immediately triggers **KS-964** (Calculate Impact) using the new parameters **without** any hypothetical flows (empty hypothetical_trades payload). The modal closes on success. The existing hypothetical flows table rows remain untouched — they are not removed, just excluded from this specific KS-964 call.\n* **Apply with Hypothetical Flows** — saves the current parameter values to session state and immediately triggers **KS-964** (Calculate Impact) using the new parameters **together with** all currently loaded and toggled-ON hypothetical rows from the Hypothetical Flows table (KS-963). The modal closes on success.\n* **Close** — closes the modal and discards any unsaved parameter changes. No KS-964 calculation is triggered.",
    )
    ks961_desc = ks961_desc.replace(
        "The modal footer contains three buttons: **Apply** (parameters only, no hypothetical flows), **Apply with Hypothetical Flows** (parameters + loaded hypothetical rows), and **Close** (discard changes). Confirmed by Kathleen Bui (Jun 2026, KS-963 comment thread).",
        "The modal footer contains three buttons: **Apply** (parameters only, no hypothetical flows), **Apply with Hypothetical Flows** (parameters + loaded hypothetical rows), and **Close** (discard changes). Confirmed by Kathleen Bui (Jun 2026, KS-963 comment thread).",
    )
    if "Thousands separators on scaled suffix displays" not in ks961_desc:
        ks961_desc = ks961_desc.replace(
            "        * **Billion-Scale Rule**: If the calculated amount reaches or exceeds 1 Billion USD, **do not** transition to the Billions ($B) unit suffix. The system must continue using the **$M** suffix pattern uniformly (e.g., `$1,200.0M`).",
            "        * **Thousands separators on scaled suffix displays** *(Kathleen Bui, KS-939, Jun 15, 2026)*: When the calculated helper amount uses the **$K** or **$M** suffix pattern, include comma thousand separators in the numeric portion for readability. Examples:\n            * Illiquid NAV: `$5423.9M` → **`$5,423.9M`**\n            * Total Unfunded NAV: `$1198.2M` → **`$1,198.2M`**\n        * **Billion-Scale Rule**: If the calculated amount reaches or exceeds 1 Billion USD, **do not** transition to the Billions ($B) unit suffix. The system must continue using the **$M** suffix pattern uniformly (e.g., `$1,200.0M`).",
        )
        ks961_desc = ks961_desc.replace(
            "(HALF_UP rounding, micro-value handling, $K whole-number scaling, $M 1-decimal scaling, and billion-scale restriction)",
            "(HALF_UP rounding, micro-value handling, $K whole-number scaling, $M 1-decimal scaling, thousand separators on $K/$M displays, and billion-scale restriction)",
        )
    if "Scenario 5 — Thousands separator" not in ks961_desc:
        ks961_desc += """

**Scenario 5 — Thousands separator formatting (Manual Pacing helpers):**

* Given Manual Pacing is selected and the calculated Illiquid NAV helper displays a value ≥ $1,000,000 (e.g. `$5,423,900,000`)
* When the helper renders in the panel
* Then it displays as **`$5,423.9M`** (comma thousand separators in the numeric portion), not `$5423.9M`
"""
    if "Traceability — thousands separators" not in ks961_desc:
        ks961_desc = ks961_desc.replace(
            "* **Traceability:** [**KS-939**](https://gendvn.atlassian.net/browse/KS-939) Cash Forecast UI Specs (comments through 2026-04-10); **KS-963** comment thread (Jun 2026, Kathleen Bui) — dual-button footer decision (Apply / Apply with Hypothetical Flows / Close)",
            "* **Traceability — thousands separators (Kathleen Bui, KS-939, Jun 15, 2026):** Displayed dollar helper values for Illiquid NAV and Total Unfunded NAV must include comma thousand separators in $K/$M suffix formatting (e.g. `$5,423.9M`, `$1,198.2M`).\n* **Traceability:** [**KS-939**](https://gendvn.atlassian.net/browse/KS-939) Cash Forecast UI Specs (comments through 2026-06-15); **KS-963** comment thread (Jun 2026, Kathleen Bui) — dual-button footer decision (Apply / Apply with Hypothetical Flows / Close)",
        )
    (OUT / "KS-961_description.md").write_text(ks961_desc, encoding="utf-8")
    print("KS-961 blob images:", len(extract_blob_images(ks961_desc)))

    # --- KS-963: markdown with blob URLs from backup + major text patches ---
    ks963_desc = load_issue(KS963_BACKUP)["fields"]["description"]
    ks963_desc = ks963_desc.replace(
        "* **Fund** (dropdown from Solovis): **auto-populates Beta** for current Solovis funds. Do not let the user modify this value\n* If **\"New Fund\"** is selected: **additional fields for Beta** (numeric, free dp) and other required fields per `KS-949` contract\n* **Amount ($ Million):** (USD, HALF_UP, 3dp)",
        "* **+ Add Flow** button — adds a new empty row to the current scenario set. Each row represents one hypothetical cash flow entry. This is the **sole entry point** for adding both existing Solovis fund entries and new/custom fund entries.\n* **Fund** (dropdown from Solovis): **auto-populates Beta** for current Solovis funds. Do not let the user modify this Beta value. If the user types a name **not found** in Solovis, the entry is treated as a **new/custom fund** — the **Beta field** must be entered manually (numeric, free dp) per `KS-949` contract. **The inline \"+ Add New Fund\" dropdown option has been removed** to avoid UX confusion — all entries are initiated through the **+ Add Flow** button only. *(BA decision, KS-963, Jun 16, 2026)*\n* **Amount ($ Millions):** (USD, HALF_UP, 3dp)\n  * **Sign convention helper text** *(Kathleen Bui, KS-939, Jun 15, 2026)* — display inline guidance so users enter amounts with the correct sign:\n    * **Adding capital to a fund** → enter a **positive** amount (e.g. `120`)\n    * **Redeeming capital from a fund** → enter a **negative** amount (e.g. `-120`)\n  * **Placement:** a short helper line directly under the **Amount ($ Millions)** column header, or an info icon (ⓘ) next to the column label with tooltip text:\n    > *Enter a positive value to add capital to a fund and a negative value to redeem capital.*",
    )
    if "Scenario 7 — Amount sign convention" not in ks963_desc:
        ks963_desc = ks963_desc.replace(
            "**Scenario 6 — Owner Controls (Unshare):**",
            "**Scenario 6 — Owner Controls (Unshare):**",
        )
        ks963_desc += """

**Scenario 7 — Amount sign convention helper (Kathleen Bui, KS-939, Jun 15, 2026):**

* Given the Hypothetical Flows table is displayed
* When the user views the **Amount ($ Millions)** column
* Then a helper line or info-icon tooltip is visible stating: *\"Enter a positive value to add capital to a fund and a negative value to redeem capital.\"*
* And entering `120` represents adding $120M capital; entering `-120` represents redeeming $120M capital
"""
    if "Amount sign convention helper (Kathleen Bui, KS-939, Jun 15, 2026)" not in ks963_desc:
        ks963_desc = ks963_desc.replace(
            "* **Traceability:** all behaviour above is consolidated from the **KS-939** comment thread (Apr 2026) and **KS-963** comment thread (through 2026-06-01).",
            "* **Amount sign convention helper (Kathleen Bui, KS-939, Jun 15, 2026):** Inline helper text or info-icon tooltip under the Amount column clarifies positive = add capital, negative = redeem capital.\n* **Fund entry — + Add Flow button (Jerry Luo / BA, KS-963, Jun 16, 2026):** The inline \"+ Add New Fund\" option inside the Fund dropdown has been **removed** to avoid UX confusion.\n* **Traceability:** all behaviour above is consolidated from the **KS-939** comment thread (Apr–Jun 2026) and **KS-963** comment thread (through 2026-06-16).",
        )
    (OUT / "KS-963_description.md").write_text(ks963_desc, encoding="utf-8")
    print("KS-963 blob images:", len(extract_blob_images(ks963_desc)))


if __name__ == "__main__":
    main()
