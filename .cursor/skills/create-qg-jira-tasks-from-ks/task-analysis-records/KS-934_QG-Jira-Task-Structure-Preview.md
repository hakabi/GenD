# QG Jira Breakdown Preview — Cash Forecast
**Source Tickets:** KS-934, KS-939, KS-949  
**Target Epic:** QG-83 — Cash Forecast - UI & Functional Testing  
**Date:** 2026-03-26  
**Status:** Updated to reflect strict QA formatting standards (Epic, Parent, Sub-task)

> **Note:** No new Epic was created. All Parent Tasks and Sub-tasks are linked to the existing Epic **QG-83**. The descriptions below represent the exact strict QA formatting injected into Jira.

---

## 🏠 Epic: QG-83 (existing)
**Summary:** Cash Forecast - UI & Functional Testing

**Description:**
*Epic Overview:*
This epic covers all UI verifications, functional testing, and data validation (including backend API and datalake loads) for the Cash Forecast feature.

*Scope:*
- Datalake daily ingestion and time-series logic
- Backend compute server APIs and logic
- Frontend Dashboard UI, combination charts, and details tables
- Historical Flows UI and interactive filters

*Preconditions:*
- Cash Forecast feature is deployed to the test environment
- [TBD - User needs to define specific preconditions]

*Exit Criteria:*
- All related parent stories and sub-tasks are executed and pass
- [TBD - User needs to define specific exit criteria]

---

## 📋 Parent Task 1: Cash Forecast - Datalake & Data Loading Verification
**Type:** Story  
**Assignee:** Ly Nguyen  
**Sprint:** Active Sprint  

**Description:**
*Test Objective:*
Verify that all scheduled data ingestion jobs for the Cash Forecast feature load the correct data into the datalake via Solovis APIs on a daily basis (Mon–Fri, 12pm EST), with correct replacement/retention logic per data component.

*Preconditions:*
- API and Datalake systems are accessible
- [TBD - User needs to define specific preconditions]

*Test Steps:*
1. [TBD - User needs to define specific test steps]

*Expected Result:*
- Future cash flows, historical capital calls, distributions, unfunded, and NAVs are loaded successfully.
- Retention logic (e.g., 30-day trailing, 36-month rolling, 60-month MTD) works per component definition.

### Sub-tasks:
1. **Verify Future Cash Flow daily ingest**
   *Test Objective:* Verify that the Future Cash Flows datalake table is fully wiped and reloaded each weekday with future-dated transactions up to 1 year ahead.
   *Expected Result:* Table contains transactions up to ~365 days in the future. Fields: `transaction_id`, `fund_id`, etc. are valid.

2. **Verify Daily Average Cash Flow calculation & storage**
   *Test Objective:* Verify trailing 30-day/90-day net cash flow totals and daily averages are correctly computed and stored.
   *Expected Result:* Each day produces a new record; prior days are untouched.

3. **Verify Historical Capital Calls/Distributions by Asset Class**
   *Test Objective:* Verify 60-month initial load and daily MTD overwrite logic.
   *Expected Result:* MTD value is overwritten daily; month-end value is retained permanently.

4. **Verify Historical Capital Calls/Distributions by Fund (30-day window)**
   *Test Objective:* Verify 30-day rolling window storage and filtering.
   *Expected Result:* Only the last 30 days are retained; rows with `net_cash_in = 0 or NaN` are dropped.

5. **Verify Historical Unfunded & NAVs by Asset Class**
   *Test Objective:* Verify 36-month rolling window replacement.
   *Expected Result:* Full 36-month window is deleted and repopulated daily.

---

## 📋 Parent Task 2: Cash Forecast - Backend API & Compute Server Verification
**Type:** Story  
**Assignee:** Ly Nguyen  
**Sprint:** Active Sprint  

**Description:**
*Test Objective:*
Verify the Cash Forecast compute server API processes inputs correctly, returns well-formed JSON output, and integrates `fad_beta` from the live homepage.

*Preconditions:*
- API is accessible at `http://0.0.0.0:5001/managers/cash_forecast_model`
- [TBD - User needs to define specific preconditions]

*Test Steps:*
1. [TBD - User needs to define specific test steps]

*Expected Result:*
- Valid JSON responses match the output schema natively without error.
- Live `fad_beta` correctly proxies through the request.

### Sub-tasks:
1. **Verify API endpoint input/output schema**
   *Expected Result:* POST request with `cash_forecast_input.json` returns HTTP 200 and matches `cash_forecast_output.json`.
2. **Verify `fad_beta` is sourced from Aloha live homepage**
   *Expected Result:* `fad_beta` value matches current live beta and updates dynamically. NOT a user input.
3. **Verify `deriv_notional_value` is returned as today's value**
   *Expected Result:* `body.base.deriv_notional_value` exists and updates daily.
4. **Verify `cash_flow_table` data structure**
   *Expected Result:* Contains `Cash Closing`, `Closing Risk`, and `Buffer` columns.

---

## 📋 Parent Task 3: Cash Forecast - Frontend Dashboard UI Verification
**Type:** Story  
**Assignee:** Ly Nguyen  
**Sprint:** Active Sprint  

**Description:**
*Test Objective:*
Verify all UI elements of the Cash Forecast Dashboard render correctly, charts display accurate data, and interactive controls (date pickers, filters) behave as per the Figma mockup and UI documentation.

*Preconditions:*
- User is logged into the Aloha dashboard on Cash Forecast tab
- [TBD - User needs to define specific preconditions]

*Test Steps:*
1. [TBD - User needs to define specific test steps]

*Expected Result:*
- All charts (bar, line, combinations) render precisely as mocked.

### Sub-tasks:
1. **Cash Forecast - Verify Net Cash Flow combination chart (bar + lines) renders correctly**
   *Expected Result:* Blue bar chart, purple line, and grey dashed line display correct data.
2. **Cash Forecast - Verify Historical Capital Calls & Distributions stacked bar chart**
   *Expected Result:* Capital Calls and Distributions display as separate stacked bars.
3. **Cash Forecast - Verify Start/End Date filter restricts to month-end dates**
   *Expected Result:* Validates month-end restriction and allows today's date.
4. **Cash Forecast - Verify time interval logic**
   *Expected Result:* ≤1.5yr displays monthly; >1.5yr displays quarterly.
5. **Cash Forecast - Verify Details Tab**
   *Expected Result:* Displays beta, beta contribution, and beta impact correctly.

---

## 📋 Parent Tasks 4-7: Cash Forecast - Historical Flows
*(These are manually created tasks mapped to Epic QG-83 and formatted during Ad-hoc reorganization in Phase 6)*

- **QG-97**: Historical Flows – UI Verification
- **QG-98**: Historical Flows – Functional Verification
- **QG-99**: Historical Flows – Chart Validation
- **QG-100**: Historical Flows – Data Validation (Private Equity Table)

*(All follow the standard `Test Objective`, `Preconditions`, `Test Steps`, and `Expected Result` format)*
