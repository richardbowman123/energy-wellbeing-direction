# Energy | Well-being | Direction — Project Notes

## What it is

A daily attunement tracker — a 90-second evening check-in across life dimensions, revealing the gap between what you think keeps you steady and what actually does.

Inspired by three sources:
1. **Chris's TED talk** — daily scoring across life dimensions, pattern recognition over time
2. **Anu's Nous & Soma Micro-Resets** — "return to rhythm" philosophy, embodied dimensions, attunement practice
3. **LifeSpan+** — evidence-based health assessment (separate project, untouched)

## Live link

- **Vercel (primary, auto-deploys from GitHub):** `energy-wellbeing-direction.vercel.app` (confirm exact URL in Vercel dashboard)
- GitHub Pages (legacy): https://richardbowman123.github.io/energy-wellbeing-direction/

Every push to GitHub `main` triggers a fresh Vercel build — typically live within ~30-60 seconds.

---

## Session log: 14 April 2026 — pre-Anu polish

Aim: tighten the user flow and prep the app to share with Anu as a Thursday preview.

**What changed:**
- **Logo added** to landing page (centred, top-anchored, identity line above it)
- **Setup intro paragraph** added: explains the breadth of dimensions (physical, emotional, psychological, relational, creative, spiritual)
- **Removed contradictory sublabel** ("Use the slider… to your anchor") — was misleading because each dimension has its own importance question
- **Dimension setup cards restructured** — toggle removed (every listed dimension is tracked), slider sits full-width below each question
- **Card contrast lifted** — was `#1c1c1c` on `#1e1a16` (invisible), now `#2a2520` (warm subtle lift)
- **Spirit dimension added** under Well-being — claimed importance 1 in demo, actual correlation ~0.55 (a quieter "underrated dimension" reveal alongside Making)
- **Ground reworded** — was "standing on solid ground" (too literal), now "feel inwardly steady, whatever the day throws at you"
- **Setup completion simplified** — single CTA "Log your responses for today" (was a fork between demo data and start fresh)
- **Insights tab always renders demo archive data** — Dashboard is the user's own real data, Insights illustrates the patterns. This is intentional, not a bug.
- **"View historic data (DUMMY MODE)" button** added in two places: post-checkin "Noted." screen and on the Dashboard above "Check in now" — both styled as boxed `btn-secondary` to match "View today"
- **(N active) counter dropped** from setup heading (redundant with no toggle)
- Vercel hosting set up — every push auto-deploys

**What to walk Anu through on Thursday:**
1. Landing → Begin → choose anchor question
2. Set importance for each dimension (note: order is Body, Stillness, Connection, Purpose, Making, Character, Ground, Spirit)
3. "Log your responses for today" → check-in flow (1 breath pause → anchor → 8 dimensions → optional note → Done)
4. "Noted." screen → click **"View historic data (DUMMY MODE)"** to land on the rich Insights view (this is the wow moment)
5. Click into a dimension panel (e.g. Making or Spirit) to see the deeper detail screen with 90-day chart, day-of-week pattern, best/worst weeks
6. Tap "Today" to return to Dashboard — shows just her real entry (one day so far)

**Key story to tell Anu:** the Insights screen reveals the gap between *claimed importance* and *actual role* in driving your anchor score. Demo data is engineered to surface two reveals: **Making** (claimed 1, actual 0.68) and **Spirit** (claimed 1, actual 0.55) — both quietly meaningful. **Connection** is the inverse — claimed 5, actual moderate.

**Outstanding bug (parked):**
- `startFresh()` in `js/app.js` wipes ALL previous entries every time the user completes setup. Originally fine (it was paired with "Explore with demo data"), but now that it's the only path through setup, it's a footgun: if Anu logs daily for a week then revisits "Edit setup" and finishes the flow, her entire history vanishes. Two-line fix when ready.

**Suggested questions to put to Anu:**
- Does the intro paragraph accurately set expectations?
- Does "Spirit" feel like the right name (vs Spirituality, Soul, Meaning, etc.)?
- Does the dummy-mode button labelling work for her, or feel jargon-y?
- What dimensions feel missing or extra to her?
- Does the anchor question list cover what she'd actually want to ask herself?

---

## Current state (April 2026)

- Landing page (with logo), setup (anchor question + dimensions), check-in flow, dashboard, insights, dimension detail
- 90-day demo archive data lives permanently in the Insights tab — always populated, regardless of how many real entries exist
- 8 default dimensions across three pillars:
  - **Energy:** Body, Stillness
  - **Well-being:** Connection, Character, Ground, Spirit
  - **Direction:** Purpose, Making
  - Plus user-added custom dimensions
- Pearson correlation analysis showing which dimensions actually drive your anchor score
- Insights panels with mini charts plotting each dimension against the anchor
- Dark clay aesthetic inspired by Nous & Soma (Cormorant + Inter fonts, warm yellow accent)
- Hosted on Vercel — auto-deploys from GitHub on every push
- Private repo (all client-sensitive work stays private)

## Next session: Thursday 16 April with Anu

See the **Session log: 14 April 2026** section above for the walkthrough path, story to tell, and open questions. Parked bug documented there too.

---

## Notes: The Hobby Matrix & Sovereign Framing

Source: https://askastrid.substack.com/p/the-undertow

The Hobby Matrix maps hobbies on two axes:
- **Structured vs Flexible** (does life adapt to the hobby, or the hobby to life?)
- **Self-oriented vs Other-oriented**

This creates four quadrants:
1. **Domestic** (flexible, other-oriented) — knitting, baking, gardening, sewing
2. **Relational** (structured, other-oriented) — volunteering, community organising, faith groups
3. **Restorative** (flexible, self-oriented) — yoga, running, reading, journaling
4. **Sovereign** (structured, self-oriented) — surfing, cycling, climbing, sailing, marathon training

### The key insight

Sovereign hobbies are gendered in their marketing. When women enter the sovereign quadrant, the language softens — "a plan that works around your schedule" is restorative language wrapped around a sovereign activity. It's a subtle apology for the hobby's demands. Men get performance and dominance; women get community and balance.

"The market understands, even if it does not say so, that many women need permission to be inconvenient before they will sign up."

### The provocation

What if we went **full sovereign** when talking to women? Built something for **unapologetically unavailable** women? Pushed back against the inconvenience narrative?

- Names what competitors won't — nobody else sells the demand
- Reframes inconvenience as status (nobody apologises for a 6am tee time)
- Has a built-in tribe — women already doing sovereign hobbies, underserved by soft messaging

### How this could connect to the app

- The attunement tracker is currently framed restoratively ("honour your rhythm"). Could a sovereign framing work for a different audience?
- The hobby matrix is a useful analytical framework for brand positioning work more broadly
- Testable hypothesis: put sovereign-framed messaging against restorative-framed messaging for the same activity and measure which women respond — and which feel *relieved* by the sovereign framing

---

## Potential next steps

- Review full flow with Anu on Thursday
- Test check-in experience on mobile
- Consider "Today's insights" vs "All-time insights" as separate views
- Explore whether the app voice should vary by audience (sovereign vs restorative framing)
- Set up Vercel for more professional hosting (noted in CLAUDE.md)
