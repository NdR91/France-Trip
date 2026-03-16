<!-- Context: project-intelligence/notes | Priority: high | Version: 1.2 | Updated: 2026-03-16 -->

# Living Notes

> Active issues, technical debt, open questions, and insights that don't fit elsewhere. Keep this alive.

## Quick Reference

- **Purpose**: Capture current state, problems, and open questions
- **Update**: Weekly or when status changes
- **Archive**: Move resolved items to bottom with status

## Technical Debt

| Item | Impact | Priority | Mitigation |
|------|--------|----------|------------|
| Mobile card density | On small screens the horizontal cards feel crowded and increase scanning effort | High | Simplify mobile card content and consider a stronger mobile-specific pattern |
| Results hierarchy still secondary to inputs | Users spend too much time on option browsing before understanding the best outcome | High | Continue shifting visual emphasis toward combinations and top recommendation |
| Contextual parking states on mobile | Disabled parking cards and mixed-airport comparisons need one more mobile polish pass | Medium | Refine disabled-state clarity and scanability in the next mobile UX iteration |
| Static public deployment boundary | Any data shipped in `index.html`, `assets/`, or `data/` becomes public | High | Keep sensitive trip operations outside the static bundle |
| Comparison logic concentrated in one JS file | Easier to grow inconsistently as features increase | Medium | Split rendering, state, and comparison helpers when the next feature wave starts |
| Visual system not fully codified | Colors, states, and typography work locally but are not yet a disciplined product system | Medium | Define a roadmap-backed UI system for palette, states, copy, and mobile variants |

### Technical Debt Details

**Mobile card density**  
*Priority*: High  
*Impact*: Mobile users need more effort to compare options and may miss important differences.  
*Root Cause*: Desktop-style content density is currently compressed into horizontally scrolling cards.  
*Proposed Solution*: Reduce visible metadata on mobile cards, surface only the strongest signals, and evaluate snap carousel vs stacked list.  
*Effort*: Medium  
*Status*: Acknowledged

**Results hierarchy still secondary to inputs**  
*Priority*: High  
*Impact*: The page behaves more like a catalog than a decision assistant.  
*Root Cause*: Selection sections visually dominate the page before the results block is reached.  
*Proposed Solution*: Add stronger top-level decision summary and continue emphasizing the combinations area.  
*Effort*: Medium  
*Status*: In Progress

**Static public deployment boundary**  
*Priority*: High  
*Impact*: Future sensitive data could be accidentally exposed through GitHub Pages.  
*Root Cause*: The current deployment model publishes the full static site artifact.  
*Proposed Solution*: Keep tickets, booking codes, contacts, and operational details out of the static repo surface; plan a separate private layer later.  
*Effort*: Small  
*Status*: Acknowledged

**Visual system not fully codified**
*Priority*: Medium
*Impact*: The UI feels coherent, but mobile density, color semantics, and text hierarchy can drift as the product evolves.
*Root Cause*: The project currently relies on local styling decisions rather than an explicit visual roadmap.
*Proposed Solution*: Use `ROADMAP.md` as the implementation anchor for UX, UI, palette, and typography improvements, then codify the most stable decisions in context notes.
*Effort*: Medium
*Status*: In Progress

## Open Questions

| Question | Stakeholders | Status | Next Action |
|----------|--------------|--------|-------------|
| Should mobile selection remain a horizontal carousel or switch to a more compact vertical pattern? | Project owner, trip participants | Open | Validate with another round of mobile testing |
| Is URL-based sharing the next most valuable feature? | Project owner, trip participants | Open | Confirm if the group will compare options asynchronously |
| When the site evolves beyond comparison, should the planner live in a separate protected project? | Project owner | Open | Decide before adding tickets, booking references, or personal details |

### Open Question Details

**Should mobile selection remain a horizontal carousel or switch to a more compact vertical pattern?**  
*Context*: Horizontal scrolling works, but it introduces friction and partial-card visibility on small screens.  
*Stakeholders*: Project owner, trip participants  
*Options*: Keep carousel and simplify cards, add snap/hints, or move to stacked cards on mobile only.  
*Timeline*: Before the next significant UX pass.  
*Status*: Open

**Is URL-based sharing the next most valuable feature?**  
*Context*: The site is now decision-ready, but collaborative sharing still relies on screenshots or verbal instructions.  
*Stakeholders*: Project owner, trip participants  
*Options*: Share current selection through query params, encoded state, or an explicit shortlist feature.  
*Timeline*: Near term, after current UX polish.  
*Status*: Open

**Should the planner live in a separate protected project?**  
*Context*: GitHub Pages is acceptable for non-sensitive comparison data, but not for bookings and operational details.  
*Stakeholders*: Project owner  
*Options*: Keep one public-safe repo and create a separate private planner, or migrate later to a protected platform such as Cloudflare Pages + Access.  
*Timeline*: Before adding tickets or personal identifiers.  
*Status*: Open

