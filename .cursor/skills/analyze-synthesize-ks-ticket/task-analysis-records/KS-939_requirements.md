# Synthesized Requirements — Cash Forecast UI Specs
**Source Ticket:** KS-939
**Date:** 2026-03-31

Based on analysis of KS-939 (Cash Forecast UI Specs), including the ticket description,
Figma mockup reference, attached Word document specs, and all 15 comment thread entries.
Requirements are synthesized from the combined input of the Product Owner (Kathleen Bui),
Developer (tuan tran), and Compute Server engineer (Jerry Luo).

> **Comment resolution:** When the original description and comments conflict, the most recent
> product owner comment (Kathleen Bui) takes precedence.

---

## Epic Context

*Epic Overview:*
Design and implement the end-to-end Cash Forecast Dashboard — an interactive financial dashboard
that pulls historical and real-time cash flow data, runs it through a compute server model, and
presents it as charts and tables on the frontend. The dashboard covers: Net Cash Flow combination
chart, Historical Capital Calls/Distributions stacked bar chart, date range filters, and a Details
tab with future transaction data including beta-related columns.

*Scope:*
- Net Cash Flow Combination Chart (bar + two lines)
- Historical Capital Calls & Distributions Stacked Bar Chart
- Start/End Date Filter with month-end constraints
- Time Interval switching logic (monthly vs. quarterly)
- Details Tab — Future Transactions table with Beta columns
- Dashboard initial load data source clarification
- Fixed Income and Total Cash sub-class listing behavior

