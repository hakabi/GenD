# KS-978 — Test Result: Validate fund description and ratings (§5.2) — **Cursor**

| Field | Value |
| --- | --- |
| **Jira** | [KS-978](https://gendvn.atlassian.net/browse/KS-978) |
| **Epic** | [KS-999](https://gendvn.atlassian.net/browse/KS-999) — Dynamo MCP — **Functional E2E Validation** |
| **Guide** | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` **§5.2** |
| **MCP** | `conceptia-dynamo` |
| **Tester / agent** | **Cursor Agent** (live tool invocation) |
| **MCP default user (per program)** | `binh.ha@conceptia.com` — used as `user` on `get_rating_details` where the tool requires it (equivalent to server **`MCP_DEFAULT_USER_EMAIL`**) |
| **Report date** | 2026-04-24 |
| **Merge status** | Superseded by **`KS-978 Result.md`** (merged with **`KS-978 - Claude Result.md`**). |

---

## 1. Executive summary

**Requirement:** For a **known fund** from the black-box baseline, validate **`get_fund_description`**, **`get_rating_summary`**, and **`get_rating_details`** for internal consistency, explicit nulls, and payload-level date/time clarity — no UI comparison.

| Area | Result | Notes |
| --- | --- | --- |
| **Tool chain & baseline** | **PASS** | Baseline: **`59 North Partners, LP`**. Rating **id** from **`search_aloha_funds`** (`search_text: "59 North"`) — **solovis** **`fund_id` = `28582`**. |
| **Name / manager / description vs `get_funds`** | **PASS** | **Name** and **`FundManagerName`** match across `get_funds` and `get_fund_description`. **`get_rating_summary.rating_name`** matches **fund** **Name**. |
| **`get_rating_details`** | **PASS (contract)** | With **`user: binh.ha@conceptia.com`**: **`success: true`**, **`message`**: “Rating details retrieved.” **`data`**: **`[]`** (no detail rows for this user/fund in FAD — **not** a tool error; no fabricated rows). |
| **§5.2 — Scenario 2** | **PASS** | Bad name / bad id → empty **`data`**, no cross-tenant payload in probes. |
| **§5.2 — Scenario 3** | **PASS (sampled)** | **`null`** on nullable `get_funds` fields; empty arrays where applicable. |

**Overall (Cursor):** **PASS** for **tool contract** and **non-contradiction** between description, summary, and `get_funds`. **Details** call **succeeds** with program user email; **row count is zero** — if QA expects **non-empty** detail lines for this fund, treat as a **data / fixture** check outside MCP behavior.

**Tools invoked:** `get_funds`, `search_aloha_funds`, `get_fund_description`, `get_rating_summary`, `get_rating_details` (with **`user`**).

---

## 2. Ticket traceability (Cursor)

| Theme | Evidence |
| --- | --- |
| §5.2 prompt (full details) | `get_fund_description` + `get_rating_summary` + `get_rating_details` with shared **`id`** / **`source`** / **`type`**. |
| Consistency | Summary scores present; **details** list empty — **no** conflicting detail rows. |
| “FUND_ID” | **`get_funds`** has no single public **`FUND_ID`**; use **ES `fund_id`** + **name** (see **§5**). |
| `user` for details | Per program: **`binh.ha@conceptia.com`**. |

---

## 3. Test environment

| Item | Value |
| --- | --- |
| Client | Cursor Agent · **`user-conceptia-dynamo`** |
| `get_rating_details` user | `binh.ha@conceptia.com` |
| Baseline fund | **59 North Partners, LP** |
| Rating id | `28582` · `source`: `solovis` · `type`: `fund` |

---

## 4. Scenario 1 — Happy path (§5.2)

### 4.1 `get_funds` (context)

**Request:** `get_funds` · `limit: 3`, `offset: 0`.

**59 North row (highlights):** **`Name`**: `59 North Partners, LP` · **`FundManagerName`**: `59 North Capital Management` · **`PipelineStatus`**: `P - Portfolio` · **`AuditorName`**: `null`.

### 4.2 `search_aloha_funds`

**Request:** `search_text`: `"59 North"`.

**Use:** **solovis** hit `fund_id` **`"28582"`**, `fund_name` **`59 North Partners, LP`**.

### 4.3 `get_fund_description`

**Request:** `fundName`: `59 North Partners, LP` · `limit`: 5.

- **`ID`**: `D7879DB7-E230-4191-8849-DE4B7B64626C`
- **`Name` / `FundManagerName`**: align with `get_funds`
- **`Description`**: non-empty text (value-oriented equity l/s)

### 4.4 `get_rating_summary`

**Request:** `id`: `28582`, `source`: `solovis`, `type`: `fund`.

**Summary row:** `rating_name` **59 North Partners, LP** · `total_rating` **6** · `average_conviction` **5** (and other score fields) — **no** conflict with name/manager.

### 4.5 `get_rating_details`

**Request:** `id`: `28582`, `source`: `solovis`, `type`: `fund`, **`user`**: `binh.ha@conceptia.com`.

**Result:** **`success: true`** · **`data`: `[]`**

**Interpretation:** Tool accepts the user and returns **no** detail rows. **Not** a missing-`user` failure. If product QA expects at least one detail line, verify **FAD** data for this **fund + user**; MCP layer behaved correctly.

---

## 5. Scenario 2 — Error / empty input

| Case | Outcome |
| --- | --- |
| `get_fund_description` · `fundName`: `ZZZ_NONEXISTENT_FUND_XYZ` | `success: true` · `data: []` |
| `get_rating_summary` · `id`: `999999999` | `success: true` · `data: []` |

**Verdict:** **PASS** — controlled empty results.

---

## 6. Identifier note (F-01)

- **`get_fund_description`**: Dynamo **`ID`** (Guid).
- **`get_rating_*`**: **Elasticsearch** **`fund_id`** (here **`28582`**) from **`search_aloha_funds`**.
- **`get_funds`**: no **`FundId`** in observed payload (same class as **KS-977-F-01**).

**Black-box “same fund”** for this run: **name + manager + search chain**.

---

## 7. Findings (Cursor)

| ID | Topic | Severity |
| --- | --- | --- |
| **KS-978-F-01** | Multiple **ID** shapes vs ticket wording “**FUND_ID**” | Low / doc–payload |
| **KS-978-F-02** | **`get_rating_details`** returned **empty** `data` for **`binh.ha@conceptia.com`** on **`28582`** | Info / data (if non-empty required) |
| **KS-978-F-03** | Invalid id → **soft empty** (`success: true`, empty array) | Info |

---

## 8. BDD (Cursor)

| Scenario | Result |
| --- | ---: |
| 1 — Happy path | **PASS** |
| 2 — Error path | **PASS** |
| 3 — Nulls explicit | **PASS** (sampled) |

---

## 9. Paste-ready Jira comment (Cursor)

*KS-978 **§5.2 (Cursor)**: **PASS** on **`get_funds`**, **`search_aloha_funds`**, **`get_fund_description`**, **`get_rating_summary`** for **59 North** / **`28582` (solovis)**. **`get_rating_details`** with **`user=binh.ha@conceptia.com`**: **success, empty** `data`. Scenarios 2–3 **PASS** on samples. **Merged:** `KS-978 Result.md`.*

---

## 10. References

| Document | Path |
| --- | --- |
| This Cursor run | `Dynamo Server/Test Result/KS-978 - Cursor Result.md` |
| QA guide §5.2 | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` |
| Merged result | `Dynamo Server/Test Result/KS-978 Result.md` |

---

## 11. Appendix — payloads

### `get_rating_details` (with user)

```json
{
  "success": true,
  "message": "Rating details retrieved.",
  "data": []
}
```

### `get_rating_summary` (59 North, `28582`)

```json
{
  "success": true,
  "message": "Rating summary retrieved.",
  "data": [
    {
      "id": "28582",
      "rating_name": "59 North Partners, LP",
      "source": "solovis",
      "type": "fund",
      "edge": 6,
      "organization": 6,
      "track_record": 6,
      "total_rating": 6,
      "average_conviction": 5
    }
  ]
}
```

### `get_fund_description` (core)

```json
{
  "ID": "D7879DB7-E230-4191-8849-DE4B7B64626C",
  "Name": "59 North Partners, LP",
  "FundManagerName": "59 North Capital Management",
  "Description": "Global equity l/s manager with value orientation. Focus is on cash generative and asset based businesses."
}
```
