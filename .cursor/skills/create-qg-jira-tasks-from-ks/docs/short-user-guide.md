# ⚡ Quick Reference: `create-qg-jira-tasks-from-ks`

This file summarizes extremely concise prompts that you can copy/paste directly.

---

## 🚀 1. First Run & Create a New Epic
**Purpose:** For brand-new features. AI reads KS tickets and creates an entirely new Epic along with its full QA sub-hierarchy.
**Syntax:**
> `@[/create-qg-jira-tasks-from-ks] Tickets: KS-934, KS-939. Please analyze and create a new Epic containing all QA tasks.`

## 🔗 2. First Run & Link to an EXISTING Epic
**Purpose:** When an Epic already exists on the system for a feature (e.g., QG-83). Instruct AI to process KS tickets and link tasks directly to this Epic.
**Syntax:**
> `@[/create-qg-jira-tasks-from-ks] Read tickets KS-934 and KS-939 to generate tasks. Do not create a new Epic, link everything to QG-83.`

## 🔄 3. Subsequent Run (Process New KS Tickets)
**Purpose:** When a new requirement emerges as a new KS ticket, ask the AI to update the current structure and insert test cases (parent/sub-tasks) without disrupting existing data.
**Syntax:**
> `@[/create-qg-jira-tasks-from-ks] Add the requirement from KS-999 into the structure of Epic QG-83.`

## 🗂️ 4. Subsequent Run (Group Manually Created Tasks)
**Purpose:** You just manually created several standalone defects or task tickets in Jira (orphaned within the Epic). You want them cleaned up and mapped back to the right Parent Tasks automatically.
**Ultra-short Syntax:**
> `@[/create-qg-jira-tasks-from-ks] Please group the manually created tasks inside Epic QG-83 into their appropriate Parent Tasks.`

---

## 💡 Important Notes:
- Before executing Jira commands, the Skill will **always halt and display a File Preview** for approval. Type `Proceed` or `Continue` so the AI triggers Jira API calls.
- The formatting structure of all AI-generated tickets is strictly constrained to the testing standard: `*Test Objective:*`, `*Preconditions:*`, `*Test Steps:*`, `*Expected Result:*`. Missing information is natively flagged with `[TBD]`.
- Draft documents and requirements logs can be reviewed anytime in the skill's `task-analysis-records/` subdirectory.
