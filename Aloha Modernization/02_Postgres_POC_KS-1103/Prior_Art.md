# Prior Art — what KAM already documents

**Do not re-document any of this.** The Confluence space **KAM** has been accumulating Aloha data-platform
documentation since 2022. Several pages bear directly on KS-1103 and KS-1104. Link them; correct them if
they are stale; do not write parallel versions.

**Owner:** BA · **Compiled:** 21 August 2026 · **Space:** [KAM](https://gendvn.atlassian.net/wiki/spaces/KAM)

> ⚠️ **Ages unverified.** These pages were found by listing the space, not by reading them. Some date to
> 2022–2023. **Check each before relying on it** — a stale schema document is worse than none.

---

## 1. Database structure — the core reference for KS-1103

The migration cannot be scoped without knowing what is being migrated. These describe the current Mongo
side.

| Page | Why it matters |
|---|---|
| [Current Database Structure](https://gendvn.atlassian.net/wiki/spaces/KAM/pages/167870479) | ⭐ **Start here.** The baseline the POC compares against |
| [Pipeline Data Structure](https://gendvn.atlassian.net/wiki/spaces/KAM/pages/221118479) | |
| [Cambridge Fund Structure](https://gendvn.atlassian.net/wiki/spaces/KAM/pages/168951809) | |
| [Solovis Database Structure](https://gendvn.atlassian.net/wiki/spaces/KAM/pages/175833089) | |
| [Evestment Data Structure](https://gendvn.atlassian.net/wiki/spaces/KAM/pages/196608001) | |

Related in-use notes: [Solovis in use](https://gendvn.atlassian.net/wiki/spaces/KAM/pages/377978891) ·
[Evestment in use](https://gendvn.atlassian.net/wiki/spaces/KAM/pages/377946116) ·
[Alternatives Evestment in use](https://gendvn.atlassian.net/wiki/spaces/KAM/pages/378011652)

## 2. Trino — the component that stays

KS-1103 keeps Trino and swaps only the adapter/connector. **How Trino is currently deployed and used is
therefore a constraint on the POC, not a variable.**

| Page | Why it matters |
|---|---|
| [Trino MCP deploy](https://gendvn.atlassian.net/wiki/spaces/KAM/pages/380796929) | Existing deployment shape |
| [Trino MCP Usage](https://gendvn.atlassian.net/wiki/spaces/KAM/pages/380436481) | How queries reach it today |
| [MCP-Remote with azure](https://gendvn.atlassian.net/wiki/spaces/KAM/pages/382566401) | Remote/hosting context |

## 3. Data loading and workflows — bears on KS-1104

| Page | Why it matters |
|---|---|
| [Dynamo Data Loader](https://gendvn.atlassian.net/wiki/spaces/KAM/pages/228163588) | A loader in the Digdag → Airflow scope |
| [More Concerns for Dynamo Data](https://gendvn.atlassian.net/wiki/spaces/KAM/pages/231505927) | Known problems — read before assuming a clean migration |
| [Solovis API and workflows](https://gendvn.atlassian.net/wiki/spaces/KAM/pages/282198017) | Upstream workflow behaviour |
| [Solovis returns status](https://gendvn.atlassian.net/wiki/spaces/KAM/pages/188350465) | |
| [Force Sync Pipeline Fund Data — Technical Guide](https://gendvn.atlassian.net/wiki/spaces/KAM/pages/449118209) | ⭐ Most recent of this group. A concrete data-sync procedure |

## 4. Benchmarking precedent

| Page | Why it matters |
|---|---|
| [SQL benchmark history insert](https://gendvn.atlassian.net/wiki/spaces/KAM/pages/220856379) | There is prior benchmarking practice here. **Read it before designing a new method** — reusing an established shape makes results comparable |

## 5. What to do with this

1. **Before writing `Benchmark_Design.md`**, read §1 and §4. The schema baseline and any existing
   benchmark method should shape the design, not be rediscovered.
2. **Before scoping KS-1104**, read §3. "More Concerns for Dynamo Data" is exactly the kind of page that
   turns a clean-looking migration into a real one.
3. **Where a page is stale**, correct it in place in Confluence and note the correction in
   [`../00_Program/Decision_Log.md`](../00_Program/Decision_Log.md). Do not fork it into this folder.
4. **Where a page is missing**, write it here and publish it into the KAM subtree for this programme.
