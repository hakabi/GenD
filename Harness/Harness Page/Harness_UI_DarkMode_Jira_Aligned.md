# Harness UI — Dark Mode, Jira-Aligned

> ### 🟢 Superseded as a source of token values — 20 August 2026
> **The shipped dark theme has been measured and does not match this document.** Harness serves the
> *refreshed* Atlassian dark palette (`#0C66E4` / `#579DFF` / `#22272B`), and it **removes shadows
> entirely** — `--elev-raised`, `--elev-overlay`, `--shadow-soft` and `--shadow-dialog` are all `none`,
> with depth expressed through a five-step surface ladder instead.
>
> Measured values: **[`Harness_UI_Tokens_Shipped_2026-08-20.md`](./Harness_UI_Tokens_Shipped_2026-08-20.md)**.
> **Take token values from that file.** This one records what was proposed on 14 Aug.

> **Companion to the style guide.** Specifies what Harness's existing dark theme becomes under the Atlassian-aligned system.
>
> **Prepared by:** Business Analyst · **Date:** 14 August 2026
> **Companion files (same folder):** `Harness_UI_DarkMode_Jira_Aligned.html` (with rendered mockup and swatches) · `Harness_UI_Style_Guide_Jira_Aligned.md` / `.html`

> ℹ️ **Harness already ships dark mode.**
> `QOps_Harness/css/tokens.css` contains a full `[data-theme="dark"]` palette, and `js/theme.js` already implements **Day / Night / System** with `localStorage` persistence and system-preference detection. The July QA screenshots (`Request1.jpg`, `Request2.jpg`, `Request3.jpg`) are all dark mode — this is what QA actually looks at.
>
> **The switching machinery is done. Only the values change.**

---

## The six rules that make it work

Dark mode is **not** the light theme inverted. Each rule below is a decision the dev team would otherwise have to make per screen; written down, they become mechanical.

| # | Rule | What it means | Why — and what breaks without it |
|---|---|---|---|
| **1** | **Never invert** | Dark mode is its own token set, not `filter: invert()` or swapped values | Inversion turns brand blue into orange and makes the failure red unreadable. Every value below was chosen, not derived |
| **2** | **Elevation is lighter, not shadowed** | Base `#161A1D` → sidebar/header `#1D2125` → panels `#22272B` → overlays `#282E33` | Shadows are invisible on a dark ground. Depth must come from surfaces getting *lighter* as they come forward — the opposite instinct to light mode |
| **3** | **Brand blue lightens for text** | Links and keys move `#0052CC` → `#579DFF`. The button *fill* stays a strong `#0C66E4` | `#0052CC` text on `#1D2125` is around 2:1 — it fails outright. But a filled button needs a saturated blue to hold white text |
| **4** | **Status colours flip their structure** | Light = pale background + dark text. Dark = **dark** background + **pale** text | Keeping the light backgrounds would put six glowing pastel blocks on a dark page. The meaning stays; the construction reverses |
| **5** | **No pure black, no pure white** | Darkest surface `#161A1D`, brightest text `#DEE4EA` | Pure white on pure black smears on OLED and causes eye strain over a long session — and QA sit in this tool all day |
| **6** | **Re-test contrast independently** | Dark mode gets its own accessibility pass | A passing light pair proves nothing about its dark counterpart. This is the most commonly skipped step, and it is why most dark modes have unreadable secondary text |

---

## Dark token set

### Surfaces — the elevation ladder

| Swatch | Token | Value | Use for |
|:---:|---|---|---|
| <span style="display:inline-block;width:34px;height:18px;background:#161A1D;border:1px solid #555;border-radius:3px"></span> | `--surface-sunken` | `#161A1D` | App background, furthest back |
| <span style="display:inline-block;width:34px;height:18px;background:#1D2125;border:1px solid #555;border-radius:3px"></span> | `--surface` | `#1D2125` | Sidebar, page header, list background |
| <span style="display:inline-block;width:34px;height:18px;background:#22272B;border:1px solid #555;border-radius:3px"></span> | `--surface-raised` | `#22272B` | Panels, cards, inputs |
| <span style="display:inline-block;width:34px;height:18px;background:#282E33;border:1px solid #555;border-radius:3px"></span> | `--surface-overlay` | `#282E33` | Dropdowns, dialogs, popovers |
| <span style="display:inline-block;width:34px;height:18px;background:#2C333A;border:1px solid #555;border-radius:3px"></span> | `--surface-hover` | `#2C333A` | Row and nav hover |

### Text and border

| Swatch | Token | Value | Use for |
|:---:|---|---|---|
| <span style="display:inline-block;width:34px;height:18px;background:#DEE4EA;border:1px solid #555;border-radius:3px"></span> | `--text-bold` | `#DEE4EA` | Headings and row titles — the brightest thing on screen |
| <span style="display:inline-block;width:34px;height:18px;background:#B6C2CF;border:1px solid #555;border-radius:3px"></span> | `--text` | `#B6C2CF` | Body text |
| <span style="display:inline-block;width:34px;height:18px;background:#9FADBC;border:1px solid #555;border-radius:3px"></span> | `--text-subtle` | `#9FADBC` | Secondary text |
| <span style="display:inline-block;width:34px;height:18px;background:#8C9BAB;border:1px solid #555;border-radius:3px"></span> | `--text-muted` | `#8C9BAB` | Metadata, timestamps, field labels |
| <span style="display:inline-block;width:34px;height:18px;background:#738496;border:1px solid #555;border-radius:3px"></span> | `--text-disabled` | `#738496` | Disabled only |
| <span style="display:inline-block;width:34px;height:18px;background:#38414A;border:1px solid #555;border-radius:3px"></span> | `--border` | `#38414A` | Dividers and panel borders |
| <span style="display:inline-block;width:34px;height:18px;background:#454F59;border:1px solid #555;border-radius:3px"></span> | `--border-input` | `#454F59` | Input and select borders — deliberately brighter, so fields stay findable |

