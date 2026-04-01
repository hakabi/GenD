# Synthesized Requirements — Cash Forecast Feature
**Source Tickets:** KS-934, KS-939, KS-949  
**Date:** 2026-03-26

Based on analysis of KS-934 (Data Loading), KS-939 (UI Specs), and KS-949 (JSON Input/Output), the requirements for the Cash Forecast feature are synthesized and decomposed into the following Epic → Parent Task → Sub-task structure.

> **Formatting Constraint:** All generated tasks in Jira follow the strict QA Template format (`Test Objective`, `Preconditions`, `Test Steps`, `Expected Result`) for standardization.

---

## Epic: Cash Forecast Dashboard — Build & Integration

**Description:** Build the end-to-end data pipeline, backend compute layer, and interactive UI for the Cash Forecast feature. The system pulls historical and future cash flow data into the datalake daily, runs computation via the Cash Forecast Model API, and renders charts and tables on the frontend dashboard.

---

## Parent Task 1: Datalake & Data Loading (Source: KS-934)

**Description:** Build and schedule data ingestion jobs that load data into the datalake via Solovis APIs every weekday (Mon–Fri, 12pm EST).

**Sub-tasks:**
1. **Load Future Cash Flows** — Pull future-dated transactions up to 1 year ahead. Full table wipe-and-reload daily. Fields: `transaction_id`, `fund_id`, `transaction_type`, `amount`, `cash_date`, `effective_date`.
2. **Calculate & Store Daily Average Cash Flow** — Compute trailing 30-day and 90-day net cash flow totals and daily averages. Store each day's result as a time-series record (do not overwrite).
3. **Load Historical Capital Calls/Distributions by Asset Class** — Initialize with 60 months of history. Daily MTD overwrite (intra-month replaces previous day; month-end value retained permanently). One API call can load both Asset Class and Unfunded/NAV into the same table.
4. **Load Historical Capital Calls/Distributions by Fund (30-day window)** — Full replace daily with last 30 days only. Drop rows where `net_cash_in = 0 or NaN`. No historical accumulation.
5. **Load Historical Unfunded & NAVs by Asset Class** — Initialize with 60 months. Full 36-month rolling window replaced daily to capture historical restatements. MTD snapshot included each day.

> **Resolved clarifications from KS-934 comments:**
> - Drop rows where `net_cash_in = 0 or NaN` (Fund-level data)
> - Rolling override window = **36 months** (not 24; confirmed by Kathleen Bui)
> - Pull schedule: **Mon–Fri at 12pm EST**
> - Asset Class Capital Calls and Unfunded/NAV can be submitted as one request, loaded into one table

---

## Parent Task 2: Backend API & Compute Server (Source: KS-949, KS-939)

**Description:** Build the Cash Forecast Model compute service accessible at `http://0.0.0.0:5001/managers/cash_forecast_model`. The service consumes a structured JSON input, runs the forecast model, and returns a structured JSON output.

**Sub-tasks:**
1. **Implement API Endpoint & Input/Output Schema** — Process requests per `cash_forecast_input.json` schema. Return response per `cash_forecast_output.json` schema.
2. **Integrate Real-time `fad_beta` from Aloha Homepage** — Populate the `fad_beta` field from the live/real-time beta value on the Aloha homepage. This must **not** come from a user-facing input field. (Confirmed by Jerry Luo & tuan tran)
3. **Return `deriv_notional_value` as today's value** — Confirmed by Jerry Luo: returned under `body.base.deriv_notional_value`. Always reflects "as of today" — no user date selection.
4. **Populate `cash_flow_table` for charts** — `body.base.cash_flow_table` must contain: `Cash Closing` (blue bars), `Closing Risk` (purple line), `Buffer` (grey dashed line) per date row.

---

## Parent Task 3: Frontend Dashboard & UI (Source: KS-939)

**Description:** Build the Cash Forecast Dashboard UI following the Figma mockup and UI documentation. Users interact with date filters and view real-time charts driven by API and datalake data.

**Sub-tasks:**
1. **Net Cash Flow Combination Chart** — Blue bar (Cash Closing) + Purple line (Closing Risk) + Grey dashed line (Buffer). Data from `body.base.cash_flow_table`.
2. **Historical Capital Calls & Distributions Stacked Bar Chart** — Data from datalake. Capital Calls and Distributions displayed as **separate** stacked bars by asset class, per time period.
3. **Start/End Date Filter** — Both constrained to **month-end dates only**. End Date also allows **"today's date"**. Chart redraws on filter change.
4. **Time Interval Logic** — Periods ≤ 1.5 years → monthly intervals. Periods > 1.5 years → quarterly intervals (sum monthly values into quarters).
5. **Details Tab — Future Transactions & Beta Fields** — Display future transaction table with `beta`, `beta contribution`, and `beta impact` columns.

---

> [!NOTE]
> The "3rd chart" referenced in early Figma mockups has been **excluded** per Kathleen Bui's comment on KS-939: *"we can remove it for now from the cash forecast. This might be a placeholder in the future, but right now, that data isn't available."*

---

## Parent Task 4: Historical Flows – UI Verification (Manually mapped to QG-97)

**Description:** Verify overall layout of the Historical Flows screen (tables, charts, titles) and basic navigation filters match UI. (Original KS requirements were processed in an undocumented run, retroactively recorded here).

---

## Parent Task 5: Historical Flows – Functional Verification (Manually mapped to QG-98)

**Description:** Verify Start Date and End Date functionally filter correctly and enforce constraints (e.g. Start Date cannot be > End Date).

---

## Parent Task 6: Historical Flows – Chart Validation (Manually mapped to QG-99)

**Description:** Verify Net Cash Flows chart logic syncs with time filter and Historical Capital Calls chart accurately shows data and tooltips.

---

## Parent Task 7: Historical Flows – Data Validation (Private Equity Table) (Manually mapped to QG-100)

**Description:** Verify calculated values, totals, and constraints in the Private Equity table for historical flows.
