Single-thumb range control on the gold rail — the bare control (wrap in a `Card` for the budget-picker context). Uncontrolled by default (seeds from `defaultValue`); pass `value` + `onChange` to control it.

## Elements
- **Rail** — 5px pill track, full width, `--line-strong`.
- **Fill** — 5px gold segment from the left to the thumb, `--accent`, width = value %.
- **Thumb** — 18px gold circle (`--accent`, `--radius-full`), ringed by a 4px `--surface` halo (blends into the card) + soft drop shadow for lift.
- **Value tooltip** — floats 26px above the thumb: `--surface-recessed` bg, `--border-hairline`, `--muted` 12px bold text, downward caret. Visibility per `valueLabelDisplay`.
- **Marks** (optional) — 3px dots per step; `--on-accent` below the value, `--line-strong` above. Auto-spaced only when step count ≤ 60.
- **End labels** — min/max under the track, 14px `--faint`; default to formatted min/max, overridable via `minLabel`/`maxLabel`.

## States
- **Default** — thumb at rest, `scale(1)`, tooltip hidden (`auto` mode).
- **Hover** — pointer enters track or thumb focused → tooltip fades in (`auto`).
- **Dragging** — thumb shrinks to `scale(0.82)`, cursor `grabbing`, tooltip stays visible.
- **Focus** — thumb is keyboard-focusable (`role="slider"`, `tabIndex 0`); focus reveals the tooltip. No separate ring — halo + tooltip carry it.
- **Controlled vs uncontrolled** — value from `value` prop or internal state.

## Colors (tokens only)
- Fill + thumb: `--accent` (gold) · Rail + inactive marks: `--line-strong` · Active marks: `--on-accent`
- Thumb halo: `--surface` (#111635, matches the card) · Tooltip: `--surface-recessed` bg / `--border-hairline` / `--muted` text · End labels: `--faint`

## Animations
- **Thumb press** — `transform 140ms var(--ease-out)`, 1 → 0.82 while dragging.
- **Tooltip** — `opacity var(--dur-fast) var(--ease-out)` fade.
- **Thumb halo** — `box-shadow var(--dur-fast) var(--ease-out)`.
- Fill/rail have no motion — they track the pointer 1:1 for responsiveness.

## Interaction / principles
- **Three ways to set value:** drag the thumb, click the track, or keyboard.
- **Keyboard:** ←/↓ and →/↑ step by `step`; PageUp/PageDown by `step × 10`; Home/End jump to min/max.
- **Snapping:** every commit snaps to the nearest `step` (float-precision cleanup) and clamps to `[min, max]`.
- **Formatting:** `valuePrefix` + `en-GB` grouping (toggle with `grouping`) + `decimals` + `valueSuffix` — used in the tooltip, `aria-valuetext`, and default end labels.
- **Pointer capture** keeps the drag alive if the cursor leaves the track.
- **Accessibility:** full `role="slider"` with `aria-valuemin/max/now/valuetext` and `ariaLabel`.

## Props
- `min` / `max` / `step` — range + snap increment (defaults 0 / 100 / 1).
- `defaultValue` — uncontrolled seed (defaults to `min`).
- `value` + `onChange(value)` — controlled pair; `onChange` fires the snapped value on every change.
- `marks` — `true` for even per-step ticks (≤ 60), or an explicit `{ value, label }[]`.
- `valueLabelDisplay` — `'off' | 'auto' | 'on'` (default `auto`).
- `decimals`, `grouping`, `valuePrefix`, `valueSuffix` — value formatting.
- `minLabel` / `maxLabel` — override end labels. · `ariaLabel` — accessible name.

```jsx
// uncontrolled budget picker
<Slider min={5000} max={200000} step={5000} defaultValue={5000}
        valuePrefix="$" minLabel="$5K" maxLabel="$200K" marks
        ariaLabel="Monthly budget" onChange={setBudget} />

// controlled percentage
<Slider min={0} max={100} value={pct} onChange={setPct} valueSuffix="%" marks />
```

Note: the card demo's currency switcher (a separate sliding-knob control, not part of `Slider`) sets `valuePrefix`; a `key={cur}` remount re-seeds the value when the currency changes.
