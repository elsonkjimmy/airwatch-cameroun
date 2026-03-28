# Design System Document: High-End Editorial Air Quality Experience

## 1. Overview & Creative North Star: "The Atmospheric Guardian"
This design system moves away from the clinical, boxy nature of standard utility apps toward an editorial, immersive experience. The Creative North Star, **"The Atmospheric Guardian,"** positions the app not just as a data provider, but as a premium, sophisticated lens through which users view their environment.

We break the "template" look by using **Intentional Asymmetry** and **Tonal Depth**. Instead of rigid grids, we use overlapping elements and massive typography scales to create a sense of hierarchy. The interface should feel like a high-end physical publication—breathable, authoritative, and deeply integrated into the dark navy canvas of the Cameroonian night.

---

## 2. Colors & Surface Architecture

### The Palette
We utilize a Material 3-inspired tonal range to ensure WCAG AA compliance while maintaining a deep, cinematic aesthetic.
- **Primary (Teal):** `#81d4d8` (Light) to `#0d7377` (Container). This is our pulse.
- **Background:** `#00132d`. A deep, infinite navy that provides the foundation for all layers.
- **Semantic AQI:** Good (`#14A44D`), Moderate (`#EAB308`), Unhealthy (`#F97316`), Critical (`#DC2626`). These must be used sparingly as status indicators, never as primary background washes.

### The "No-Line" Rule
**Prohibit 1px solid borders for sectioning.** Boundaries are defined strictly through background color shifts. To separate a section, transition from `surface` to `surface-container-low`. Visual separation is achieved through value, not outlines.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. 
- **Base:** `surface` (#00132d)
- **Secondary Section:** `surface-container-low` (#021c3a)
- **High-Priority Card:** `surface-container-high` (#132a4a)
- **Floating Element:** `surface-bright` (#243a5a) with a 15% opacity `outline-variant` for definition.

### The "Glass & Gradient" Rule
To elevate the experience, use **Glassmorphism** for floating action buttons and modal headers. 
- **Recipe:** Background `surface-container` at 70% opacity + `backdrop-blur(12px)`.
- **Signature Textures:** Apply a subtle linear gradient from `primary` (#81d4d8) to `primary-container` (#0d7377) on main CTAs to give them a "lit from within" glow.

---

## 3. Typography: Editorial Authority
We use the **Inter** family exclusively, but we manipulate weight and scale to create a high-contrast, editorial rhythm.

| Role | Token | Size | Weight | Intent |
| :--- | :--- | :--- | :--- | :--- |
| **AQI Hero** | `display-lg` | 3.5rem (72px) | Extra Bold | The focal point. Must feel monumental. |
| **Section Header** | `headline-md` | 1.75rem | Bold | Anchors the page; use tight letter-spacing (-0.02em). |
| **Subtitle** | `title-md` | 1.125rem | Medium | Supporting context. |
| **Body** | `body-lg` | 1rem (16px) | Regular | Standard readability for French/English text. |
| **Metric Label** | `label-sm` | 0.6875rem | Semi-Bold | Uppercase with 0.05em tracking for metadata. |

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are often "muddy." We achieve lift through light and color.

- **The Layering Principle:** Place a `surface-container-lowest` card on top of a `surface-container-low` section. This creates a soft "recessed" or "raised" effect without a single line of code for borders.
- **Ambient Shadows:** For floating modals, use an extra-diffused shadow: `0px 24px 48px rgba(0, 0, 0, 0.4)`. The shadow must feel like an occlusion of light, not a dark smudge.
- **The "Ghost Border" Fallback:** If a border is required for accessibility on a card, use the `outline-variant` token (#3e4949) at **15% opacity**. It should be felt, not seen.
- **Micro-Glow:** Active states for teal buttons should include a small 8px outer glow using the `primary` color at 20% opacity to simulate a digital LED effect.

---

## 5. Components

### Buttons
- **Primary:** Gradient fill (`primary` to `primary-container`), 12px radius, white text. No border.
- **Secondary:** `surface-container-highest` background with `primary` colored text.
- **Tertiary:** Ghost style. No background, `primary` text, underlined only on hover/active.

### Cards & Lists
- **The Divider Ban:** Never use horizontal lines. Use `1.5rem` (6) of vertical whitespace or a subtle shift from `surface-container-low` to `surface-container-high` to distinguish list items.
- **Radius:** 16px (xl) for cards to maintain a friendly, modern health-app feel.

### AQI Gauges (Custom)
Instead of a standard circle, use a **thick asymmetric arc**. The stroke weight should be 12px, using the semantic AQI colors. Pair this with the 72px Extra Bold AQI number in the center.

### Input Fields
- **State:** `surface-container-lowest` background. 
- **Focus:** 1px `primary` border (this is the only exception to the "No-Line" rule to ensure input clarity).

---

## 6. Do’s and Don’ts

### Do:
- **Use "Breathing Room":** Leverage the `8` (2rem) and `10` (2.5rem) spacing tokens between major sections to let the data "breathe."
- **Bilingual Considerations:** Ensure all containers can handle 20% more text volume for French translations without breaking the layout.
- **Monoline Harmony:** Use Lucide/Phosphor icons at a consistent 1.5pt stroke weight to match the Inter font's "Regular" weight.

### Don't:
- **Don't use pure black:** Always use `surface` (#00132d). Pure black kills the "Atmospheric" depth.
- **Don't use high-contrast dividers:** Avoid `#ffffff` lines. If you need a separator, use a `1px` tall box with `surface-variant` at 10% opacity.
- **Don't overcrowd the Hero:** The 72px AQI number needs at least 40px of clear space around it to maintain its "hero" status.

---

## 7. Implementation Tokens (Reference)
- **Card Radius:** `xl` (1.5rem / 24px for large containers; 16px for standard)
- **Button Radius:** `md` (0.75rem / 12px)
- **Badge Radius:** `DEFAULT` (0.5rem / 8px)
- **Internal Padding:** `4` (1rem / 16px)
- **Component Spacing:** `3` (0.75rem / 12px)