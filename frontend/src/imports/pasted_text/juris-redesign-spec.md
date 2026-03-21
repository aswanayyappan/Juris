Redesign the JURIS interface into a **minimal, system-grade, Windows Settings–inspired compliance OS**, but aggressively simplify the current output by removing visual noise, redundant tiles, and inconsistent styling, and replacing it with a **clean, calm, structured layout that prioritizes clarity over decoration**. The current design is overcrowded, repetitive (multiple “AI Assistant” and “Live Mentors” tiles), and visually heavy due to excessive gradients, glow, and glass effects. The new design must eliminate duplication and reduce the interface to **a single, clean launcher grid with only essential modules**, each appearing exactly once.

Start with a **full-screen dark base using --juris-bg-deep (#060B18)** and layer content using **--juris-bg-mid (#0A1020)** and **--juris-bg-surface (#0D1526)**, but reduce glassmorphism significantly—use it only in the top bar and input fields, not on every card. Remove strong gradients and replace them with **flat surfaces + subtle elevation contrast**. The interface must feel stable and professional, not flashy.

At the top, keep a **simple utility bar (48px)**:

* Left: JURIS logo (no glow)
* Center: search bar (clean, soft border, no heavy blur)
* Right: notifications, credits, profile
  No gradients, no glass overload—just a clean semi-transparent or solid surface.

The **main launcher area must be a clean grid (2–3 columns max)** with **only these modules (no repetition):**

* GST & Tax Compliance
* ROC / MCA
* Income Tax
* Labour Law
* Licenses & Registrations
* Risk & Alerts
* Compliance Health
* AI Legal Assistant
* Live Mentors

Each tile must be:

* Flat (`--juris-bg-surface`)
* Border: `1px rgba(255,255,255,0.05)`
* Padding: 20–24px
* Radius: 8px
* No gradients

Inside each tile:

* Icon (simple, no glow)
* Title (clear, medium weight)
* Short description (muted text)
* Optional small status text (e.g., “2 pending”)

Hover interaction:

* Slight lift (translateY -2px)
* Border color → `--juris-gold`
* Very soft glow (almost invisible)

Do NOT:

* Stack multiple visual styles
* Use multiple color highlights inside one tile
* Add inner shadows or layered gradients

The **AI Assistant and Live Mentors tiles must look identical to other tiles**, but may have a **subtle gold indicator dot or accent line** to signal importance—nothing more.

When clicking **AI Assistant**, navigate to a **dedicated chat page** that is extremely minimal:

* Background: `--juris-bg-mid`
* Chat area centered with max width
* Messages:

  * User: right-aligned, slightly gold-tinted background (very low opacity)
  * AI: left-aligned, neutral surface color
* No bubbles with strong borders—just soft contrast
* Input bar:

  * Full width bottom
  * Clean surface
  * Gold focus ring only when active

When clicking **Live Mentors**, go to a **clean mentor directory page**:

* Grid or list of mentor cards
* Each card:

  * Avatar
  * Name
  * Expertise
  * Availability (small green dot)
  * “Chat” button (gold outline, not filled)

Clicking “Chat” must open a **WhatsApp-style chat layout**, but simplified:

* No heavy panels
* Optional left sidebar for conversations (only if needed)
* Main chat area:

  * Flat background
  * Messages grouped cleanly
* Top bar:

  * Mentor name + status
* Bottom:

  * Input + send button (gold accent)

Remove:

* Duplicate modules
* Multi-style cards
* Experimental UI blocks (like “General Launcher”, “Contrib UI Layout”)
* Overlapping gradients and glow effects
* Mixed UI paradigms in one screen

Typography must dominate the design:

* Clear hierarchy
* High readability
* No decorative styles

Spacing must do the work:

* 24–32px gaps between tiles
* 16px internal spacing
* Consistent alignment grid

This redesign must feel like:

> “A calm, precise, professional control system”

—not a concept UI or experimental design.

In Figma Sonnet 4.6:

* Define strict components (Tile, Card, Chat, Mentor Card)
* Use design tokens mapped to your Tailwind variables
* Enforce consistency across all modules
* Build with a 12-column grid, no freeform placement

The final result should look **simpler, sharper, and more controlled than your current output**, with **zero redundancy, minimal visual noise, and strong structural clarity**, while still preserving the JURIS identity through subtle gold accents and deep dark surfaces.
