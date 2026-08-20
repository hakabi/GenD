# Harness UI — Shipped Token Set (measured)

**What this is:** the **actual** CSS custom properties served by `qops-harness.lab.gend.vn`, read from
`getComputedStyle(document.documentElement)` on 20 August 2026, in both themes.

**Why it exists:** [`Harness_UI_Style_Guide_Jira_Aligned.md`](./Harness_UI_Style_Guide_Jira_Aligned.md)
and [`Harness_UI_DarkMode_Jira_Aligned.md`](./Harness_UI_DarkMode_Jira_Aligned.md) describe the token set
we **proposed** in mid-August, partly quoted from memory (open item O9). This file records what the
platform **actually shipped**. Where the two disagree, **this file wins** — it was measured, not recalled.

> **Status of the proposal:** decisions **D2** (adopt Atlassian values in our own code) and **D3**
> (light and dark together, phase 1) have effectively shipped. This is no longer a proposal to argue for.

---

## 1. How the theme system works

The `<html>` element carries two attributes:

| Attribute | Values | Meaning |
|---|---|---|
| `data-appearance` | `day` · `night` · `system` | The user's **choice**, set at Settings → Appearance |
| `data-theme` | `light` · `dark` | The **resolved** theme actually painted |

`system` resolves to `light` or `dark` from the OS. So a mockup must handle **three** states, not two:
an explicit day choice, an explicit night choice, and following `prefers-color-scheme`.

UI copy, verbatim: *"Choose day, night, or match your operating system. Applies across all QOps Harness
screens."*

92 custom properties are defined; both themes define all 92.

---

## 2. Colour tokens — light and dark side by side

### Brand and accent

| Token | Light (`day`) | Dark (`night`) |
|---|---|---|
| `--brand` | `#0052CC` | `#0C66E4` |
| `--brand-dark` | `#0747A6` | `color-mix(in oklab, #0C66E4, #579DFF 28%)` |
| `--brand-subtle` | `#DEEBFF` | `#1C2B41` |
| `--brand-text` | `#0052CC` | `#579DFF` |
| `--accent` | `#0052CC` | `#579DFF` |
| `--accent-hover` | `#0747A6` | `color-mix(in oklab, #579DFF, white 10%)` |
| `--accent-on` | `#FFFFFF` | `#DEE4EA` |
| `--accent-soft` | `#DEEBFF` | `#1C2B41` |
| `--focus-color` | `#4C9AFF` | `#579DFF` |
| `--focus-ring` | `0 0 0 2px #4C9AFF` | `0 0 0 2px #579DFF` |

### Surfaces

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#FFFFFF` | `#22272B` |
| `--surface` | `#F4F5F7` | `#161A1D` |
| `--surface-raised` | `#FFFFFF` | `#22272B` |
| `--surface-nav` | `#FFFFFF` | `#1D2125` |
| `--surface-overlay` | `#FFFFFF` | `#282E33` |
| `--surface-sunken` | `#F4F5F7` | `#161A1D` |
| `--surface-warm` | `#F4F5F7` | `#1D2125` |
| `--surface-input` | `#FAFBFC` | `#22272B` |
| `--surface-hover` | `#F4F5F7` ⚠️ | `#2C333A` |

### Text

| Token | Light | Dark |
|---|---|---|
| `--text` / `--fg` | `#172B4D` | `#B6C2CF` |
| `--text-bold` | `#172B4D` | `#DEE4EA` |
| `--text-2` / `--text-subtle` | `#42526E` | `#9FADBC` |
| `--fg-2` | `#42526E` | `#DEE4EA` |
| `--text-muted` / `--muted` | `#6B778C` | `#8C9BAB` / `#9FADBC` |
| `--meta` | `#A5ADBA` | `#8C9BAB` |
| `--text-disabled` | `#A5ADBA` | `#738496` |

> `--muted` resolves to `#6B778C` light / `#9FADBC` dark; `--text-muted` to `#6B778C` light /
> `#8C9BAB` dark. They are **not** aliases in dark.

### Borders

| Token | Light | Dark |
|---|---|---|
| `--border` | `#DFE1E6` | `#38414A` |
| `--border-soft` | `#DFE1E6` | `#38414A` |
| `--border-input` | `#DFE1E6` | `#454F59` |

### Status pills

| Token | Light bg / fg | Dark bg / fg |
|---|---|---|
| `passed` | `#E3FCEF` / `#006644` | `#1C3329` / `#7EE2B8` |
| `failed` | `#FFEBE6` / `#BF2600` | `#42221F` / `#FD9891` |
| `running` | `#DEEBFF` / `#0747A6` | `#1C2B41` / `#85B8FF` |
| `review` | `#FFFAE6` / `#974F0C` | `#332E1B` / `#F5CD47` |
| `queued` | `#DFE1E6` / `#42526E` | `#2C333A` / `#9FADBC` |
| `ai` | `#EAE6FF` / `#403294` | `#2B273F` / `#B8ACF6` |
| `duplicate` | `#EAE6FF` / `#403294` | `#2B273F` / `#B8ACF6` |

`ai` and `duplicate` are identical in both themes — the two states are visually indistinguishable.

### Feedback

