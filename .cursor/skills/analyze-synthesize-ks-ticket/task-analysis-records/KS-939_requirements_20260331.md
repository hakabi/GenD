# Synthesized Requirements — Cash Forecast UI Specs
**Source Ticket:** KS-939
**Date:** 2026-03-31
**Run:** 2026-03-31T14:34 (second run — first run file: KS-939_requirements.md)

Requirements synthesized from KS-939 (Cash Forecast UI Specs), including the ticket
description, Figma mockup reference, attached Word document specs, and all 16 comment
thread entries spanning 2026-03-09 to 2026-03-31.

**Participants:**
- **Kathleen Bui** (Product Owner — Reporter) — authoritative final voice on requirements
- **tuan tran** (Developer — Assignee) — implementation questions
- **Jerry Luo** (Compute Server Engineer) — JSON schema, chart data mapping

> **Resolution rule applied:** Most recent product owner comment (Kathleen Bui) takes
> precedence over earlier description or earlier comments when conflicts exist.

---

## Epic Context

*Epic Overview:*
Design and implement the end-to-end Cash Forecast Dashboard — an interactive financial
dashboard that integrates three data sources: (1) the datalake daily data loader per KS-934,
(2) the compute server model API (Jerry Luo's code), and (3) real-time data from the Aloha
homepage. The dashboard renders Net Cash Flow charts, Historical Capital Calls & Distributions
charts, date filters, and a Details tab with future transaction data including computed beta
columns.

*Scope:*
- Net Cash Flow Combination Chart (blue bar + purple line + grey dashed line)
- Historical Capital Calls & Distributions Stacked Bar Chart (separate bars per asset class)
- Start/End Date Filter (month-end restricted)
- Time Interval Logic (monthly ≤ 1.5y / quarterly > 1.5y)
- Derivative Notional Value display (always "as of today")
- Trailing 30-day / 90-day net cash flow totals & daily averages
- Details Tab — Future Transactions table with Beta, Beta Contribution, Beta Impact columns
- Fixed Income & Total Cash sub-class listing (dynamic)
- Dashboard initial load data source (open — see Open Questions)

*Preconditions:*
- Figma design shared at: https://www.figma.com/design/snoshiSrFZ7c0i08Mvmcrm/Cash-Forecast
- UI specification document: `Cash Forecast UI Documentation.docx` (attached to KS-939)
- Compute server API (port 5001) implemented and returning `cash_forecast_response.json`
- Datalake data loaded per KS-934 schedule
- Aloha website accessible and providing live real-time beta value

*Exit Criteria:*
- All 7 Functional Areas below have no remaining `[TBD]` in critical paths
- Open Question regarding dashboard initial load data source is resolved and encoded here
- Requirements reviewed and approved before QG task creation begins

---

## Functional Area 1: Net Cash Flow Combination Chart

*Test Objective:*
Verify the Net Cash Flow combination chart correctly renders three overlapping data series
(blue bar = Cash Closing, purple line = Closing Risk, grey dashed = Buffer) using data
sourced exclusively from `body.base.cash_flow_table` in the compute server JSON response.

*Preconditions:*
- Compute server API returns a valid JSON response containing `body.base.cash_flow_table`
- Dashboard is loaded with default date range applied
- User has access to the Cash Forecast Dashboard

*Test Steps:*
1. Navigate to the Cash Forecast Dashboard.
2. Locate the "Net Cash Flows" chart section.
3. Confirm three visual series are rendered: blue bars, a purple line, and a grey dashed line.
4. Hover over each series data point to verify tooltip shows correct column label and value.
5. Confirm the Derivative Notional Value (if displayed) reflects today's date — no date picker present.
6. Change the Start/End Date filter; verify the chart redraws with updated data from the API.

*Expected Result:*
- Blue bars render `Cash Closing` values from `body.base.cash_flow_table`.
- Purple line renders `Closing Risk` values from `body.base.cash_flow_table`.
- Grey dashed line renders `Buffer` values from `body.base.cash_flow_table`.
- `Derivative Notional Value` (from `body.base.deriv_notional_value`) is always "as of today" — no user-selectable date.
- Chart redraws on every date filter change.
- Tooltips show correct value and date for each series.

### Sub-requirements / Details
- Chart data field: `body.base.cash_flow_table` (confirmed by Jerry Luo 2026-03-12)
- Column-to-series mapping: `Cash Closing` → blue bar; `Closing Risk` → purple line; `Buffer` → grey dashed (Jerry Luo 2026-03-12)
- `deriv_notional_value` field: `body.base.deriv_notional_value` (Jerry Luo 2026-03-12)
- No "as of date" picker for `deriv_notional_value` — always today (Kathleen Bui 2026-03-10)

---

## Functional Area 2: Historical Capital Calls & Distributions Stacked Bar Chart

*Test Objective:*
Verify the Historical Capital Calls & Distributions chart renders Capital Calls and
Distributions as two separate sets of stacked bars (not combined/aggregated), broken down
by asset class per time period, sourced from the datalake per KS-934.

*Preconditions:*
- Datalake is populated with Historical Capital Calls / Distributions data per KS-934
- Dashboard is loaded and the chart section is visible

*Test Steps:*
1. Navigate to the Cash Forecast Dashboard.
2. Locate the "Historical Capital Calls and Distributions" chart.
3. Verify Capital Calls are rendered as one distinct stacked bar group.
4. Verify Distributions are rendered as a separate distinct stacked bar group.
5. Verify each bar is broken down per asset class.
6. Set a date range ≤ 1.5 years; confirm monthly interval bars are shown.
7. Set a date range > 1.5 years; confirm quarterly interval bars (summed from monthly) are shown.
8. Hover over a bar segment to verify tooltip shows correct asset class name, date, and value.

*Expected Result:*
- Capital Calls and Distributions appear as two **separate** bar series — never aggregated.
- Each series is stacked by asset class within each time period.
- Monthly intervals for date ranges ≤ 1.5 years.
- Quarterly intervals (sum of constituent months) for date ranges > 1.5 years.
- All values match datalake data loaded per KS-934.
- Tooltips are accurate per bar segment.

### Sub-requirements / Details
- Data source: datalake (Historical Capital Calls/Distributions per KS-934)
- Capital Calls and Distributions must be **separate** — not combined (Kathleen Bui 2026-03-10)
- Quarterly values = sum of monthly values within each quarter (per UI Word doc spec; Kathleen Bui 2026-03-10)
- Data loaded per asset class, per month (Kathleen Bui 2026-03-10)

---

## Functional Area 3: Start/End Date Filter

*Test Objective:*
Verify the Start Date and End Date pickers enforce month-end date restrictions, with the
additional allowance of "today's date" for End Date selection.

*Preconditions:*
- Dashboard is loaded
- Date picker components are visible for both Start Date and End Date

*Test Steps:*
1. Click the Start Date picker.
2. Attempt to select a non-month-end date — verify it is disabled/rejected.
3. Select a valid month-end date as Start Date and confirm selection succeeds.
4. Click the End Date picker.
5. Attempt to select a non-month-end, non-today date — verify it is disabled.
6. Select "today's date" as End Date — verify it is accepted even if not a month-end.
7. Apply the filter combination and verify charts/data refresh.

*Expected Result:*
- Start Date picker: only month-end dates are selectable.
- End Date picker: month-end dates AND today's date are selectable.
- Applying the filter triggers a chart refresh and data reload.
- Invalid date combinations (Start > End) should be blocked or clearly flagged.

---

## Functional Area 4: Time Interval Switching Logic

*Test Objective:*
Verify the dashboard automatically switches display intervals between monthly and quarterly
based on the duration of the selected date range, with no manual toggle required.

*Preconditions:*
- Dashboard is loaded
- Start/End Date filter is functional

*Test Steps:*
1. Select a date range spanning exactly 18 months.
2. Verify the chart displays individual monthly intervals.
3. Select a date range spanning more than 18 months (e.g., 24 months).
4. Verify the chart displays quarterly intervals.
5. Spot-check a quarterly bar value to confirm it equals the sum of its three constituent monthly values.

*Expected Result:*
- Date range ≤ 1.5 years (18 months) → monthly intervals displayed.
- Date range > 1.5 years → quarterly intervals displayed, each = sum of monthly values.
- Switching is **automatic** based on the range — no user toggle.

---

## Functional Area 5: Trailing 30-day / 90-day Net Cash Flow Summary

*Test Objective:*
Verify the dashboard correctly displays trailing 30-day and 90-day net cash flow totals
and daily averages, sourced from the daily scheduler-loaded data.

*Preconditions:*
- Daily scheduler has run and populated trailing 30-day/90-day summary data in the DB
- Dashboard is loaded

*Test Steps:*
1. Navigate to the Cash Forecast Dashboard.
2. Locate the trailing 30-day and 90-day summary values (totals and daily averages).
3. Verify the values reflect data loaded by the daily scheduler (not user-triggered calculations).
4. Confirm the display updates after the next scheduler run (next business day).

*Expected Result:*
- Trailing 30-day and 90-day net cash flow totals and daily averages are displayed correctly.
- Values come from the daily scheduled data load — not on-demand API calls.
- Data source: datalake API raw output; compute server performs calculations on top of it.

### Sub-requirements / Details
- Loaded daily via scheduler (tuan tran 2026-03-12)
- Store raw API output; Jerry's compute server code performs calculations (Kathleen Bui 2026-03-12)

---

## Functional Area 6: Details Tab — Future Transactions with Beta Columns

*Test Objective:*
Verify the Details tab displays a future transactions table including `beta`, `beta contribution`,
and `beta impact` columns, populated from the compute server JSON output, alongside
hypothetical trades.

*Preconditions:*
- Compute server API returns a valid JSON response containing a `transactions` table
- Dashboard is loaded and the "Details" tab is accessible
- `cash_forecast_response.json` schema is available for reference

*Test Steps:*
1. Navigate to the Cash Forecast Dashboard.
2. Click the "Details" tab.
3. Verify the future transactions table is displayed.
4. Confirm columns present: `beta`, `beta contribution`, `beta impact` (plus standard loaded data columns).
5. Verify column values are populated from the compute server JSON output (not the datalake loader directly).
6. Confirm hypothetical trades are included in the table rows.
7. Verify other columns in the table match the daily-loaded data columns.

*Expected Result:*
- Details tab is accessible and displays the future transactions table.
- `beta`, `beta contribution`, and `beta impact` columns are present and correctly populated.
- Table includes both loaded data columns and computed columns — all in one view.
- Hypothetical trades appear as rows in the table.

### Sub-requirements / Details
- `beta`, `beta contribution`, `beta impact` computed by Jerry Luo's compute server (Kathleen Bui 2026-03-24; Jerry Luo 2026-03-25)
- New JSON output = loaded data + computed columns + hypothetical trades (Jerry Luo 2026-03-30)
- File reference: `cash_forecast_response.json` (attached to KS-939 by Jerry Luo 2026-03-25)

---

## Functional Area 7: Fixed Income & Total Cash Sub-class Listing

*Test Objective:*
Verify Fixed Income dynamically lists all current accounts without hardcoding, and Total Cash
displays sub-classes (Cash, Cash In Transit, etc.) mimicking the existing Aloha screen layout.

*Preconditions:*
- Dashboard is loaded with current datalake data
- Fixed Income and Total Cash sections are visible

*Test Steps:*
1. Navigate to the Fixed Income section of the dashboard.
2. Verify the listed accounts reflect current live data (right now: "Payden US Treasury" only).
3. Navigate to the Total Cash section.
4. Verify sub-classes (e.g., Cash, Cash In Transit) are listed in the same layout as the referenced existing Aloha screen.
5. Simulate adding/removing an account in the datalake and verify the list updates dynamically.

*Expected Result:*
- Fixed Income: dynamic list of accounts — no hardcoded values; currently "Payden US Treasury".
- Total Cash: sub-classes listed per the reference screenshot (Kathleen Bui 2026-03-25).
- Both sections auto-update as underlying data changes.

### Sub-requirements / Details
- Fixed Income is dynamic — the sample image from Kathleen was from older data with more accounts (Kathleen Bui 2026-03-25)
- Total Cash: mimic the existing Aloha screen breakdown (reference screenshot provided by Kathleen Bui 2026-03-25)

---

> [!NOTE]
> **Resolved Clarifications (from comment thread)**
> - `fad_beta` must be sourced from the **live real-time beta** on the Aloha homepage — not a user-facing input field. (Jerry Luo 2026-03-09; confirmed by tuan tran 2026-03-10)
> - `deriv_notional_value` is always "as of today" — no user-selectable "as of date". (Kathleen Bui 2026-03-10)
> - JSON field for `deriv_notional_value`: `body.base['deriv_notional_value']`. (Jerry Luo 2026-03-12)
> - Net Cash Flow chart column mapping: `Cash Closing` → blue bars; `Closing Risk` → purple line; `Buffer` → grey dashed line. Source: `body.base['cash_flow_table']`. (Jerry Luo 2026-03-12)
> - Capital Calls and Distributions must be shown as **separate** stacked bars — not aggregated. (Kathleen Bui 2026-03-10)
> - Trailing 30-day/90-day values are loaded daily via scheduler; compute server performs calculations on top of stored raw API output. (tuan tran 2026-03-12; Kathleen Bui 2026-03-12)
> - `beta`, `beta contribution`, `beta impact` are computed by Jerry Luo's compute server code; returned in the `transactions` table of `cash_forecast_response.json`. (Kathleen Bui 2026-03-24; Jerry Luo 2026-03-25, 2026-03-30)
> - The `transactions` table JSON = loaded data + computed columns (beta, beta contribution, beta impact) + hypothetical trades. (Jerry Luo 2026-03-30)
> - Fixed Income sub-class list is **dynamic** — not hardcoded. (Kathleen Bui 2026-03-25)
> - Total Cash should mimic the existing Aloha screen breakdown layout. (Kathleen Bui 2026-03-25)
> - **3rd chart** in early Figma mockups has been **removed** — Kathleen Bui: *"we can remove it for now from the cash forecast. This might be a placeholder in the future, but right now, that data isn't available."* (2026-03-10)

> [!WARNING]
> **Open Questions (unresolved as of 2026-03-31)**
> - **Dashboard Initial Load Data Source** (raised by tuan tran 2026-03-31): What data populates the Cash Forecast dashboard on first load before any calculation is triggered? Does the "Calculating Impact" compute server step run automatically on page load? This determines whether the charts are populated on initial render or only after a user action. → *Awaiting response from Jerry Luo and Kathleen Bui.*
> - **Fixed Income dynamic account completeness**: When new Fixed Income accounts are added to the datalake, does the frontend auto-discover them, or is a config change required on the frontend? → *Not explicitly addressed in comments.*