### Brand

| Swatch | Token | Value | Light equivalent |
|:---:|---|---|---|
| <span style="display:inline-block;width:34px;height:18px;background:#579DFF;border:1px solid #555;border-radius:3px"></span> | `--brand-text` | `#579DFF` | `#0052CC` |
| <span style="display:inline-block;width:34px;height:18px;background:#0C66E4;border:1px solid #555;border-radius:3px"></span> | `--brand-bold` (button fill) | `#0C66E4` | `#0052CC` |
| <span style="display:inline-block;width:34px;height:18px;background:#1C2B41;border:1px solid #555;border-radius:3px"></span> | `--brand-subtle` (selected row) | `#1C2B41` | `#DEEBFF` |

### Status — dark lozenges

| State | Lozenge | Background / text | Light equivalent |
|---|---|---|---|
| **Queued** | <span style="display:inline-block;background:#2C333A;color:#9FADBC;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:2px 5px;border-radius:3px">Queued</span> | `#2C333A` / `#9FADBC` | `#DFE1E6` / `#42526E` |
| **Running** | <span style="display:inline-block;background:#1C2B41;color:#85B8FF;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:2px 5px;border-radius:3px">In progress</span> | `#1C2B41` / `#85B8FF` | `#DEEBFF` / `#0747A6` |
| **Awaiting review** | <span style="display:inline-block;background:#332E1B;color:#F5CD47;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:2px 5px;border-radius:3px">Awaiting review</span> | `#332E1B` / `#F5CD47` | `#FFFAE6` / `#974F0C` |
| **Passed** | <span style="display:inline-block;background:#1C3329;color:#7EE2B8;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:2px 5px;border-radius:3px">Passed</span> | `#1C3329` / `#7EE2B8` | `#E3FCEF` / `#006644` |
| **Failed** | <span style="display:inline-block;background:#42221F;color:#FD9891;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:2px 5px;border-radius:3px">Failed</span> | `#42221F` / `#FD9891` | `#FFEBE6` / `#BF2600` |
| **Duplicate / AI** | <span style="display:inline-block;background:#2B273F;color:#B8ACF6;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:2px 5px;border-radius:3px">Duplicate</span> | `#2B273F` / `#B8ACF6` | `#EAE6FF` / `#403294` |

> 📌 **Everything else is shared**
>
> Typography, spacing, the 3px radius, the component set and the accessibility rules are **identical across both themes. Only colour tokens change.** That is the whole point of building the two together — one component set, two value sets, no forked code.

---

## What this means for the existing dark theme

| Current dark token | Current value | Becomes | Note |
|---|---|---|---|
| `--bg` | `#141414` | `#161A1D` | Neutral grey → the slightly blue-cast grey Atlassian uses; it sits better under blue accents |
| `--surface` | `#1c1c1c` | `#22272B` | Now part of a defined four-step elevation ladder rather than a single value |
| `--fg` | `#ececec` | `#B6C2CF` | Current value is close to pure white — too bright for all-day use |
| `--muted` | `#9b9b9b` | `#9FADBC` | Roughly equivalent; gains the blue cast for consistency |
| `--border` | `#2e2e2e` | `#38414A` | Current borders are nearly invisible against `#1c1c1c` |
| `--accent` | `#10a37f` | `#579DFF` | Same change as light mode — frees green to mean "passed" |
| `--danger` | `#f2555a` | `#FD9891` | Current red is saturated enough to vibrate against dark grey |

> 🚨 **The scheduling consequence — worth raising with the PO**
>
> Because the theme switcher already exists, dark mode is **not a separate project**. It is a second column in the same token file, written at the same time as the light one.
>
> **Doing them together costs very little more than doing light alone. Doing dark *later* roughly doubles the work**, because every component has to be revisited and re-tested. This belongs in **phase 1** of the rollout plan, not discovered in phase 4.

---

> ⚠️ **Verify before implementing**
>
> These are Atlassian's dark-theme values as recorded by the BA, and should be checked against [atlassian.design](https://atlassian.design) before they go into code. **The rules above hold regardless** of whether individual hex codes have moved — and every pair still needs its own contrast check, per rule 6.

---

## Notes on this file

Markdown edition of `Harness_UI_DarkMode_Jira_Aligned.html`, held in the same folder. All content is identical, except the **side-by-side light/dark mockup of the Requests page**, which exists only in the HTML — open that file in a browser to see it.

Swatches are inline HTML: they render in VS Code preview, Obsidian and Typora, and are stripped by GitHub and Confluence. Every colour is written as a hex code beside its swatch, so no information is lost either way.

---

*Prepared by the BA. Static specification, not working software.*