| Token | Light | Dark |
|---|---|---|
| `--success` / `--success-bg` | `#006644` / `#E3FCEF` | `#7EE2B8` / `#1C3329` |
| `--danger` | `#DE350B` | `#FD9891` |
| `--danger-bg` / `--danger-fg` | `#FFEBE6` / `#BF2600` | `#42221F` / `#FD9891` |
| `--warn` / `--warning` | `#974F0C` | `#F5CD47` |
| `--warn-bg` | `#FFFAE6` | `#332E1B` |
| `--info-bg` / `--info-fg` | `#EAE6FF` / `#403294` | `#2B273F` / `#B8ACF6` |

### Buttons

| Token | Light | Dark |
|---|---|---|
| `--btn-primary-bg` | `#0052CC` | `#0C66E4` |
| `--btn-primary-fg` | `#FFFFFF` | `#FFFFFF` |
| `--btn-primary-hover` | `#0747A6` | `color-mix(in oklab, #0C66E4, #579DFF 28%)` |
| `--btn-secondary-bg` | `#F4F5F7` | `#1D2125` |
| `--btn-secondary-fg` | `#42526E` | `#9FADBC` |
| `--btn-danger-bg` | `#DE350B` | `#42221F` |
| `--btn-danger-fg` | `#FFFFFF` | `#FD9891` |
| `--chat-user-bg` / `--chat-user-fg` | `#0052CC` / `#FFFFFF` | `#0C66E4` / `#FFFFFF` |

---

## 3. Elevation — the biggest structural difference

**Dark mode removes shadows entirely** and expresses depth through surface colour instead.

| Token | Light | Dark |
|---|---|---|
| `--elev-raised` / `--shadow-soft` | `0 1px 1px rgba(9, 30, 66, 0.25)` | `none` |
| `--elev-overlay` / `--shadow-dialog` | `0 4px 8px rgba(9, 30, 66, 0.25)` | `none` |
| `--shadow-inset` | `inset 0 1px 2px rgba(9, 30, 66, 0.08)` | `inset 0 1px 0 #38414A` |

The dark surface ladder, darkest to lightest:

```
#161A1D  sunken / surface
#1D2125  nav / warm / secondary button
#22272B  bg / raised / input
#282E33  overlay
#2C333A  hover
```

**Consequence for mockups:** a dark mockup that draws card shadows is wrong. Depth in Night mode comes
from stepping up this ladder.

---

## 4. Non-colour tokens (identical in both themes)

| Group | Values |
|---|---|
| **Spacing** | `--space-1` 4px · `-2` 8px · `-3` 12px · `-4` 16px · `-6` 24px · `-8` 32px |
| **Radius** | `--radius-sm` / `-md` / `-pill` all **3px** · `--radius-avatar` 50% |
| **Type scale** | `--text-label` 11px · `--text-meta` 12px · `--text-mono` 13px · `--text-body` 14px · `--text-panel` 16px · `--text-section` 20px · `--text-page` 24px |
| **Motion** | `--motion-fast` 150ms · `--ease-standard` ease-out |
| **Fonts** | body & display: `-apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif` · mono: `"Fira Code", ui-monospace, Consolas, monospace` |

⚠️ **`--radius-pill` is 3px, not a pill.** Anything drawn as a rounded capsule is off-system.

⚠️ **Söhne is gone.** The shipped stack is the OS system font. The old handoff §2 convention
(Söhne, green `#10a37f`) describes an app that no longer exists.

---

## 5. Findings worth raising

| # | Finding | Evidence |
|---|---|---|
| **T-1** | **`--surface-hover` is identical to `--surface` in light mode** (`#F4F5F7`). Hover on those surfaces produces no visible change in Day mode. Dark mode does it correctly (`#161A1D` → `#2C333A`). | §2 Surfaces |
| **T-2** | **Two generations of the Atlassian palette are mixed.** Light uses the classic set (`#0052CC`, `#172B4D`, `#DFE1E6`); dark uses the refreshed set (`#0C66E4`, `#579DFF`, `#22272B`). They are not the same design system vintage. | §2 Brand |
| **T-3** | **`ai` and `duplicate` status pills are byte-identical** in both themes. Two distinct states, one appearance. | §2 Status pills |
| **T-4** | `--radius-pill` (3px) does not produce a pill; the name misleads. | §4 |
| **T-5** | Dark mode uses `color-mix(in oklab, …)`; light uses static hex. Any tooling that parses tokens must handle both forms. | §2 Brand |

T-1 and T-3 are candidate bug tickets under **QG-138**. T-2 is a question for the PO, not a defect.

---

## 6. Rules for mockups

1. **Always ship both themes.** The user can flip at will.
2. **Handle `system` too** — honour `prefers-color-scheme`, not just an explicit choice.
3. **Never draw shadows in dark.** Use the §3 surface ladder.
4. **3px radius everywhere**, including things that look like pills.
5. **System font stack**, not Söhne, not a webfont.
6. Take token values **from this file**, not from the two proposal documents.

---

## Provenance

Read live from `qops-harness.lab.gend.vn` on 20 August 2026 by enumerating every `--*` property
declared in the page's stylesheets and resolving each against the root computed style, once with
`data-appearance=day` and once with `data-appearance=night`. The appearance setting was returned to
**Day** afterwards. No other state was changed.
