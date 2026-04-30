# KS-982 — Final Result: Validate `search_aloha_funds` keyword search and tenant scope (§5.6)

| Field | Value |
| --- | --- |
| **Jira** | [KS-982](https://gendvn.atlassian.net/browse/KS-982) |
| **Epic** | KS-999 — Dynamo MCP — **Functional E2E Validation** |
| **Guide** | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` **§5.6** (Search), **§4.3** (behavioral `search_aloha_funds` vs `get_funds`), **§9** (stop on cross-tenant suspicion) |
| **MCP** | `conceptia-dynamo` · `https://mcp.conceptia.com/dynamo/sse` |
| **Sources merged** | `KS-982 - Claude Result.md` (**Claude** · claude.ai) · `KS-982 - Cursor Result.md` (**Cursor Agent** · live MCP) |
| **Consolidation date** | 2026-04-24 |

---

## 1. Executive summary

**Ticket:** Validate **`search_aloha_funds`** for **keyword relevance**, **tenant / scope** behavior, and **black-box** consistency with **`get_funds`** (no Dynamo UI). **§9:** suspected **cross-tenant** leakage → stop and file **critical**.

| Area | Claude | Cursor | Merged |
| --- | :---: | :---: | --- |
| **Scenario 1 — Happy path** (`83North`, `is_owned_by_ks: true` vs `get_funds`) | ✅ PASS | ✅ PASS | **PASS** — **8** solovis rows; **8** `get_funds` rows; **name** alignment **8/8** |
| **Scenario 2 — No-match** (`XYZNONEXISTENTFUND9999`) | ✅ PASS | ✅ PASS | **PASS** — `recordCount: 0`, `data: []`, `success: true` |
| **Scenario 3 — Multi-index / scope** (`83North`, `is_owned_by_ks: false`) | ✅ PASS | ✅ PASS | **PASS** — **19** rows (**11** ALB **`public`** + **8** solovis **`fund_private`**); solovis set **unchanged** vs S1 |
| **§9 cross-tenant stop** | Not triggered | Not triggered | **N/A** — **no** critical leakage signal in either run |
| **Security table (§5.6 scope)** | ✅ No critical findings | ✅ Consistent | **PASS** |

**Overall:** **PASS** for KS-982 **§5.6** on **two independent clients**. Core numeric and structural outcomes **match** between sources (same search terms and counts).

---

## 2. Client coverage

| Client | Role in this package |
| --- | --- |
| **Claude** | **977** total funds baseline via `get_funds`; full **S1–S3** tables; extra **keyword relevance** probe **`Accel`** (**101** hits); **schema / ID-space** notes (ALB int vs solovis string `fund_id`) |
| **Cursor** | Live **`project-0-GenD-conceptia-dynamo`**; explicit `get_funds` **`limit: 100`** on filtered query; **ES vs MSSQL** behavioral note (**`KS-992`** alignment); test IDs **KS-982-S1/S2/S3-CUR** |

---

## 3. Test environment (combined)

| Item | Claude | Cursor |
| --- | --- | --- |
| **Client** | Claude.ai (web) | Cursor Agent · workspace MCP |
| **Transport** | `conceptia-dynamo` / SSE URL | `npx` + `mcp-remote` → same SSE URL |
| **OAuth** | Microsoft / Azure AD (Claude session) | Microsoft / Azure AD (Cursor session) |
| **Baseline** | **977** funds (unfiltered `get_funds` total) | Filtered cross-check: **`fundName: "83North"`** → **8** rows |
| **S1 / S3 keyword** | `83North` | `83North` |
| **S2 keyword** | `XYZNONEXISTENTFUND9999` | `XYZNONEXISTENTFUND9999` |

---

## 4. Scenario 1 — Happy path (merged)

**Aligned outcome:** **`search_aloha_funds`** (`search_text: "83North"`, **`is_owned_by_ks: true`**) returns **8** **`source: solovis`** records; **`get_funds`** with **`fundName: "83North"`** returns **8** rows; every **`fund_name`** matches a **`Name`** in `get_funds`.

**Solovis hits (same eight names in both reports):**

| `fund_id` (solovis) | `fund_name` |
| --- | --- |
| 86 | 83North V Limited Partnership |
| 179 | 83North FXV Limited Partnership |
| 232 | 83North IV Limited Partnership |
| 391 | 83North FXV III Limited Partnership |
| 451 | 83North FXV IV, L.P. |
| 452 | 83North VI, L.P. |
| 21768 | 83North VII Limited Partnership |
| 30746 | 83North Fund VII-X L.P. |

**Merged verdict:** **PASS** — ticket **Scenario 1** (accessible set implied by **`get_funds`** for the **KS-owned** slice, by **name** cross-check).

---

## 5. Scenario 2 — No-match (merged)

**Aligned outcome:** **`search_aloha_funds`** with **`XYZNONEXISTENTFUND9999`** → **`success: true`**, message *Found 0 fund record(s) from Elasticsearch.*, **`data: []`**, **`recordCount: 0`** — **no** unrelated funds.

**Merged verdict:** **PASS**.

---

## 6. Scenario 3 — Multi-index / leakage (merged)

**Aligned outcome:** **`search_aloha_funds`** (`"83North"`, **`is_owned_by_ks: false`**) → **19** records:

| Source | Count | Notes |
| --- | ---: | --- |
| **ALB** | **11** | **`fund_type: public`** — industry / Albourne-style listings (**Claude** narrative) |
| **solovis** | **8** | Same set as Scenario 1 — **no** extra solovis rows when widening index scope |
| **aevest / evest** | **0** | For this keyword (**Claude** breakdown) |

**Interpretation (both):** ALB vs solovis distinguished by **`source`** and **`fund_type`**; **no** evidence of **private cross-tenant** exposure; **§9** stop **not** invoked.

**Merged verdict:** **PASS**.

---

## 7. Additional observations (Claude + Cursor)

| Topic | Detail |
| --- | --- |
| **Keyword relevance (Claude only)** | **`Accel`** → **101** records across ALB / solovis / aevest / evest; results **on-topic**; **`source`** attribution clear |
| **Schema / IDs (Claude)** | Core fields stable: `fund_id`, `fund_name`, `manager_id`, `manager_name`, `source`, `fund_type`, `group_by`; ALB **`fund_id`** (e.g. large int **456147**) vs solovis **string** IDs — **different ID spaces**, expected |
| **ES vs MSSQL scope (Cursor)** | With **`is_owned_by_ks: false`**, some **ALB** names **may not** appear in **`get_funds`** — **backend difference**, not automatic **cross-tenant** failure; aligns with **`KS-992`** / program docs |

---

## 8. Test matrix (§5.6)

| Test | Happy path | Invalid / no match | Cross-tenant / scope |
| --- | :---: | :---: | :---: |
| **5.6 Search** | **P** | **P** | **P** |

---

## 9. Security findings (merged)

| Category | Merged status |
| --- | :---: |
| Tenant isolation (solovis set stable across flags) | **PASS** |
| Source attribution (`source`, `fund_type`) | **PASS** |
| Empty result handling | **PASS** |
| Cross-tenant private leakage | **None detected** |

**No critical findings** from either source report.

---

## 10. Defects / open items

**None** raised from **KS-982** §5.6 runs in **Claude** or **Cursor** source reports.

---

## 11. Conclusion

**KS-982** §5.6 is **complete** and **PASS** when **Claude** and **Cursor** results are merged: **Scenario 1–3** agree on **counts**, **separation** of **ALB** vs **solovis**, and **clean** empty search behavior. **`is_owned_by_ks`** correctly restricts to **solovis**; default multi-index mode returns **labeled** public and private rows without a **§9**-class signal.

**Deep dive / per-client artifacts:** **`KS-982 - Claude Result.md`** (baseline **977**, **Accel** probe, extended security table) · **`KS-982 - Cursor Result.md`** (Cursor MCP id, **`KS-992`** scope note).

---

*Guide version: 1.3 · Consolidated from Claude + Cursor KS-982 reports*
