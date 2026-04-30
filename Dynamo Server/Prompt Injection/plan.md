# Dynamo MCP Server — Tool Classification & Security Risk Map

**Purpose:** This document provides a domain mapping and risk assessment of the 13 MCP tools registered on the Conceptia Dynamo server. It is designed to guide security testing (CHAIN, PIJ) and high-risk tracking.

---

## 1. Column Definitions & Legend

* **Tool:** The specific name of the 13 tools registered on the MCP server.
* **Class (R):** All 13 tools are labeled **R (read-only)**. By design, they only possess permissions to fetch/retrieve data and cannot Create, Update, or Delete (CUD) data in the upstream Dynamo system.
* **§1.4 (HIGH):** Marks tools identified as **High-Risk** according to Section 1.4 of the testing guide.
* **External:** Indicates if the tool calls a third-party system, service, or API (representing a data egress path).

---

## 2. Tool Classification by Risk Profile

For effective "attack-based" testing, the 13 tools are categorized into three primary groups:

### Group 1: Data Structure Exposure (High-Risk)
**Tools:** `describe_table` (#2), `list_table` (#10), and `read_data` (#12).

* **Characteristics:** Explicitly flagged as **HIGH** risk in the §1.4 guide.
* **QA Focus:** These tools are dangerous because they reveal the underlying database architecture (table names, columns) and allow direct reads of raw tabular data.
* **Testing Goal:** Focus heavily on **Authorization (AUTH)** to see if the system correctly restricts what an agent can "see" versus what it is allowed to "access".

### Group 2: External Egress & LLM-Mediated Paths
**Tools:** Tools involving external system calls or third-party processing.

* **`analyze_notes` (#1) & `llm_text_analysis` (#11):** These send data to external Large Language Models (OpenAI/Anthropic). They are the **Primary Targets** for **Prompt Injection (PIJ)** and **Data Exfiltration** scenarios.
* **`get_rating_details` (#8) & `get_rating_summary` (#9):** Reliant on the `fad API`.
* **`search_aloha_funds` (#13):** Utilizes `Elasticsearch`. Testing should focus on injection strings specific to search engine syntax.

### Group 3: Standard Internal Data Fetching
**Tools:** `get_activity` (#3), `get_documents` (#4), `get_fund_description` (#5), `get_funds` (#6), and `get_notes` (#7).

* **Characteristics:** Purely data retrieval (R) with no high-risk flags or external egress paths.
* **QA Focus:** These are relatively "safe" but should be tested for **Input Validation (INJ)**—such as passing malformed Fund IDs—and **Cross-Tenant Leakage** (ensuring User A cannot see User B's notes).

---

## 3. Domain Object Mapping

The following mapping identifies which domain objects each tool touches based on tool names and outputs (Black-box inference):

| Domain Object | Associated Tools |
| :--- | :--- |
| **Funds** | `get_funds`, `get_fund_description`, `search_aloha_funds` |
| **Notes** | `get_notes`, `analyze_notes` |
| **Documents** | `get_documents` |
| **Ratings** | `get_rating_summary`, `get_rating_details` |
| **Activity** | `get_activity` |
| **System/Schema** | `list_table`, `describe_table`, `read_data` |

---

> **Summary for Lead:** To maximize the discovery of critical vulnerabilities, the testing effort will prioritize the **LLM-mediated tools (#1, #11)** for exfiltration and the **Discovery/Tabular tools (#2, #10, #12)** for schema exposure.