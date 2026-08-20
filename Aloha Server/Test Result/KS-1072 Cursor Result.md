# KS-1072 Cursor Result — Verify fund search and resolution

> **Story:** [KS-1072](https://gendvn.atlassian.net/browse/KS-1072) · **Draft ID:** AM-03 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**  
> **Client:** Cursor IDE / `user-conceptia-aloha` (native HTTP)  
> **Tester:** Bình Hà Khoa  
> **Executed:** 2026-08-07 ~03:39–03:44 UTC  
> **Status:** **PASS WITH FINDINGS**

---

## Verdict summary

| Area | Result | Notes |
|---|---|---|
| Exact-name → fund 500 / solovis | **P** | `Search_Funds`, `search_funds`, `search_all_funds` |
| Ambiguous `"Citadel Investment"` candidate set | **P** | 4 ALB funds recorded (order: 986, 4874, 104766, 200055) |
| `search_funds` ≡ `Search_Funds` (O5) | **P** | Identical results on exact + ambiguous fixtures |
| `fund_id` type consistency (O6) | **F** | Strings in `Search_Funds` / `search_funds`; **numbers** in `search_all_funds` for ALB ids |
| Non-existent `99999999` | **P** | Explicit error, not silent empty success |
| Empty / whitespace | **P** | `search_text is required.` — does **not** dump full set |
| Special characters `!@#$%` | **F*** | No crash, but **success with count=320** (large result set) |
| `search_albourne_funds` on Solovis-only name | **P** | Clear “No Albourne funds found…” |
| `search_crbm_index("S&P 500")` | **P** | 16 indices; includes `SPTR Index.USD` / “S&P 500 Index” |

\*Special-char behaviour is usable (no server crash) but fails the spirit of “handled without returning junk/unbounded results.”

**Overall:** **Pass with findings** — core resolution fixtures work; O6 + special-char volume are defects to triage.

---

## Acceptance criteria matrix

| # | Criterion | Result |
|---|---|---|
| AC1 Exact-name → 500 / solovis | **P** |
| AC2 Ambiguous set recorded | **P** |
| AC3 Consistency across tools | **P** with documented divergence (ALB-only tool; type O6) |
| AC4 O5 alias pair | **P** identical |
| AC5 O6 fund_id type | **F** |
| AC6 Non-existent term explicit error | **P** |
| AC7 Empty/whitespace not full dump | **P** |
| AC8 Special / long input no raw crash | **P** no crash; **F** special returns 320 hits |
| AC9 Solovis reachable | **P** via exact-name tools |
| AC10 CRBM name → id | **P** |

---

## Result matrix (Cursor)

### Exact name: `"Citadel Kensington Global Strategies"`

| Tool | Status | Count / note | fund_id | Type | Source |
|---|---|---|---|---|---|
| `Search_Funds` | success | 1 | `"500"` | string | solovis |
| `search_funds` | success | 1 | `"500"` | string | solovis |
| `search_all_funds` | success | 1 | `"500"` | string | solovis |
| `search_albourne_funds` | error | No Albourne funds found… | — | — | — |

### Ambiguous: `"Citadel Investment"`

| Tool | Status | Candidates (order) |
|---|---|---|
| `Search_Funds` | success count=4 | `"986"` ANTAEUS…; `"4874"` Citadel Jackson…; `"104766"` …; `"200055"` … — all **ALB**, string ids |
| `search_funds` | success count=4 | Same order/ids as `Search_Funds` (string) |
| `search_all_funds` | success total=4 | Same 4 funds; **`fund_id` as numbers** `986`, `4874`, `104766`, `200055` |

**Note vs 2026-08-05 probe:** top hit is now **986** (ANTAEUS), not 4874. Candidate *set* still matches plan fixtures; ranking changed.

### Negatives / edges (`Search_Funds`)

| Input | Status | Message / note |
|---|---|---|
| `99999999` | error | `No funds found matching '99999999' in Elasticsearch indexes.` |
| `""` | error | `search_text is required.` |
| `"   "` (whitespace) | error | `search_text is required.` |
| `!@#$%` | **success** | **count=320** funds returned (sample starts Activa II…) — evidence: `logs/KS-1072_special_chars.txt` (40,390 bytes) |

### CRBM

| Input | Result |
|---|---|
| `search_crbm_index(names=["S&P 500"])` | success, `row_count=16`; includes `SPTR Index.USD` = “S&P 500 Index” |

---

## Findings

| ID | Finding | Severity |
|---|---|---|
| **O6** | `fund_id` type inconsistent: string in `Search_Funds`/`search_funds`, number in `search_all_funds` (ALB matches) | Medium |
| **NEW-S1** | `Search_Funds("!@#$%")` returns **320** funds instead of empty/error | Medium |
| O5 | Aliases still present and behaviourally identical on tested fixtures | Info (catalog debt) |

---

## Evidence

| Artifact | Path |
|---|---|
| Special-char response | `Aloha Server/Test Result/logs/KS-1072_special_chars.txt` |
| This report | `Aloha Server/Test Result/KS-1072 Cursor Result.md` |

---

## Recommendation

- Close Cursor leg as **Pass with findings**.
- Carry **O6** and special-char volume into AM-10 / AM-14 triage.
- Ready to proceed to KS-1073 (`fund_analyzer`) — ambiguous ranking now prefers **986**.
