# Harness UI Style Guide — Atlassian-Aligned

> ### 🟢 Superseded as a source of token values — 20 August 2026
> **This was a proposal, and it has shipped.** Harness now serves an Atlassian-aligned light theme with a
> Day / Night / System switch. The values below were written on 14 Aug, partly from memory (open item O9);
> the values actually served were measured on 20 Aug and recorded in
> **[`Harness_UI_Tokens_Shipped_2026-08-20.md`](./Harness_UI_Tokens_Shipped_2026-08-20.md)**.
>
> **Take token values from that file, not this one.** This document remains useful for its component
> specs, accessibility notes and the reasoning behind the system — none of which the measured file covers.

> **The build specification that accompanies the decision memo.** Written for developers: every value here is meant to be copied into `tokens.css` and used as the single source of truth.
>
> **Prepared by:** Business Analyst · **Date:** 14 August 2026
> **Confluence:** [3. UI Style Guide — Atlassian-Aligned Tokens and Components](https://gendvn.atlassian.net/wiki/spaces/QG/pages/534740993)
> **Companion files:** `Harness_UI_Style_Guide_Jira_Aligned.html` (same content, with rendered swatches and live component examples)

Modelled on the Atlassian Design System — the system behind Jira, which our team uses daily. We are adopting its **values and patterns in our own code**; we are **not** installing Atlassian's component library. See the memo, section 3, option C.

> ⚠️ **Verify before implementing**
>
> The colour values below are Atlassian's published palette as recorded by the BA, and should be checked against [atlassian.design](https://atlassian.design) before they go into code — Atlassian has been migrating to a newer token set, and some values may have moved. This does not change the recommendation; it changes which hex codes you type.

---

## 1 · Colour

Three groups: **brand** (one blue, used only for interaction), **neutrals** (everything structural), and **status** (meaning only — never decoration).

### 1.1 Brand

| Swatch | Token | Value | Use for |
|:---:|---|---|---|
| <span style="display:inline-block;width:34px;height:18px;background:#0052CC;border:1px solid #ccc;border-radius:3px"></span> | `--brand` | `#0052CC` | Primary buttons, links, active nav text, focus rings, request keys |
| <span style="display:inline-block;width:34px;height:18px;background:#0747A6;border:1px solid #ccc;border-radius:3px"></span> | `--brand-dark` | `#0747A6` | Hover and pressed state of the above |
| <span style="display:inline-block;width:34px;height:18px;background:#DEEBFF;border:1px solid #ccc;border-radius:3px"></span> | `--brand-subtle` | `#DEEBFF` | Selected row background, active nav background, info lozenge |

### 1.2 Neutrals

| Swatch | Token | Value | Use for |
|:---:|---|---|---|
| <span style="display:inline-block;width:34px;height:18px;background:#172B4D;border:1px solid #ccc;border-radius:3px"></span> | `--text` | `#172B4D` | All primary text. **Never pure black** |
| <span style="display:inline-block;width:34px;height:18px;background:#42526E;border:1px solid #ccc;border-radius:3px"></span> | `--text-2` | `#42526E` | Secondary text, subtle button labels, nav items at rest |
| <span style="display:inline-block;width:34px;height:18px;background:#6B778C;border:1px solid #ccc;border-radius:3px"></span> | `--text-muted` | `#6B778C` | Metadata, timestamps, uppercase field labels |
| <span style="display:inline-block;width:34px;height:18px;background:#A5ADBA;border:1px solid #ccc;border-radius:3px"></span> | `--text-disabled` | `#A5ADBA` | Disabled text only. Never for body copy |
| <span style="display:inline-block;width:34px;height:18px;background:#DFE1E6;border:1px solid #ccc;border-radius:3px"></span> | `--border` | `#DFE1E6` | Every border and divider |
| <span style="display:inline-block;width:34px;height:18px;background:#F4F5F7;border:1px solid #ccc;border-radius:3px"></span> | `--surface-sunken` | `#F4F5F7` | App background behind panels; secondary button fill |
| <span style="display:inline-block;width:34px;height:18px;background:#FAFBFC;border:1px solid #ccc;border-radius:3px"></span> | `--surface-input` | `#FAFBFC` | Input and select fill at rest |
| <span style="display:inline-block;width:34px;height:18px;background:#FFFFFF;border:1px solid #ccc;border-radius:3px"></span> | `--surface` | `#FFFFFF` | Panels, cards, sidebar, list background |

### 1.3 Status — the important one

Harness currently shows status **four different ways** across screens. **This table ends that.** Each Harness state maps to exactly one lozenge, everywhere it appears.

| Harness state | Lozenge | Background / text | Meaning shown to user |
|---|---|---|---|
| **Queued** | <span style="display:inline-block;background:#DFE1E6;color:#42526E;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:2px 5px;border-radius:3px">Queued</span> | `#DFE1E6` / `#42526E` | Accepted, not started |
| **Running** | <span style="display:inline-block;background:#DEEBFF;color:#0747A6;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:2px 5px;border-radius:3px">In progress</span> | `#DEEBFF` / `#0747A6` | Executing now |
| **Awaiting review** | <span style="display:inline-block;background:#FFFAE6;color:#974F0C;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:2px 5px;border-radius:3px">Awaiting review</span> | `#FFFAE6` / `#974F0C` | Blocked on a person — **QG-150** |
| **Passed** | <span style="display:inline-block;background:#E3FCEF;color:#006644;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:2px 5px;border-radius:3px">Passed</span> | `#E3FCEF` / `#006644` | All cases passed |
| **Failed** | <span style="display:inline-block;background:#FFEBE6;color:#BF2600;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:2px 5px;border-radius:3px">Failed</span> | `#FFEBE6` / `#BF2600` | One or more cases failed |
| **Duplicate** | <span style="display:inline-block;background:#EAE6FF;color:#403294;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:2px 5px;border-radius:3px">Duplicate</span> | `#EAE6FF` / `#403294` | Blocked by dedupe — **not a failure** |
| **AI fallback used** | <span style="display:inline-block;background:#EAE6FF;color:#403294;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:2px 5px;border-radius:3px">AI</span> | `#EAE6FF` / `#403294` | Step ran via AI, not Playwright |

> ⚠️ **Rule: colour never carries meaning alone**
>
> Every lozenge shows a **word** as well as a colour. Roughly one in twelve men has some colour-vision deficiency, and status is the one thing in Harness nobody can afford to misread. This also means status survives a black-and-white printout or a screenshot pasted into a ticket.

---

## 2 · Typography

One family. **Weight and size carry hierarchy** — not colour, and not italics.

- **Font stack:** `-apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`
- **Numeric / ID stack:** `"Fira Code", ui-monospace, Consolas, monospace`

| Role | Size / weight | Notes |
|---|---|---|
| Page title | 24px / 600 / -0.01em | One per screen |
| Section heading | 20px / 600 | — |
| Panel heading | 16px / 600 | — |
| Body | 14px / 400 / line-height 1.5 | The default for everything readable |
| Metadata | 12px / 400 | Timestamps, secondary detail |
| Field label | 11px / 700 / uppercase / 0.06em | Above values in the details panel |
| Mono / numeric | 13px / tabular | IDs, durations, counts |

> 📌 **Use tabular figures for all numbers in columns**
>
> `font-variant-numeric: tabular-nums` on durations, counts, timestamps and IDs. Without it, digits have different widths and columns visibly jitter as the queue refreshes — a small detail that reads as sloppiness.

---

## 3 · Spacing, radius, elevation

A **4px base**. Only these steps — no arbitrary values.

| Step | Use for |
|---|---|
| `4px` | Icon to label |
| `8px` | Inside a component |
| `12px` | Between related elements |
| `16px` | Panel padding, default gap |
| `24px` | Between panels |
| `32px` | Between sections |

| Property | Value | Applies to |
|---|---|---|
| **Border radius** | `3px` | Everything — buttons, inputs, panels, lozenges. Atlassian is square; this is a big part of why it reads as businesslike |
| **Radius (avatar)** | `50%` | Avatars only |
| **Elevation — card** | `0 1px 1px rgba(9,30,66,.25)` | Panels lifted off the sunken background |
| **Elevation — overlay** | `0 4px 8px rgba(9,30,66,.25)` | Dropdowns, dialogs, popovers |
| **Focus ring** | `0 0 0 2px #4C9AFF` | Every focusable element. **Never remove it** |
| **Transition** | `150ms ease-out` | Hover and state changes. Nothing slower than 300ms |

---

## 4 · Component set

The minimum vocabulary needed to rebuild the Requests page. **Build these once; every screen after that is assembly.**

### 4.1 Buttons — one primary action per screen

<span style="display:inline-block;background:#0052CC;color:#fff;border-radius:3px;padding:7px 13px;font-size:13px;font-weight:500">Create request</span>&nbsp;
<span style="display:inline-block;background:#F4F5F7;color:#42526E;border-radius:3px;padding:7px 13px;font-size:13px;font-weight:500">Cancel</span>&nbsp;
<span style="display:inline-block;color:#42526E;border-radius:3px;padding:7px 13px;font-size:13px;font-weight:500">Subtle action</span>&nbsp;
<span style="display:inline-block;background:#DE350B;color:#fff;border-radius:3px;padding:7px 13px;font-size:13px;font-weight:500">Delete</span>&nbsp;
<span style="display:inline-block;background:#F4F5F7;color:#A5ADBA;border-radius:3px;padding:7px 13px;font-size:13px;font-weight:500">Disabled</span>

| Variant | Fill / text | When |
|---|---|---|
| **Primary** | `#0052CC` / `#FFFFFF` | The one main action. **Never two on a screen** |
| **Secondary** | `#F4F5F7` / `#42526E` | Cancel, and supporting actions |
| **Subtle** | `transparent` / `#42526E` | Tertiary actions in dense areas |
| **Danger** | `#DE350B` / `#FFFFFF` | Destructive only, and always confirmed first |

### 4.2 Lozenge — the status component

```
font-size: 11px · font-weight: 700 · text-transform: uppercase
letter-spacing: .04em · padding: 2px 5px · border-radius: 3px
```

States and colours are defined in **section 1.3** above. **No other status treatment is permitted anywhere in the product.**

### 4.3 Request key

<span style="font-size:13px;font-weight:600;color:#0052CC;font-family:monospace">REQ-1042</span> — always monospace-adjacent, always brand blue, always clickable.

Replaces `#79c94116-ca3`. This is **QG-141 delivered** — a sequential identifier a person can say out loud in a stand-up and type into a search box.

### 4.4 Controls

<span style="display:inline-block;border:1px solid #DFE1E6;background:#FAFBFC;border-radius:3px;padding:6px 11px;font-size:13px;color:#42526E">My requests ▾</span>&nbsp;
<span style="display:inline-block;border:1px solid #DFE1E6;background:#FAFBFC;border-radius:3px;padding:6px 11px;font-size:13px;color:#42526E">All statuses ▾</span>&nbsp;
<span style="display:inline-block;border:1px solid #DFE1E6;background:#FAFBFC;border-radius:3px;padding:6px 11px;font-size:13px;color:#7A869A;min-width:200px">Search requests…</span>

These replace the four native `<select>` elements. **A styled control renders identically on every machine; a native one does not.**

### 4.5 Tabs

Counts in the label where a number is known — *Details* · *Execution 4* · *History 6*. Two-pixel underline in brand blue for the active tab.

### 4.6 Sidebar navigation

Grouped under uppercase section labels:

```
WORK
  Requests          6
  Test cases      313
  Test groups
CONTEXT
  Knowledge
  Dashboards
```

Active item gets `#DEEBFF` fill and brand-blue text. **Labels always visible** — icon-only navigation hurts discoverability and fails accessibility review.

### 4.7 Details panel

Two columns, uppercase labels above values:

| | |
|---|---|
| **STATUS**<br>Failed at step 4 of 4 | **REQUEST MODE**<br>Single test case |
| **CREATED**<br>10 Jul 2026, 10:33 | **CREATED BY**<br>nguyenhoangly103 |

Identical to the pattern the team reads in Jira daily — **zero learning cost**.

---

## 5 · Accessibility rules — non-negotiable

| Rule | Why |
|---|---|
| **Body text contrast ≥ 4.5:1** | `#172B4D` on white clears this comfortably. `#A5ADBA` does not — disabled states only |
| **Never remove the focus ring** | Keyboard users navigate by it. Restyle it if you must; never delete it |
| **Colour is never the only signal** | Every status carries a word. Every icon-only button carries an `aria-label` |
| **Click targets ≥ 32px tall** | Applies to queue rows, nav items and dropdowns |
| **Respect `prefers-reduced-motion`** | Disable transitions when the user has asked the OS for that |

---

## 6 · Migration from the current tokens

`QOps_Harness/css/tokens.css` already has the right *shape* — a token file with light and dark themes. The work is replacing the values and then **actually using them** in the other eleven stylesheets.

| Current token | Current value | Becomes | Note |
|---|---|---|---|
| `--accent` | `#10a37f` | `#0052CC` | Frees green to mean "passed" and nothing else |
| `--fg` | `#0d0d0d` | `#172B4D` | Near-black is harsher than it needs to be |
| `--muted` | `#6e6e6e` | `#6B778C` | — |
| `--border` | `#e5e5e5` | `#DFE1E6` | — |
| `--surface` | `#f5f5f5` | `#F4F5F7` | — |
| `--danger` | `#ef4146` | `#DE350B` | — |
| `--radius-sm` / `--radius-md` | `12px` / `16px` | `3px` | **The single biggest visual shift.** Rounded reads consumer; square reads professional-tool |
| `--font-body` | `"Söhne", Inter…` | system stack | Drops a font dependency and matches Jira's feel |
| `--font-display` | `"Signifier"` serif | *remove* | Currently used once, in the logo. No role in this system |

> 🚨 **The rule that makes this stick**
>
> After migration, **no colour, spacing or radius value may appear in any stylesheet except `tokens.css`**. If a screen needs a value that does not exist, that is a conversation with the token owner — not a local override.
>
> Without this rule the twelve stylesheets drift apart again within a month, and we will have spent the effort for nothing.

---

## 7 · Dark mode

**Everything in sections 1.1–1.3 above is the *light* theme.** Harness already ships a dark theme — `tokens.css` has a full `[data-theme="dark"]` palette and `theme.js` implements Day / Night / System — so the light values alone are only half a specification.

The dark token set, the six rules that govern it, and a side-by-side mockup of the Requests page in both themes are in the companion document:

- **`Harness_UI_DarkMode_Jira_Aligned.md`** / **`.html`** (same folder)

> 🚨 **Schedule the two together.**
>
> Because the theme switcher already exists, dark mode is a second column in the same token file — **doing both at once costs very little more than doing light alone.** Doing dark later roughly doubles the work, because every component must be revisited and re-tested.
>
> This belongs in **phase 1** of the rollout plan. If only the light theme is specified, phase 3 ships a Requests page that is correct in Day mode and still carrying the old teal and 12px radii in Night mode — which is exactly the half-converted state the plan warns against.

**Sections 2 through 6 apply to both themes unchanged.** Typography, spacing, radius, the component set and the accessibility rules are shared. Only colour tokens differ.

---

## Notes on this file

This is the Markdown edition of `Harness_UI_Style_Guide_Jira_Aligned.html`, held in the same folder. **All content is identical.**

The colour swatches and component examples are written as inline HTML. They render in **VS Code preview, Obsidian, Typora and most desktop Markdown viewers**, but GitHub and Confluence strip inline styles — in those, the swatches disappear and you see the hex values only. No information is lost either way, since every colour is written out as a hex code beside its swatch. **For a faithful visual, open the `.html` file in a browser.**

---

*Prepared by the BA to accompany `Harness_UI_System_Decision_Memo.md`, `Harness_UI_Current_vs_Jira_Comparison.html` and `Harness_UI_System_Rollout_Plan.md`. Values require verification against [atlassian.design](https://atlassian.design), and the component list requires dev-team sizing, before any sprint commitment.*
