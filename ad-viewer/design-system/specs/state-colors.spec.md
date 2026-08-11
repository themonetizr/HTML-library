# State colors — Error / Success / Warning

The three feedback hues in the Monetizr Blackbelt system. Each follows **one pattern**: a solid stop, a soft fill (`.14`), and a hairline border (`.35`) — the fill and its border are the *same* base color at those two alphas, so they always move together. Reference the **semantic role** (`--error`, `--success`, `--warning`), never the raw `*-500` stop or a hand-mixed rgba.

> Note: **Warning shares the Error red.** There is no separate amber hue in the palette — caution and failure both read on `#ff5d5d`. Distinguish them by icon/copy, not color.

---

## Tokens

### Error — destructive / failure
| Token | Value | Job |
| --- | --- | --- |
| `--error` | `var(--error-500)` | Semantic role — **use this** |
| `--error-500` | `#ff5d5d` | Solid stop (red ~0°) |
| `--error-soft` | `rgba(255,93,93,0.14)` | Soft fill (alert bg, invalid field tint) |
| `--line-error` | `rgba(255,93,93,0.35)` | Hairline border |

### Success — confirmation / live
| Token | Value | Job |
| --- | --- | --- |
| `--success` | `var(--success-500)` | Semantic role — **use this** |
| `--success-500` | `#2096F3` | Solid stop (blue ~207°) |
| `--success-soft` | `rgba(32,150,243,0.14)` | Soft fill |
| `--line-success` | `rgba(32,150,243,0.35)` | Hairline border |

### Warning — caution
| Token | Value | Job |
| --- | --- | --- |
| `--warning` | `var(--warning-500)` | Semantic role — **use this** |
| `--warning-500` | `#ff5d5d` | Solid stop (shares the error red) |
| `--warning-soft` | `rgba(255,93,93,0.14)` | Soft fill |
| `--line-warning` | `rgba(255,93,93,0.35)` | Hairline border |

---

## The three-layer pattern

Every state hue is expressed the same way, so components stay consistent:

1. **Solid** (`--error`) — the icon, the text, the emphatic border. Full-strength color.
2. **Soft fill** (`--error-soft`, `.14`) — the container background behind a message.
3. **Hairline** (`--line-error`, `.35`) — the 1px edge around that container.

The soft fill and hairline are the identical base at `.14` / `.35` — never pair a fill from one hue with a border from another, and never invent an in-between alpha.

```css
/* an inline error / invalid state */
.field--invalid {
  border: 1px solid var(--error);      /* solid emphasis edge */
  color: var(--error);
}

/* a soft alert block */
.alert--error {
  background: var(--error-soft);        /* .14 fill */
  border: 1px solid var(--line-error);  /* .35 hairline */
  color: var(--text);
}
```

---

## Usage in components

- **EmailInput** — on blur, a malformed address turns the border `--error` and reveals an error line in `--error`.
- **Alerts / banners** — `--*-soft` background + `--line-*` border + solid `--*` icon.
- **Status dots / live badges** — `--success` for "live", `--error`/`--warning` for attention.

---

## Principles

- **Semantic first.** Reference `--error` / `--success` / `--warning`, not `--error-500`. Meaning can be retargeted at the semantic layer without touching a single component.
- **Gold is not a state.** Feedback colors never replace the gold accent — gold stays the "act now" anchor; error/success/warning communicate *status*, not emphasis.
- **Fill + border move together** at `.14` / `.35`. Don't mix alphas or hues.
- **Warning = error red.** Amber isn't in the palette; separate caution from failure via icon and copy.