## Known Issues

| Issue | Severity | Workaround | Status |
|-------|----------|------------|--------|
| Chips and actions in the comparison bar can feel cramped on mobile | Medium | Scroll further to results and use reset/select actions carefully | Improved, still monitor |
| Single-combination state previously showed redundant metrics | Medium | Ignore min/max when only one result exists | Fixed in current local iteration |
| Intro copy occupied premium space without increasing decision quality | Low | Scroll to options and results | Improved in current local iteration |

### Issue Details

**Mobile comparison bar crowding**  
*Severity*: Medium  
*Impact*: On mobile, the comparison bar can feel visually dense when chips and actions coexist.  
*Reproduction*: Select one flight, one stay, and parking on a small viewport, then review the results area.  
*Workaround*: Continue down to the combo card, which is clearer than the bar itself.  
*Root Cause*: The bar compresses state summary and actions into a limited width.  
*Fix Plan*: Monitor after the latest mobile spacing changes; if still noisy, split chips and actions into separate rows permanently.  
*Status*: In Progress

## Insights & Lessons Learned

### What Works Well
- Static-first architecture - The project stays easy to publish, update, and reason about.
- Data separated from rendering - Travel options can now evolve without rewriting the whole page.
- Selection-based comparison - The interaction model is immediately understandable for non-technical users.

### What Could Be Better
- Mobile-first prioritization - The current experience still starts from desktop assumptions in some card layouts.
- Decision framing at the top of the page - Users should understand the best current option faster.
- Shared comparison flow - The product still lacks a lightweight way to share a chosen configuration.
- Visual discipline - Palette, states, and secondary typography need a tighter system as the UI grows.

### Lessons Learned
- Public static deployment is fine for travel comparison, not for bookings or personal trip operations.
- In a comparison tool, the result section deserves stronger emphasis than the option catalog.
- Small UX refinements on density and hierarchy produce more value than large visual redesigns early on.
- Mobile UX and design-system cleanup should land before adding bigger feature waves like sharing or planner logic.

## Current Design Direction

- **Mobile UX**: Treat mobile as the default design surface; simplify stay cards and reduce comparison-bar density before adding new features.
- **UI**: Preserve the soft editorial tone, but make selected, unselected, and best-result states more deliberate and less heavy-handed.
- **Palette**: Keep the light neutral base; formalize blue as decision emphasis, orange as parking/cost delta signal, and reduce incidental accent sprawl.
- **Typography**: Keep `DM Sans` and `DM Mono`, but improve contrast and hierarchy of small labels and supporting text.
- **Roadmap anchor**: Use `ROADMAP.md` for the current implementation sequence and milestone framing.

## Patterns & Conventions

### Code Patterns Worth Preserving
- Static data modules - `data/site-data.js` keeps travel content separate from UI logic.
- Derived combinations - `assets/app.js` computes combinations from selected flights and stays instead of hardcoding all permutations.
- Soft editorial visual style - `assets/app.css` uses restrained palette, spacing, and cards without looking boilerplate.

### Gotchas for Maintainers
- Anything shipped through GitHub Pages is public; never place future sensitive travel details in deployable files.
- UX regressions are more likely on mobile than desktop; test there first for any layout change.
- Comparison summary and card selection states must stay visually synchronized or users will lose trust quickly.

## Active Projects

| Project | Goal | Owner | Timeline |
|---------|------|-------|----------|
| France Trip Comparator | Keep a public-safe comparison tool for September travel options | NdR91 | Active now |
| Future Travel Planner Boundary | Decide how to handle bookings and private trip operations later | NdR91 | Before adding sensitive data |

## Archive (Resolved Items)

Moved here for historical reference. Current team should refer to current notes above.

### Resolved: Static deployment baseline
- **Resolved**: 2026-03-15
- **Resolution**: The Claude artifact was refactored into a static site with separated data, CSS, and JS, then deployed via GitHub Pages.
- **Learnings**: Keeping the project framework-free made setup and publishing much faster.

### Resolved: Immediate UX quick wins
- **Resolved**: 2026-03-15
- **Resolution**: Non-selected cards were made more legible, the intro block was compacted, the results area gained stronger emphasis, the single-combination state was simplified, and the comparison bar was improved for mobile.
- **Learnings**: The best short-term gains came from hierarchy and density fixes, not from changing the overall visual language.

## Onboarding Checklist

- [ ] Review known technical debt and understand impact
- [ ] Know what open questions exist and who's involved
- [ ] Understand current issues and workarounds
- [ ] Be aware of patterns and gotchas
- [ ] Know active projects and timelines
- [ ] Understand the team's priorities

## Related Files

- `decisions-log.md` - Past decisions that inform current state
- `business-domain.md` - Business context for current priorities
- `technical-domain.md` - Technical context for current state
- `business-tech-bridge.md` - Context for current trade-offs
- `../../../ROADMAP.md` - Current implementation roadmap for UX, UI, palette, and typography
