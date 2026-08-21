# Aloha Redesign — Design Reference (extracted)

**Source:** [`source/index.html`](./source/index.html) — *KSBE IMG — Endowment Dashboard*, the customer design handoff
referenced by **[KS-1102](https://gendvn.atlassian.net/browse/KS-1102)**.

**Why this file exists:** the source is **1.88 MB** — roughly 1.5 MB of it is base64-embedded Inter
fonts and two inline fund-table blobs (441 KB and 909 KB). No agent can read it, and a person opening it
in an editor will not find the tokens either. This file is the readable extract. Values were **measured
from the source**, not transcribed by eye.

**Status:** reference for building. Where this file and `source/index.html` disagree, **`index.html` wins** —
re-extract rather than hand-edit.

---

## 1. Theme model

```html
<html lang="en" data-theme="dark">
```

**Dark is the default** (`:root`); light is the override (`[data-theme="light"]`). This is the opposite
of Harness, where light is the base. 29 custom properties, both themes complete.

## 2. Tokens

### Surfaces and text

| Token | Dark (default) | Light |
|---|---|---|
| `--bg` | `#0d1117` | `#eef2f7` |
| `--bg2` | `#161b27` | `#ffffff` |
| `--bg3` | `#1e2536` | `#e2e8f0` |
| `--bg4` | `#252e42` | `#d4dce8` |
| `--t1` | `#f6f9ff` | `#060d14` |
| `--t2` | `#e4ecf7` | `#0f1e2e` |
| `--t3` | `#c0cede` | `#1e3248` |
| `--t4` | `#90a4bc` | `#3a536b` |
| `--border` | `rgba(255,255,255,.12)` | `rgba(0,0,0,.13)` |
| `--border2` | `rgba(255,255,255,.07)` | `rgba(0,0,0,.08)` |

Four surface steps and a four-step text ramp (`t1` brightest → `t4` dimmest). Borders are **alpha**, not
solid hex — they composite over whatever surface they sit on.

### Semantic finance colours

| Token | Dark | Light | Meaning |
|---|---|---|---|
| `--up` / `--up-lt` | `#10b981` / `rgba(16,185,129,.12)` | `#047857` / `rgba(4,120,87,.10)` | Gain |
| `--dn` / `--dn-lt` | `#f43f5e` / `rgba(244,63,94,.12)` | `#be123c` / `rgba(190,18,60,.10)` | Loss |
| `--blue` / `--blue-lt` | `#3b82f6` / `rgba(59,130,246,.12)` | `#1d4ed8` / `rgba(29,78,216,.10)` | Primary |
| `--teal` / `--teal-lt` | `#06b6d4` / `rgba(6,182,212,.12)` | `#0e7490` / `rgba(14,116,144,.10)` | Category |
| `--amber` / `--amber-lt` | `#f59e0b` / `rgba(245,158,11,.12)` | `#b45309` / `rgba(180,83,9,.10)` | Warning |
| `--purple` / `--purple-lt` | `#8b5cf6` / `rgba(139,92,246,.12)` | `#6d28d9` / `rgba(109,40,217,.10)` | Category |

Every hue ships a solid and a `-lt` tint. **The tint is always alpha** — use it for backgrounds, the
solid for text, strokes and fills.

### Chart tokens

`--chart-axis-lbl` · `--chart-bench-lbl` · `--chart-bench-lbl-strong` · `--chart-cat-lbl` ·
`--grid-faint` · `--grid-line` · `--grid-strong`

A dedicated set for data-viz labelling and gridlines, all alpha. This is a **chart-heavy** design —
treat these as first-class, not leftovers.

## 3. Typography

- **Inter** — weights **300, 400, 500** only. Embedded as woff2 in the source. Stack:
  `"Inter", system-ui, sans-serif`
- **IBM Plex Mono** — numeric and tabular content: `"IBM Plex Mono", monospace`

There is **no single radius token**. Observed values are ad hoc: `2px`, `3px`, `4px`, `5px`, `7px`, `9px`.
**Pick one scale during M0 and record the decision** — this is a gap in the handoff, not a system.

## 4. Navigation — the route skeleton

Sidebar order, as the design defines it. **[KS-1105](https://gendvn.atlassian.net/browse/KS-1105) (M0)
requires empty routes for all of these**, in this order.

| Group | Item | Handler |
|---|---|---|
| **Overview** | At a Glance | `glance` |
| | Risk | `risk` |
| | Allocation | `allocation` |
| | Cash Forecast | `cashfc` |
| **Performance** | Summary | `perf` |
| | Top Funds *(badge: 10)* | `topfunds` |
| | Bottom Funds | `bottomfunds` |
| **Models** | Risk Model | `showModel('risk')` |
| | Cash Forecast Model | `showModel('cash')` |
| | Equity Beta Model | `showModel('beta')` |
| **Funds** | Public Funds | `publicfunds` |
| | Private Funds | `privatefunds` |

Header shows `KSBE IMG · Investment Management Group` and a status chip: `Aloha · Port 3000 · Live`.

## 5. Model sub-tabs

| Model | Tabs in the design | Count |
|---|---|---|
| Risk Model | Output · Parameters · History | **3** |
| Cash Forecast Model | Dashboard · Historical Flows · Details | 3 |
| Equity Beta Model | **Scenario Test** · Model Detail | 2 |

### 🔴 Finding — the "missing" Scenario Testing tab is *relocated*, not dropped

KS-1102 lists as a known gap: *"Risk Model Scenario Testing tab (prod has 4 tabs; design has 3)."*

**The design side is confirmed.** The Risk Model has exactly three tabs — Output, Parameters, History.

**But Scenario Test is not absent from the design.** It exists as the *first and default* tab of the
**Equity Beta Model** (`switchBetaTab('scen')`), with a full implementation: a Test Scenario Input
control, a `Calculate Scenario` action, `Reset Flows`, and a table carrying *Expected Beta · Current
NAV/MV · Scenario Flows ($M) · Scenario NAV · % of Endowment (Current) · % of Endowment (Scenario)*.

**This changes the question for KS.** Not *"was Scenario Testing forgotten?"* but:

> Is Scenario Testing **moving** from the Risk Model to the Equity Beta Model — and is the Equity Beta
> version the same function, or a different, beta-specific one that leaves a genuine gap in Risk?

> ⚠️ **The production side of this comparison is not verified here.** It is inferred from the filenames of
> four screenshots in `../../Harness/Aloha Page/` — `Risk Tab.jpg`, `…with Parameters subtab.jpg`,
> `…with History subtab.jpg`, `…with Scenario Testing.jpg`. Open them, or the live app, before taking
> this to KS.

The other three known gaps — **Pipeline module**, **Liquidity sidebar home**, **Owned by KS filter** —
have no counterpart anywhere in the design's navigation (§4). They appear to be genuine omissions.
`Harness/Aloha Page/Pipeline Page.jpg` is the production evidence for the first.

## 6. Component vocabulary

Class names to reuse rather than reinvent, by frequency in the source:

| Area | Classes |
|---|---|
| Cards | `card` · `card-hd` · `card-title` · `sec-meta` |
| Controls | `mbtn` · `mbtn-sec` · `mbtn-gh` · `minput` · `minput-xs` · `mfield` · `mfield-lbl` |
| Tables | `dtable` · `uni-table` · `uni-row` · `uni-cell` · `uni-namecell` · `tr-cat` · `r` (right-align) |
| Risk bars | `rbar` · `rbar-track` · `rbar-fill` · `rbar-lbl` · `rbar-val` · `rbar-meta` · `trisk` |
| Model tabs | `mtabs` · `mtab` |
| Charts | `rc-leg-item` |

`r` (1299 uses) is the right-align utility on numeric cells — the single most common class in the file.

## 7. ⚠️ This is not the Harness design system

Do not cross-contaminate. They share nothing:

| | **Aloha redesign** | **Harness** |
|---|---|---|
| Base theme | **Dark** (`:root`) | **Light** (`:root`) |
| Font | Inter + IBM Plex Mono | OS system stack + Fira Code |
| Palette | Tailwind family — `#3b82f6`, `#10b981`, `#f43f5e` | Atlassian — `#0052CC`, `#0C66E4` |
| Radius | Ad hoc 2–9px, no system | 3px everywhere |
| Semantics | `up` / `dn` finance colours | `passed` / `failed` / `review` status pills |
| Elevation | Alpha borders over four surfaces | Shadows in light, surface ladder in dark |

Applying Harness's Atlassian tokens to an Aloha screen produces confidently wrong output, and vice versa.
Reference: `../../Harness/Harness Page/Harness_UI_Tokens_Shipped_2026-08-20.md`.

## 8. Open questions for KS

| # | Question |
|---|---|
| **D-1** | Scenario Testing — relocation to Equity Beta Model, or a real gap in Risk? (§5) |
| **D-2** | Pipeline module, Liquidity sidebar home, Owned by KS filter — intentionally out of scope, or omissions? |
| **D-3** | No radius scale exists in the handoff. Which value becomes the system during M0? |
| **D-4** | Inter ships at 300/400/500 only. Is a heavier weight needed for headings, or is 500 the ceiling? |

---

## Provenance

Extracted 20 August 2026 from `source/index.html` by parsing the file's own CSS rules and markup — custom
properties resolved from the `:root` and `[data-theme="light"]` blocks, navigation from the sidebar
markup in document order, model tabs from each `#model-view-*` container. Lines over 20 KB (embedded
fonts and two inline table blobs) were excluded from text scanning but contain no token definitions.
