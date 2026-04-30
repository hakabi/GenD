# KS-982 — Test Result: Validate `search_aloha_funds` keyword search and tenant scope — **Cursor** (live)

| Field | Value |
| --- | --- |
| **Jira** | [KS-982](https://gendvn.atlassian.net/browse/KS-982) |
| **Summary** | Dynamo MCP QA — Validate `search_aloha_funds` keyword search and tenant scope |
| **Epic** | Dynamo MCP — **Functional E2E Validation** |
| **Guide** | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` **§5.6**, **§4.3**, **§9** |
| **MCP** | `conceptia-dynamo` · `https://mcp.conceptia.com/dynamo/sse` |
| **MCP server id (Cursor)** | `project-0-GenD-conceptia-dynamo` |
| **Tester / agent** | **Cursor Agent** (live tool invocation) |
| **Report date** | 2026-04-24 |

---

## 1. Executive summary

| Area | Result | Notes |
| --- | :---: | --- |
| **MCP connectivity** | **PASS** | `get_funds` and `search_aloha_funds` invoked successfully (OAuth session active). |
| **§5.6 — Scenario 1 (happy path)** | **PASS** | Keyword **`83North`** with **`is_owned_by_ks: true`**: **8** ES (solovis) rows; **`get_funds`** (`fundName: "83North"`) returned **8** rows — **same fund names** (cross-check by **Name** / **`fund_name`**). |
| **§5.6 — Scenario 2 (no match)** | **PASS** | Nonsense term → **`recordCount: 0`**, **`data: []`**, **`success: true`**, no unrelated funds. |
| **§5.6 — Scenario 3 (scope / leakage)** | **PASS** | **`is_owned_by_ks: false`**: **19** rows (**11** `source: ALB`, **`fund_type: public`** + **8** solovis **`fund_private`**). Solovis set **unchanged** vs Scenario 1; ALB rows **labeled** as public index — **no** indication of cross-tenant **private** leakage. |
| **Cross-tenant critical stop (§9)** | **N/A** | No trigger; testing **not** halted. |

**Overall (Cursor, live):** **PASS** for KS-982 §5.6 BDD **S1–S3**.

---

## 2. Test environment

| Item | Value |
| --- | --- |
| **Client** | Cursor · project MCP **`conceptia-dynamo`** (`npx` + `mcp-remote` → SSE) |
| **Tools used** | `get_funds`, `search_aloha_funds` |
| **Session** | Same OAuth session for all calls below |

---

## 3. Test execution

### 3.1 S1 — Happy path (keyword + `get_funds` cross-check)

| Field | Detail |
| --- | --- |
| **Test ID** | KS-982-S1-CUR |
| **Tools** | `search_aloha_funds`, `get_funds` |
| **Search** | `search_text: "83North"`, `is_owned_by_ks: true` |
| **`get_funds`** | `fundName: "83North"`, `limit: 100`, `offset: 0` |

**`get_funds`:** `success: true`, **8** funds, `totalRecords: 8` (fields include **`Name`**, **`FundManagerName`**, pipeline, asset class, etc.).

**`search_aloha_funds`:** `success: true`, **8** records, all **`source: "solovis"`**, **`fund_type: "fund_private"`**.

**Name alignment (all 8 solovis `fund_name` values found in `get_funds` `Name`):**

| # | `fund_name` (search) | In `get_funds` `Name` |
| ---: | --- | :---: |
| 1 | 83North V Limited Partnership | ✅ |
| 2 | 83North FXV Limited Partnership | ✅ |
| 3 | 83North IV Limited Partnership | ✅ |
| 4 | 83North FXV III Limited Partnership | ✅ |
| 5 | 83North FXV IV, L.P. | ✅ |
| 6 | 83North VI, L.P. | ✅ |
| 7 | 83North VII Limited Partnership | ✅ |
| 8 | 83North Fund VII-X L.P. | ✅ |

**Verdict:** **PASS** — ticket **Scenario 1** (*IDs/names within accessible set implied by `get_funds`* for **KS-owned** slice).

---

### 3.2 S2 — No-match keyword

| Field | Detail |
| --- | --- |
| **Test ID** | KS-982-S2-CUR |
| **Tool** | `search_aloha_funds` |
| **Search** | `search_text: "XYZNONEXISTENTFUND9999"` |

**Result:** `success: true`, `message`: “Found 0 fund record(s) from Elasticsearch.”, `data: []`, `recordCount: 0`.

**Verdict:** **PASS** — **Scenario 2** (empty / explicit zero; no junk rows).

---

### 3.3 S3 — Multi-index scope (no critical leakage)

| Field | Detail |
| --- | --- |
| **Test ID** | KS-982-S3-CUR |
| **Tool** | `search_aloha_funds` |
| **Search** | `search_text: "83North"`, `is_owned_by_ks: false` |

**Result:** **19** records:

- **11 × `source: "ALB"`**, `fund_type: "public"` (Albourne-style public listings).
- **8 × `source: "solovis"`** — same names and `fund_id` set as **§3.1** (no extra solovis rows vs `is_owned_by_ks: true`).

**Assessment:** Public ALB rows are **explicitly typed** (`public`) and **sourced**; private solovis rows **match** the KS-owned filtered search. **No** evidence of **cross-tenant private** exposure per **§9** stop rule.

**Verdict:** **PASS** — **Scenario 3** for this run.

---

## 4. Behavioral note (ES vs MSSQL — not a KS-982 failure)

With **`is_owned_by_ks: false`**, **ALB** fund names (e.g. industry listings) **may not** appear in **`get_funds`** for the same keyword. That reflects **different backends** (ES marketplace vs MSSQL portfolio), consistent with **`KS-992`** / **`KS-982 - Claude Result.md`** — **not** treated as automatic **cross-tenant** defect when **`source`** and **`fund_type`** discriminate public vs private.

---

## 5. Test matrix (§5.6)

| Test | Happy path | No match | Scope / attribution |
| --- | --- | --- | --- |
| **5.6 Search** | **P** | **P** | **P** |

---

## 6. Security findings (KS-982 scope)

| Theme | Result |
| --- | --- |
| Empty query handling | **PASS** |
| `source` / `fund_type` discrimination | **PASS** |
| Critical cross-tenant suspicion | **None observed** |

---

## 7. Defects

None opened from this run.

---

## 8. Conclusion

**KS-982** §5.6 was re-run with **live Cursor** **`conceptia-dynamo`** tools. **Scenario 1–3** **PASS**. Results align with **`KS-982 - Claude Result.md`** (same **`83North`** pattern: **8** solovis / **8** `get_funds`, **0** on nonsense term, **19** multi-index with **11** ALB + **8** solovis).

---

*Report: Cursor Agent · Guide v1.3 · Live MCP session*
