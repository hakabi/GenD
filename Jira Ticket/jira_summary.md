# Jira Epic Summary: Cash Forecasting Model (KS-950)

Based on the Jira ticket descriptions and comment threads, the **Cash Forecasting Model** is a full-stack feature involving data ingestion, backend API modeling, and a frontend dashboard. 

## Epic Overview
The feature breaks down into three core pillars:
1. **Data Engineering (KS-934):** Ingesting historical and future-dated transaction cash flows, capital calls, distributions, NAVs, and unfunded commitments from Solovis APIs into the Data Lake.
2. **Backend / Model (KS-949):** A REST API service that consumes datalake/UI inputs and processes the data through a computational forecasting model, returning predicted Cash Closing, Risk, and Buffer series.
3. **Frontend / UI (KS-939):** A Cash Dashboard (mocked up in Figma) featuring data tables, stacked bar charts for distributions/calls, and time-series line charts for forecasting.

---

## Ticket Breakdown & Actionable Details

### [KS-950: Cash Forecasting Model](https://gendvn.atlassian.net/browse/KS-950)
- **Status:** To Do | **Assignee:** tuan tran
- **Purpose:** Root Epic tracking the end-to-end delivery of the Cash Forecast feature.

### [KS-949: JSON Input and Output for Cash Forecast Model](https://gendvn.atlassian.net/browse/KS-949)
- **Status:** In Progress | **Assignee:** tuan tran
- **Purpose:** Defines the API contract for the backend model (`/managers/cash_forecast_model` running via HTTP).
- **What needs to be done:** Ensure the backend successfully serves the agreed-upon JSON payload and accepts proper parameters from the UI.

### [KS-939: Cash Forecast UI Specs](https://gendvn.atlassian.net/browse/KS-939)
- **Status:** In Progress | **Assignee:** tuan tran
- **Purpose:** Build the Cash Forecast Dashboard based on the Figma mockup and Word document specs.
- **Key implementation details & Comment Confirmations:**
  - **Inputs:** A new field `fad_beta` must be passed in the JSON input using the live beta number from the Aloha website homepage (per Jerry Luo).
  - **Graph Indicators:** 
    - The main line chart uses output from `body['base']['cash_flow_table']`: The blue bar is "Cash Closing", the purple line is "Closing Risk", and the grey dashed line is the "Buffer" column.
    - The Capital Calls and Distributions stacked bar chart relies on historical API data from the datalake aggregated by asset class/month.
  - **Derivative Notional Value:** Handled and returned by Jerry's compute server via `body['base']['deriv_notional_value']`. It should be updated to "today's" value.
  - **Asset Class Mapping:** List whatever accounts are currently active (e.g. just "Payden US Treasury" for Fixed Income).
  - **Updates:** Jerry updated the JSON output to include a `transactions` table with beta, beta contribution, and beta impact columns.

### [KS-934: Cash Forecast Data Loading](https://gendvn.atlassian.net/browse/KS-934)
- **Status:** Development Complete | **Assignee:** tuan tran
- **Purpose:** Ingest structured data from Solovis APIs to support the forecast model's computations.
- **Key implementation details & Comment Confirmations:**
  - **Schedule:** Pull daily on Mon-Fri at 12pm EST.
  - **Data Cleansing:** Rows where `net_cash_in` is 0 or NaN can be intentionally dropped.
  - **Table Structure:** You can load Historical Capital Calls/Distributions and Unfunded & NAVs into *one combined table*.
  - **Extraction Logic Confirmed by Kathleen:**
    - **Future Cash Flows:** Wipe out the table and refresh with individual transactions from "today" up to a year ahead daily.
    - **Capital Calls & Distributions:** Initial load of 60 months. Replace the MTD value daily. Once month-end hits, store it permanently and begin replacing the new month's MTD.
    - **Historic Unfunded and NAVs:** Initial load of 60 months. Every day, fetch and *replace the entire 36-month rolling window* (to properly capture historical restatements/revisions). 

> [!TIP]
> **Suggested Future Tasks:** Validate the 36-month rolling logic for NAV restatements to ensure accuracy, and track the deployment of the `0.0.0.0:5000` Cash Forecast model API to a production environment.
