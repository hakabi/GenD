## User Story

As a **Portfolio Manager**, I want to configure forecast parameters through a panel before running the cash forecast model so that the model reflects the correct pacing method and buffer thresholds for my scenario.

## Overview

This ticket implements the "Forecast Parameters" button and its modal/sidebar panel on the Dashboard sub-tab. The panel configures the **Illiquid Pacing Method** and **Buffer Parameters** passed as inputs to the compute server when **KS-964** (Calculate Impact) is triggered, and must reflect **product decisions recorded on** [**KS-939**](https://gendvn.atlassian.net/browse/KS-939) **(Apr 2026)** including **system defaults for the scheduled daily run** and clarified **manual-pacing dollar helpers**. The modal footer contains three buttons: **Apply** (parameters only, no hypothetical flows), **Apply with Hypothetical Flows** (parameters + loaded hypothetical rows), and **Close** (discard changes). Confirmed by Kathleen Bui (Jun 2026, KS-963 comment thread).  

![](blob:https://media.staging.atl-paas.net/?type=file&localId=864d3a9f3f1c&id=bd7b64b5-a5b6-43bc-b6e4-8d7d46d773a3&&collection=&height=670&occurrenceKey=null&width=1656&__contextId=null&__displayType=null&__external=false&__fileMimeType=null&__fileName=null&__fileSize=null&__mediaTraceId=null&url=null)
## Key Requirements

**Illiquid Pacing Method** (radio/dropdown — choose one):

![](blob:https://media.staging.atl-paas.net/?type=file&localId=e36d49300b34&id=97da5f31-502c-48b4-8f40-2c785d0c7f6e&&collection=&height=387&occurrenceKey=null&width=445&__contextId=null&__displayType=null&__external=false&__fileMimeType=null&__fileName=null&__fileSize=null&__mediaTraceId=null&url=null)
* Last 3 months historical pacing
* Last 12 months historical pacing
* Manual Pacing → reveals additional fields:  
  **a/** **Annual Estimated Distribution (%)**

    * **Input Range**: `0.00 – 100.00`, strictly restricted to **2 decimal places (2dp)**.
    * **Display Output**: Show the Calculated Amount in USD equivalent next to the input field.
    * **Formatting Rules**:
    
        * Apply **HALF_UP** rounding based on the specific value scale criteria below:
        
            * **If value < $1,000**: Display the exact absolute dollar value as an integer (e.g., `$500`).
            * **If $1,000 ≤ value < $1,000,000**: Display with the **$K** suffix, rounded to the nearest **whole number** (e.g., `$850K`).
            * **If value ≥ $1,000,000**: Display with the **$M** suffix, formatted to exactly **1 decimal place** (e.g., `$1.3M` or `$584.7M`).
            
        * **Thousands separators on scaled suffix displays** *(Kathleen Bui, KS-939, Jun 15, 2026)*: When the calculated helper amount uses the **$K** or **$M** suffix pattern, include comma thousand separators in the numeric portion for readability. Examples:
            * Illiquid NAV: `$5423.9M` → **`$5,423.9M`**
            * Total Unfunded NAV: `$1198.2M` → **`$1,198.2M`**
        * **Billion-Scale Rule**: If the calculated amount reaches or exceeds 1 Billion USD, **do not** transition to the Billions ($B) unit suffix. The system must continue using the **$M** suffix pattern uniformly (e.g., `$1,200.0M`).
        
    
* **Constraint**: Must use the specific **Illiquid NAV** definition provided (do not use generic Total Portfolio NAV).  
    
  **b/ Annual Estimated Contribution (%)**

    * **Input Range**: `0.00 – 100.00`, strictly restricted to **2 decimal places (2dp)**.
    * **Display Output**: Follow the **same pattern** (HALF_UP rounding, micro-value handling, $K whole-number scaling, $M 1-decimal scaling, thousand separators on $K/$M displays, and billion-scale restriction) as defined for the _Annual Estimated Distribution (%)_ field.
    

### Field Dependency

* Both fields are conditionally mandatory and **required** when `Manual Pacing` is selected as the _Illiquid Pacing Method_.  

    ![](blob:https://media.staging.atl-paas.net/?type=file&localId=cce841bff169&id=68de95d5-89c6-479d-8a5e-704a8ec02892&&collection=&height=617&occurrenceKey=null&width=619&__contextId=null&__displayType=null&__external=false&__fileMimeType=null&__fileName=null&__fileSize=null&__mediaTraceId=null&url=null)

**Manual pacing — calculated dollar helpers** (Kathleen Bui, **KS-939** 2026-04-09):

* **Forecasted amount for Distributions** = (Annual Distribution Rate %) × (**Illiquid NAV** as of the dashboard **as-of date**). **Illiquid NAV** = sum of NAV across all asset classes from the **Historical Unfunded and NAV** datalake table (**KS-934**), as of the current / selected as-of date.
* **Forecast amount for Unfunded** = (Annual Estimated Contribution %) × (**Total Unfunded Amount**), where total unfunded = sum of unfunded amounts across asset classes from that same historical table, as of the current / selected as-of date.
* Kathleen asked whether these dollar amounts should be returned by the **compute server** or **calculated in the front end** — **confirm implementation layer** with PO/engineering before locking the API contract.
* Update: **'Iliquid nav'** and **'Total unfunded nav'** fields to be inserted as Kathleen's confirmation on 14/06/2026 (Replied for Tuan's comment)

**Forecast Parameters panel — DB-backed defaults:** (**KS-939** 2026-04-09) The table/values shown in the panel for these defaults must come from **real as-of data in the database** (datalake / authoritative sources). **Do not** blend **hypothetical flow** rows into this panel.

**System defaults for the automated daily compute run** (Kathleen Bui, **KS-939** 2026-04-10) — used by the scheduled job that produces the **morning run** consumed by **KS-962** until the product team changes policy:

* Illiquid Pacing Method: **Manual**
* Annual Estimated Distribution (%): **8%**
* Annual Estimated Contribution (%): **33%**
* Minimum Buffer ($): **$50,000,000** ($50M)
* Minimum Notional Buffer (%): **20%**

**Buffer Parameters** (user-editable in panel):

* Minimum Buffer — USD dollar amount input (whole number)
* Minimum Notional Buffer (%) — 0.00–100.00, 2dp

**Behaviour**:

* **Apply** — saves the current parameter values to session state and immediately triggers **KS-964** (Calculate Impact) using the new parameters **without** any hypothetical flows (empty hypothetical_trades payload). The modal closes on success. The existing hypothetical flows table rows remain untouched — they are not removed, just excluded from this specific KS-964 call.
* **Apply with Hypothetical Flows** — saves the current parameter values to session state and immediately triggers **KS-964** (Calculate Impact) using the new parameters **together with** all currently loaded and toggled-ON hypothetical rows from the Hypothetical Flows table (KS-963). The modal closes on success.
* **Close** — closes the modal and discards any unsaved parameter changes. No KS-964 calculation is triggered.
* Parameters persist in session until user changes them or navigates away
* _(Note: user role restrictions on this panel are TBD — any logged-in user may configure. May be updated in a future ticket.)_
* Accessibility: modal traps focus when open; all inputs have `<label>` elements

## Acceptance Criteria

**Scenario 1 — Apply (Parameters Only, Happy Path):**

* Given a user selects Manual Pacing and enters **8.00%** Distribution and **33.00%** Contribution (team defaults), then clicks **Apply**
* When the panel closes
* Then parameters are stored in session state, KS-964 is triggered with the new parameters and an **empty hypothetical_trades array** (the hypothetical flows table rows remain untouched), the modal closes, and the Projected Balance Chart and Projected Cash Flow Details table update to reflect the parameters-only result. Calculated USD amounts are shown correctly (HALF_UP, whole number) per the Illiquid NAV / Unfunded definitions above.

**Scenario 2 — Error Path:**

* Given Manual Pacing is selected and Annual Estimated Distribution (%) is left blank
* When user clicks Apply
* Then inline error "Required" appears and the panel stays open

**Scenario 3 — Edge Case:**

* Given a user enters 100.01 in any percentage field
* When they tab out or click Apply
* Then inline error "Must be between 0 and 100" is shown and Apply is blocked

**Scenario 4 — Apply with Hypothetical Flows (Happy Path):**

* Given a user has changed the Illiquid Pacing Method to **Manual** and has **2 toggled-ON hypothetical flow rows** loaded in the Hypothetical Flows table (KS-963)
* When they click **Apply with Hypothetical Flows** and the modal closes
* Then parameters are stored in session state, KS-964 is triggered with the new parameters **AND** the 2 loaded hypothetical rows in the payload, and the Projected Balance Chart and Projected Cash Flow Details table update to reflect the combined result. The hypothetical flows table rows remain untouched.

## Notes

* Sprint 2 — depends on **KS-958** (Navigation Shell)
* Output feeds into: **KS-964** (Calculate Impact) via either **Apply** (parameters only) or **Apply with Hypothetical Flows** button; defaults align scheduled run with **KS-962** (Projected Balance Chart)
* **Traceability — thousands separators (Kathleen Bui, KS-939, Jun 15, 2026):** Displayed dollar helper values for Illiquid NAV and Total Unfunded NAV must include comma thousand separators in $K/$M suffix formatting (e.g. `$5,423.9M`, `$1,198.2M`).
* **Traceability:** [**KS-939**](https://gendvn.atlassian.net/browse/KS-939) Cash Forecast UI Specs (comments through 2026-06-15); **KS-963** comment thread (Jun 2026, Kathleen Bui) — dual-button footer decision (Apply / Apply with Hypothetical Flows / Close)
* Part of Epic: KS-950 Cash Forecasting Model



**Scenario 5 — Thousands separator formatting (Manual Pacing helpers):**

* Given Manual Pacing is selected and the calculated Illiquid NAV helper displays a value ≥ $1,000,000 (e.g. `$5,423,900,000`)
* When the helper renders in the panel
* Then it displays as **`$5,423.9M`** (comma thousand separators in the numeric portion), not `$5423.9M`