*Preconditions:*
- Figma design: https://www.figma.com/design/snoshiSrFZ7c0i08Mvmcrm/Cash-Forecast
- UI specification document: `Cash Forecast UI Documentation.docx` (attached to KS-939)
- Compute server (Jerry Luo's code) providing JSON output schema
- Datalake loading specs per KS-934
- Aloha website providing live real-time beta value

*Exit Criteria:*
- All functional areas below are fully defined, with no remaining `[TBD]` items in critical paths
- Open questions (see end of document) are resolved and encoded back into the relevant sections
- Requirements file reviewed and approved by QA lead before task creation begins

---

## Functional Area 1: Net Cash Flow Combination Chart

*Test Objective:*
Verify that the Net Cash Flow combination chart correctly renders three overlapping data series
(blue bar, purple line, grey dashed line) using data from the compute server JSON output.

*Preconditions:*
- Compute server API returns a valid JSON response containing `body.base.cash_flow_table`
- Dashboard is loaded and the default date range is active
- User has access to the Cash Forecast Dashboard

*Test Steps:*
1. Navigate to the Cash Forecast Dashboard.
2. Confirm the chart section titled "Net Cash Flows" is visible.
3. Inspect the chart for three visual elements: blue bars, a purple line, and a grey dashed line.
4. Hover over a data point on each series to verify tooltip displays the correct value and date.
5. Change the Start/End Date filter and verify the chart redraws with updated data.

*Expected Result:*
- **Blue bars** represent the `Cash Closing` column from `body.base.cash_flow_table`.
- **Purple line** represents the `Closing Risk` column from `body.base.cash_flow_table`.
- **Grey dashed line** represents the `Buffer` column from `body.base.cash_flow_table`.
- Chart redraws dynamically when date filter changes.
- Tooltips display correct column values for each date.

### Sub-requirements / Details
- Data source: `body.base.cash_flow_table` in the compute server JSON response (confirmed by Jerry Luo, 2026-03-12)
- The `deriv_notional_value` is always "as of today" — no user-selectable "as of date" (confirmed by Kathleen Bui, 2026-03-10)
- The derivative notional value is returned in `body.base.deriv_notional_value` (Jerry Luo, 2026-03-12)

---

## Functional Area 2: Historical Capital Calls & Distributions Stacked Bar Chart

*Test Objective:*
Verify that the Historical Capital Calls & Distributions stacked bar chart renders Capital Calls
and Distributions as **separate** stacked bar series per asset class, sourced from the datalake,
with correct interval switching based on the selected date range.

*Preconditions:*
- Datalake is loaded with Historical Capital Calls/Distributions data per KS-934 specs
- Dashboard is loaded and the default date range is active
- Chart section "Historical Capital Calls and Distributions" is visible

*Test Steps:*
1. Navigate to the Cash Forecast Dashboard.
2. Locate the "Historical Capital Calls and Distributions" chart.
3. Verify that Capital Calls are rendered as one separate set of stacked bars.
4. Verify that Distributions are rendered as a second separate set of stacked bars.
5. Verify bars are broken down by asset class.
6. Set a date range ≤ 1.5 years and confirm months are displayed as individual intervals.
7. Set a date range > 1.5 years and confirm months are grouped into quarterly intervals (summed).
8. Hover over bars to confirm tooltips show accurate values.

*Expected Result:*
- Capital Calls and Distributions appear as two **separate** bar series (not aggregated together).
- Each series is stacked by asset class per time period.
- Monthly intervals display for date ranges ≤ 1.5 years.
- Quarterly intervals (summed from monthly) display for date ranges > 1.5 years.
- All values match the datalake data loaded per KS-934.

### Sub-requirements / Details
- Data source: Datalake (Historical Capital Calls/Distributions loaded per KS-934)
- Capital Calls and Distributions must be displayed **separately** as stacked bars — not combined (confirmed by Kathleen Bui, 2026-03-10)
- Monthly data is summed into quarters for periods > 1.5 years (per the attached UI Word document spec)

---

## Functional Area 3: Start/End Date Filter

*Test Objective:*
Verify that the Start Date and End Date filters enforce month-end date constraints and that
"today's date" is also valid as an End Date option.

*Preconditions:*
- Dashboard is loaded
- Calendar/date picker components are visible for Start Date and End Date

*Test Steps:*
1. Click the Start Date picker.
2. Attempt to select a non-month-end date — verify it is disabled or rejected.
3. Select a valid month-end date as Start Date.
4. Click the End Date picker.
5. Attempt to select a non-month-end date that is not today — verify it is disabled.
6. Select "today's date" as End Date — verify it is accepted.
7. Confirm the chart and table data refresh after applying the filter.

*Expected Result:*
- Start Date picker restricts selection to **month-end dates only**.
- End Date picker restricts selection to **month-end dates only**, plus **"today's date"**.
- Applying the filter triggers a chart/data refresh with the selected range.

---

## Functional Area 4: Time Interval Switching Logic

*Test Objective:*
Verify that the dashboard automatically switches between monthly and quarterly time intervals
based on the selected date range duration.

*Preconditions:*
- Dashboard is loaded
- Start/End Date filter is functional

*Test Steps:*
1. Select a date range that spans exactly 1.5 years (18 months).
2. Verify the chart displays **monthly** intervals.
3. Select a date range that spans more than 1.5 years (e.g., 2 years).
4. Verify the chart displays **quarterly** intervals.
5. Confirm that quarterly values are the **sum** of the constituent monthly values.

*Expected Result:*
- Periods **≤ 1.5 years**: individual monthly bars/data points.
- Periods **> 1.5 years**: quarterly bars/data points, each representing the sum of its months.
- No manual toggle required — the switch is automatic based on the date range.

---

## Functional Area 5: Details Tab — Future Transactions Table with Beta Columns

*Test Objective:*
Verify that the Details tab displays a future transactions table including the beta, beta
contribution, and beta impact columns, populated from the compute server JSON output.

*Preconditions:*
- Compute server API returns a valid JSON response containing a `transactions` table
- Dashboard is loaded and the "Details" tab is accessible

*Test Steps:*
1. Navigate to the Cash Forecast Dashboard.
2. Click the "Details" tab.
3. Verify the future transactions table is displayed.
4. Confirm the table includes columns: `beta`, `beta contribution`, `beta impact`.
5. Verify these column values are populated from `cash_forecast_response.json` (transactions table).
6. Confirm the table also includes hypothetical trades.

*Expected Result:*
- Details tab is accessible and displays a table of future transactions.
- `beta`, `beta contribution`, and `beta impact` columns are present and populated correctly.
- Values are calculated by the compute server (Jerry Luo's code) and returned in the JSON response.
- Hypothetical trades are included in the data.

### Sub-requirements / Details
- `beta`, `beta contribution`, `beta impact` are computed by Jerry Luo's compute server and returned via `cash_forecast_response.json` (confirmed by Kathleen Bui 2026-03-24, Jerry Luo 2026-03-25)
- The transactions table in the JSON output includes both loaded data and additional computed columns (Jerry Luo, 2026-03-30)

---

## Functional Area 6: Fixed Income & Total Cash Sub-class Listing

*Test Objective:*
Verify that Fixed Income lists all currently available accounts dynamically, and that Total Cash
mimics the existing breakdown screen (with sub-classes like Cash, Cash In Transit, etc.).

*Preconditions:*
- Dashboard is populated with current datalake data
- Fixed Income and Total Cash sections are visible

*Test Steps:*
1. Navigate to the Fixed Income section of the dashboard.
2. Verify that listed accounts reflect whatever is currently in the system (dynamically populated).
3. Navigate to the Total Cash section.
4. Verify sub-classes like "Cash", "Cash In Transit", and others are listed, mirroring the existing screen layout.

*Expected Result:*
- Fixed Income: Dynamic list of accounts — currently only "Payden US Treasury" (per current data).
- Total Cash: Sub-classes listed as shown in the reference screenshot (Kathleen Bui, 2026-03-25).
- Lists update automatically as underlying data changes — no hardcoded values.

### Sub-requirements / Details
- Fixed Income sub-classes fluctuate over time (Kathleen Bui, 2026-03-25: "the image I had was from past months")
- Total Cash should mimic the existing Aloha screen breakdown layout (screenshot provided by Kathleen Bui)

---

## Functional Area 7: Dashboard Initial Load Data Source

*Test Objective:*
Verify what data is displayed when the Cash Forecast Dashboard first loads, before any
user-triggered computation or filtering occurs.

*Preconditions:*
- Dashboard is accessed freshly without any prior user interaction
- Datalake has populated data from the daily loader

*Test Steps:*
1. Open the Cash Forecast Dashboard for the first time in a session.
2. Observe which charts and tables are populated on initial render.
3. Verify whether the displayed values come from the datalake daily loader or the compute server.
4. Confirm with the team if the "Calculating Impact" step is triggered automatically on load.

*Expected Result:*
- [TBD — Pending response from Jerry Luo and Kathleen Bui regarding initial load data source]
- The team needs to confirm whether the compute server runs automatically on dashboard load or
  whether the initial view only shows datalake data.

---

> [!NOTE]
> **Resolved Clarifications (from comment thread)**
> - `fad_beta` must be pulled from the **live real-time beta** on the Aloha homepage — not from a user input field (Jerry Luo 2026-03-09, confirmed by tuan tran 2026-03-10).
> - `deriv_notional_value` is always "as of today" — no user-selectable "as of date" (Kathleen Bui, 2026-03-10).
> - JSON field for `deriv_notional_value`: `body.base.deriv_notional_value` (Jerry Luo, 2026-03-12).
> - `cash_flow_table` column mapping: `Cash Closing` → blue bars, `Closing Risk` → purple line, `Buffer` → grey dashed line (Jerry Luo, 2026-03-12).
> - Capital Calls and Distributions must be displayed as **separate** stacked bars — not aggregated (Kathleen Bui, 2026-03-10).
> - Trailing 30-day/90-day net cash flow totals & daily averages are computed and stored daily via scheduler — used by compute server (tuan tran 2026-03-12, Kathleen Bui 2026-03-12).
> - `beta`, `beta contribution`, `beta impact` are returned by compute server in `cash_forecast_response.json` transactions table (confirmed 2026-03-24 to 2026-03-30).
> - Fixed Income sub-class list is **dynamic** — not hardcoded (Kathleen Bui, 2026-03-25).
> - **3rd chart** referenced in early Figma mockups has been **removed** per Kathleen Bui: *"we can remove it for now from the cash forecast. This might be a placeholder in the future, but right now, that data isn't available."* (2026-03-10)

> [!WARNING]
> **Open Questions (unresolved as of 2026-03-31)**
> - **Dashboard initial load data source** (raised by tuan tran, 2026-03-31): What data populates the dashboard on first load — datalake loader output or compute server output? Does "Calculating Impact" trigger automatically? Awaiting response from Jerry Luo (and confirmation from Kathleen Bui).
> - **Fixed Income account list completeness**: When new Fixed Income accounts are added, does the frontend auto-detect and display them, or does a config change be required?
