# Comprehensive UI/UX Design Guide for Non-Designers

This document is a "**general design principles baseline**" for engineers and PMs to build intuitive, easy-to-use, beautiful, and consistent products, even without a dedicated designer. Design is not art; it is "problem-solving" achieved through a combination of rules and patterns.

---

## 0. Scope and Operational Prerequisites of this Guide

When applying this guide in practice and implementation, please share and agree on the following prerequisites with the implementation team.

### 0.1 Positioning and Priority of the "General Guide" vs. "Specific Guides"
* This document is a **"common principles collection"** that serves as the foundation for any product, not a fully comprehensive standalone specification.
* In actual product development (especially large-scale ones), it is expected that a "product-specific design guide" will be defined separately, using this guide as a base.
* If a conflict occurs between the two, the priority is **"Product-Specific Guide" > "This General Guide"**. For items where the optimal solution changes depending on the context—such as button placement rules, information density, or animation volume—overriding via the specific guide is permitted and prioritized.

### 0.2 Boundary Between "Strict Principles" and "Recommendations"
* **Principles to strictly adhere to in all cases (Must)**:
  * No exceptions are allowed for core rules that prevent defects or are based on human cognitive models, such as "1. Four Basic Principles (CRAP)", "2.1 8pt Grid System", and "8. Anti-Patterns to Strictly Avoid".
* **Recommendations to be adjusted contextually (Should)**:
  * The content in Chapter 10 (Web vs. Mobile differences) and Chapter 11 (BtoB vs. BtoC differences) applies only to their respective contexts.

### 0.3 Minimum Set of Prerequisite Information Before Implementation
Before engineers start UI implementation based on this guide, at minimum, the following information must be shared (e.g., via tickets or meetings).
1. **Platform and Target Focus**: Whether the development target is "Web or Mobile app" and "BtoB or BtoC". Since these are not always distinctly split and often have intermediate cases (e.g., "primarily BtoB, but touched by general users"), the team must align on "which side is dominant" for the current product.
2. **Constraints and Base Environment**: Constraints such as brand colors, dark mode support presence, and whether a UI library or token system is already in place.
3. **Specific Values for Design Tokens**: The token rules for colors and typography described in this guide are "conceptual definitions." When implementing, it is assumed that specific color codes (e.g., Primary is `#3b82f6`) and state management specifications (like Hover behavior) will be provided separately by the product side.

### 0.4 Lightweight Operation Rules for Prototypes (MVP)
Applying everything in this guide during speed-first phases like prototyping is overkill. In such cases, switch to a **lightweight operation that enforces only the following 3 rules as a minimum**, under the premise that foundational quality (like "1. CRAP Rules") will be handled by the UI library being introduced.
1. **Strict Adherence to the 8pt Grid**: Sticking to this drastically reduces the cost of adjusting and fixing the design for production later.
2. **Avoiding Anti-Patterns**: Use "Chapter 8: Anti-Patterns to Strictly Avoid" as a checklist to clear.
3. **Dependence on Existing UI Libraries (Pragmatism)**: Do not build eccentric custom components; borrow the default styles of MUI, shadcn/ui (※these are Web examples; adapt to OS-standard UI components for native environments), etc. Even if they don't perfectly match the detailed component rules mentioned later, accept them as a "speed-first exception" and avoid tweaking details.

---

## 1. Four Basic Principles (Design Fundamentals)

All screen designs are built on these four principles (CRAP rules).

### 1.1 Proximity
* **Principle**: Group related items together and separate unrelated items.
* **Practice**: Before separating information with lines or borders, first express grouping through the size of margins (whitespace).
* **Hierarchy**: Give margins a clear hierarchy (e.g., margins within an element < margins between elements < margins between groups < margins between sections).

### 1.2 Alignment
* **Principle**: Align all elements along invisible lines (grids). Arbitrary placement creates noise.
* **Practice**:
  * Default to left-alignment (because the human eye scans left to right).
  * Center-alignment should be strictly limited to "titles" or "short, independent messages." Center-aligning long text significantly drops readability.
  * Right-align financial or numerical data to make digit comparison easier.

### 1.3 Repetition (Consistency)
* **Principle**: Apply the exact same styles to elements that have the same function or meaning.
* **Practice**: Once rules for heading font sizes, button colors and border radii, and card shadows are decided, strictly protect them throughout the project. This lowers learning costs for users.

### 1.4 Contrast
* **Principle**: Clearly show the priority of information (what is most important) through visual differences.
* **Practice**: Make different elements "obviously" different, not just "slightly" different. If a size differs by just 2px or a color is only slightly lighter, users will perceive it as a "mistake."

---

## 2. Layout and Spacing

Define the skeleton of the entire screen.

### 2.1 8pt Grid System (Layout Dimensions)
* Compose layout-forming sizes (width, height, margins, icon sizes) using **multiples of 8** (8, 16, 24, 32, 40, 48...).
* Allow **multiples of 4** for internal padding of components requiring finer adjustments.
* **Boundary of Exceptions**: This is strictly a rule for "spatial layout dimensions." **Typography scales such as font sizes (e.g., 14px) and line heights, and OS-standard accessibility requirements (like 44x44 tap targets) follow different criteria**, so they do not necessarily need to be bound to multiples of 8.

### 2.2 Z-Pattern and F-Pattern
* Layouts mindful of user eye movement.
* **Z-Pattern**: Effective for landing pages with scattered images and elements. The eye moves from top-left → top-right → bottom-left → bottom-right.
* **F-Pattern**: Effective for text-heavy screens or list views. Read left to right at the top, drop down slightly and read right again, then scan vertically down the left edge. Place important information on the "left side" and "top."

### 2.3 Inner and Outer Spacing (Inner/Outer Padding)
* When placing elements inside a container with a background color or border (like a card or button), **make the container's padding (inner margin) larger than the margin between internal elements**.
* Bad example: Padding is 16px, and the margin between internal elements is 24px.
* Good example: Padding is 24px, and the margin between internal elements is 16px.

---

## 3. Typography (Text Rules)

Text makes up 80% of a software's UI. How text is handled directly dictates UI quality.

### 3.1 Font Family
* Make system fonts (OS default fonts) the first choice (e.g., `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).
* If using Web fonts, limit to 1 (at most 2) families (e.g., Inter, Roboto, Noto Sans).

### 3.2 Typography Scale (Size Hierarchy)
Create clear jump rates (font size ratios) using fixed scales rather than intuition.
* Micro: 12px (Badges, captions, disclaimers)
* Small: 14px (Supplementary text, metadata)
* Base: 16px (Standard paragraph text, form inputs)
* H4: 20px
* H3: 24px
* H2: 32px
* H1: 40px+

### 3.3 Contrast and Weight
* Organize information not only by size but also by "Font Weight" and "Color (shade)".
* Body text should be `Regular (400)`, while headings and emphasis should be `SemiBold (600)` or `Bold (700)`.
* For lower priority text (like dates), it is better for readability to **change the color to gray (lighter)** rather than reducing the size.

### 3.4 Line Height and Letter Spacing
* **Line Height**:
  * Body text: `1.5` to `1.7` (Improves readability for long text).
  * Headings: `1.2` to `1.3` (Larger text requires tighter line height to look cohesive and beautiful).
* **Letter Spacing**: Adjust negatively as text gets larger, and positively as text gets smaller (with standard fonts, it's generally best to leave this to browser defaults).

---

## 4. Color Design (Color Palette)

Colors convey meaning and guide user emotions and actions.

### 4.1 The 60-30-10 Rule
* **60%**: Base color (Backgrounds, etc. White or light gray).
* **30%**: Main color (Brand color, headers, primary UI elements).
* **10%**: Accent color (CTA buttons or crucial elements that must stand out).

### 4.2 Semantic Colors (Colors with Meaning)
Strictly observe color usages that align with the user's mental model.
* **Primary**: Main action (Brand color).
* **Success**: Success, completion (Green family: `#22c55e` etc.).
* **Warning**: Warnings, cautions, unsaved state (Yellow/Orange family: `#f59e0b` etc.).
* **Danger/Error**: Destructive actions, errors, deletions (Red family: `#ef4444` etc.).
* **Info**: Information, help (Blue family: `#3b82f6` etc.).

### 4.3 Achromatic Gradation (Grayscale)
* Do not build solely with pure white (`#FFFFFF`) and pure black (`#000000`).
* Instead of pure black, using a dark gray with a slight blue tint (e.g., `#0F172A`, `#1E293B`) gives a refined impression without overpowering contrast.
* Define and utilize multiple grays (Text Primary, Text Secondary, Placeholder, Border, Background).

---

## 5. UI Component Design Patterns

Best practices per commonly used element.

### 5.1 Buttons
Buttons are the most important elements encouraging user action.
* **Clear Hierarchy**: Limit "primary buttons" to 1 or 2 per screen.
  * Primary (Filled): Highest priority action.
  * Secondary (Outlined): Next priority action.
  * Tertiary (Text only): Subtle actions like cancel.
* **State Display**: Always implement `Hover`, `Active`, `Focus`, `Disabled`, and `Loading`.
* **Placement**: Place affirmative actions (Save/Submit) on the right or bottom, and negative actions (Cancel) on the left or top (following OS standard guidelines).

### 5.2 Forms
Forms easily cause user stress and require thorough consideration.
* **Label Placement**: Place labels "above" input fields (left-aligned labels force eyes to scan left and right, slowing input).
* **Avoid Placeholder Abuse**: Do not put critical input examples or instructions inside placeholders (they vanish once input begins). Display instructions permanently outside the field (above or below).
* **Input Width Optimization**: For fixed-length inputs like zip codes or dates, match the field width to the input length.
* **Real-time Validation**: Show errors before the submit button is pressed (e.g., on focus out). Errors should not only be "red" but also include an "icon" and "specific correction instructions."

### 5.3 Tables
Improve readability of data lists.
* **Alignment Rules**:
  * Text is "Left-aligned".
  * Numbers and amounts are "Right-aligned" (to align digits).
  * Status badges or short icons are "Center-aligned".
* **Margins and Borders**: Vertical borders interrupt eye movement and should be omitted whenever possible. Use only horizontal borders or alternating background colors (zebra stripes).
* **Pagination**: Limit the number of displays per page (10–50 items) to control scroll amount.

### 5.4 Modals / Dialogs
* **Limited Use**: This is a "strong element" that interrupts the user's current process. Use it only for critical confirmations (like deletion) or temporary tasks you don't want to transition away from (like file selection).
* **Provide an Escape Route**: Allow closing via a top-right "×" button, clicking the background (overlay), or pressing the "Esc" key.
* **Action Buttons**: Clearly distinguish between "Cancel" and "Execute (Delete/Save)," and use a Danger color for destructive actions.

### 5.5 Cards
Package sets of information to be easy to view.
* **Clickable Area**: Clarify whether the whole card is a link, or only a button inside it is a link. Making only the title a link violates Fitts's Law and is hard to click.
* **Shadows**: Thick, dark shadows look cheap. Use elegant drop shadows that are light with a large Blur (e.g., `box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1)`).

---

## 6. State Management and Interaction

Elements must change appearance based on their situation to feed system status back to the user.

* **Default**: Standard state.
* **Hover**: Indicates clickability by slightly changing color, adding a shadow, etc.
* **Active / Pressed**: The moment of click/tap. Make it look indented or darken the color to feedback the sensation of pressing.
* **Focus**: Selected via keyboard. Display the browser's default outline or a brand color ring to ensure accessibility.
* **Disabled**: Unoperable state. Lower opacity (e.g., opacity 50%) or gray it out. It is helpful to supplement with a tooltip explaining "why it can't be operated."
* **Loading**: Processing. Show a skeleton screen or spinner so users know the system hasn't frozen (use progress bars for long processes).
* **Empty State**: When no data exists (0 search results, initial state), do not just show nothing; place an illustration or text explaining "why there is no data" and "the next action to take (e.g., create button)."

---

## 7. Error Handling

Errors should not blame the user, but serve as guides presenting solutions.

* **Toasts/Snackbars**: Display temporary notifications (like save complete) at the edge of the screen (top or bottom right) for a few seconds before disappearing. Keep critical ones visible until dismissed by the user.
* **Inline Errors**: Show specific errors, like form typos, directly below the respective field.
* **Banned Words**: Avoid cold system terms like "Invalid" or "Failed"; use human-tone microcopy like "Please enter ~" or "~ seems to be incorrect."

---

## 8. Anti-Patterns to Strictly Avoid (Don'ts)

Knowing "what not to do" directly raises the floor of design, just as much as knowing "what to do." Here are designs non-designers often mistakenly implement with good intentions, along with solutions.

### 8.1 Layout & Visuals
* ❌ **Enclosing every piece of info in borders**
  * **Reason**: The screen becomes cluttered with lines, looking cramped and outdated.
  * ⭕️ **Solution**: Instead of borders, use wider **whitespace** or a light gray background color to separate areas (borderless design). The fewer lines there are, the cleaner it looks.
* ❌ **Making text "Red" or "Vivid colors" to stand out**
  * **Reason**: It breaks context (is it an error or emphasis?) and makes the whole screen glaring and exhausting to the eyes.
  * ⭕️ **Solution**: If you want to emphasizing something, first make it **Bold**. Next, increase the **Size**. Color is a last resort, and if used, restrict it to a single brand color.
* ❌ **Cramming elements into empty screen spaces (Horror vacui)**
  * **Reason**: Thinking "space is wasted" and cramming things in causes the eye to wander helplessly, ultimately conveying nothing.
  * ⭕️ **Solution**: **Whitespace is an "element" itself**. Don't try to fill it; proactively preserve it as a buffer to separate Information and ensure readability.

### 8.2 UI Components
* ❌ **Hiding everything "for now" in a hamburger menu**
  * **Reason**: Users do not use "invisible features." Hiding critical navigation severely drops engagement.
  * ⭕️ **Solution**: Keep critical menu groups (around 3 to 5) exposed in visible areas (header tabs, bottom navigation, etc.). Put only secondary features like "Settings" or "Help" in hamburger menus.
* ❌ **Overusing Dropdowns (Select)**
  * **Reason**: They force users to click *just* to see what the options are.
  * ⭕️ **Solution**: If there are 4 or fewer options, use **radio buttons** or **toggle buttons (segmented controls)** to expose all options on the screen immediately.
* ❌ **Abusing meaningless icons**
  * **Reason**: Besides universal icons like "Home," "Settings (gear)," and "Search (magnifying glass)," icons are interpreted differently by different users, raising learning costs.
  * ⭕️ **Solution**: Do not force icons; expressing things via **plain text labels** is far more intuitive. If using icons, invariably provide accompanying text labels.

### 8.3 Interaction & UX
* ❌ **Destructive actions without confirmation**
  * **Reason**: Misclicks resulting in deleted data causes fatal stress to users.
  * ⭕️ **Solution**: Introduce a confirmation modal for actions like "Delete," or provide a few seconds of leeway by showing an "Undo" snackbar immediately after execution.
* ❌ **Endless forms (forced page transitions)**
  * **Reason**: Forcing users to input without knowing how many steps remain leads to high dropout rates.
  * ⭕️ **Solution**: Clarify progress via a step progress bar (e.g., "Step 2/4") and design to announce the total number of items upfront.
* ❌ **Saying "Error" and completely wiping out the input values**
  * **Reason**: Users don't know what was wrong, have to retype from scratch, and get infuriated.
  * ⭕️ **Solution**: **Always retain the user's input**. Display "which item" errored, "why," and "how to fix it" in plain language right under the relevant field.

---

## 9. Dark Mode and Accessibility (A11y)

### 9.1 Dark Mode Design
* **Do not use pure black (`#000000`) for backgrounds**: Use dark grays (`#121212` or `#1E1E1E`) for dark mode backgrounds. Pure black causes halation against white text and strains the eyes.
* **Expressing Elevation (Height)**: While light mode uses "Shadows" for elevation, dark mode uses "Element brightness (lightness of background color)." Overlay elements (cards, modals) get lighter background colors as they stack higher.

### 9.2 Accessibility Considerations
* **Contrast Ratio**: Ensure a contrast ratio between text and background of `4.5:1` or higher (WCAG AA). Pay special attention to light gray text.
* **Do not rely solely on color**: Expressing errors "just by turning borders red" is invisible to users with color vision deficiencies. Always pair an "error icon" with "error text."
* **Click Targets (Fitts's Law)**: Assuming touch devices, secure a minimum clickable area size of `44x44px` (or `48x48px`).

---

## 10. Platform-Specific Characteristics of Web and Mobile

Even when providing the same functionality, Web (Desktop) and Mobile devices assume fundamentally different operating environments. UI design tailored to each characteristic is essential.

### 10.1 Desktop Web Specifics
PC browsing assumes a "large screen" and "mouse/keyboard operation."

* **Leveraging Hover**: The "Hover state" when a mouse cursor meets an element is a powerful feedback tool unique to the Web. Actively use it to indicate clickability and provide supplementary info via tooltips.
* **Effective Use and Constraint of Width (Line Length)**: Wide screens allow multi-column layouts and sidebars. However, if a single line of text is too long, eye-tracking gets tiring, and readability drops. Restrict body text width to `600px - 800px` (around 40-80 characters).
* **Keyboard Navigation and Focus**: Having operations completable via keyboard (accessibility) is crucial—moving elements via the Tab key (reliable Focus ring display), submitting via Enter, dismissing modals via Esc, etc., during form inputs or data manipulation.
* **Information Density Control**: Large screens can show vast amounts of info at once, but simultaneously afford the luxury of wider "margins." While suited for complex data tables and multi-functional dashboards, be conscious of block-by-block grouping rather than overstuffing elements.

### 10.2 Mobile (Smartphone) Specifics
Mobile devices assume "limited screen sizes," "finger (touch) operation," and "usage on the go or in spare moments."

* **Securing Touch Targets (Tap Areas)**: Finger operations are less precise than mouse cursors. Following Apple/Google guidelines, secure a clickable area of at least `44x44pt` (or `48x48dp`) including surrounding padding (Fitts's Law).
* **Awareness of the "Thumb Zone"**: Place critical actions where the thumb naturally reaches when holding a phone one-handed (bottom navigation, bottom sheets, sticky bottom buttons). Conversely, place "Cancel" or "Back" operations in the top left/right (hard to reach) to prevent accidental taps.
* **Absence of Hover and Active Feedback**: Mobile has no Hover state (long presses have different meanings). Therefore, visually feedback that an element is "Pressed (Active)" the instant it is touched (via color sinking or ripple effects) to complement the operational feel.
* **Respecting Native OS Conventions (Mental Models)**: Don't defy the interaction systems users are accustomed to per OS.
  * **iOS**: "Edge swipe" from the left to go back is heavily used. Be careful of interference when placing horizontal swipe interactions (like carousels) on the left edge.
  * **Android**: Because system-level back navigation exists, align the behavior of in-screen "Back" buttons or modal dismissal with system behaviors.
* **Progressive Disclosure**: Narrow screens mean showing all info at once spikes cognitive load. Initial displays should show only a "minimal summary," using "Read More" buttons, accordions, or separate pages to disclose further details progressively upon user request.

---

## 11. Design Differences Between B2B and B2C

Whether a product targets "Enterprise/Business (B2B)" or "General Consumers (B2C)" fundamentally alters the user's goals and usage context. Confusing these leads to an "unusable" product.

### 11.1 B2B (Business Systems / SaaS) Characteristics & Design Points
B2B users aim to "execute tasks efficiently" and use the system "routinely, for long hours, and involuntarily (mandated by the company)."

* **Emphasis on Density and Scannability**: They need to compare and process large amounts of data with minimal scrolling, so information density should be higher (tighter margins) than in B2C. Offering "Compact modes" (slightly smaller fonts, tighter table row heights) is effective.
* **Maximizing Efficiency and Productivity**: "Speed of operation after mastery" is prioritized over "ease of learning." Enhance keyboard shortcuts, bulk actions, and advanced search/filtering functions.
* **Structuring Complex Data**: Often handles massive forms and deeply nested data. Devise ways to split info into steps (wizards), hide unneeded info (progressive disclosure), or allow parallel tasks by splitting screens (split views, drawers).
* **"Accuracy and Stability" over Emotion**: Flashy animations and eccentric designs create noise for business tasks. Adopt subdued, trustworthy tones (blue/gray base), focusing on communicating errors or abnormal states reliably and calmly.

### 11.2 B2C (Consumer Apps / Services) Characteristics & Design Points
B2C users seek "fun, convenience, and problem-solving," using systems "voluntarily, in spare time, and based on mood." Any difficulty leads to instant dropout (uninstalls).

* **Intuitive Use and Elimination of Learning Costs**: They must know what happens if they press somewhere at first glance, without manuals or tutorials. Strictly adhere to industry-standard UI patterns (hamburger menus, swipes, like buttons) and never force users to learn new operations.
* **Low Density and Use of Whitespace**: Presenting too much info at once confuses users. Minimize the amount of info (tasks) per screen, using bold whitespace to guide eyes precisely to the primary action (CTA).
* **Emotional Connection and "Delight"**: Push brand colors forward, using illustrations and beautiful typography to create product fans. Micro-interactions—like a heart animating when liked, or confetti on task completion—directly impact retention.
* **Personalization and Recommendations**: Users prefer "passive" experiences where the system suggests "recommendations" without them having to search manually.

---

## 12. Introduction of Design Tokens and Maintainability

When engineers manage and implement designs in code, "Design Tokens" have become standard practice for avoiding hardcoding and ensuring consistency. They prevent drift between design and code by managing design components as semantic variables.

### 12.1 What are Design Tokens?
Specific visual property values—like colors (`#0052CC`), typography (`16px`), spacing (`24px`), border radii (`8px`), and shadows—are not written directly, but are defined as **"variables with meaning (tokens)"** like `color-brand-primary` or `spacing-md`.

### 12.2 Token Tiers
Tokens are generally divided into two or three tiers for management, balancing scalability and maintainability.

1. **Global Tokens (Base / Primitive Tokens)**:
   A foundational layer simply naming "values." They carry no context or meaning.
   * Ex: `color-blue-500 = #3b82f6`
   * Ex: `space-4 = 16px`
2. **Semantic Tokens**:
   A layer referring to Global Tokens, defining "what (meaning) that value is used for." **During development, always use tokens from this tier (or the next).**
   * Ex: `color-primary = color-blue-500`
   * Ex: `color-error = color-red-500`
   * Ex: `text-body = font-size-16`
3. **Component Tokens**:
   The most specific layer, applying only to precise parts of particular components (often omitted).
   * Ex: `button-primary-bg = color-primary`
   * Ex: `button-padding = space-4`

### 12.3 Biggest Benefits of Introducing Design Tokens
* **Easy Dark Mode / Theme Switching**: Changing themes collectively without modifying code just by switching what Semantic Tokens point to (e.g., changing `color-background` to point from `color-white` to `color-gray-900` during dark mode).
* **Seamless Design-to-Code Sync**: Unifying variable names in design tools (like Figma) and code (CSS Variables, Tailwind configs) eradicates communication gaps and solves the "implemented differently than intended" problem.
* **Drastic Drop in Maintenance Costs**: Even if brand colors change or base font sizes adjust, rewriting the master token value in one place safely reflects changes system-wide.

Hardcoding UIs (writing magic numbers directly) is technical debt identical to "magic numbers" in code logic. Aim for a state where ALL values are applied through tokens.

---

## 13. Animation and Transition (Designing Motion and Time)

UI animations are not mere "decorations," but "functions to navigate users." Properly configured motion intuitively conveys relationships between elements and system state transitions, elevating product quality at a visceral level.

### 13.1 The Essential Roles of Animation
* **Explaining State Changes**: Functions as connective tissue (context) explaining "where a newly added item went" or "where the current screen came from." Greatly reduces cognitive load compared to abrupt cuts.
* **Guiding the Eye**: Adding a "little bit of motion" to a newly appearing error message or toast guaranteeably draws the user's attention.
* **Feedback for Direct Manipulation**: Depressions on button presses (Active) or motion following a swipe provides undeniable reassurance that "the system is correctly reacting to my actions."

### 13.2 Basics of Duration and Easing
90% of an animation's impression is determined by "Duration (time)" and "Speed of change (Easing)."

* **Duration Baselines**:
  * **Micro-interactions (Hover, toggles, button changes)**: `100ms - 200ms`. Ought to react instantly without making the user wait.
  * **Entrance/Exit of small elements (Tooltips, dropdowns)**: `200ms - 300ms`.
  * **Large screen transitions (Modal expansions, page navigations)**: `300ms - 500ms`. Too fast cannot be followed by the eye; too slow makes the whole system feel sluggish.
* **Principles of Easing**:
  Linear (constant speed) animation feels mechanical and unnatural. Because motion in the natural world involves "acceleration" and "deceleration," always apply an easing function.
  * **Ease-Out (Deceleration)**: The most frequently used. Use when an element "comes in (enters)." It appears quickly and smoothly stops in place.
  * **Ease-In (Acceleration)**: Use when an element "goes out (exits)." It starts moving slowly and swiftly vanishes off-screen.
  * **Ease-In-Out (Acceleration & Deceleration)**: Use for constant movement of an element within the screen (A to B).

### 13.3 Performance Considerations
Browser animations heavily impact performance based on rendering algorithms.
* **Recommended Properties**: Principle animation targets should be limited to `transform` (position/scale) and `opacity` (transparence). Because these are processed quickly on the GPU, juddering (jank) rarely occurs.
* **Properties to Avoid**: Animating properties that trigger layout recalculation—like `width`, `height`, `margin`, `padding`, `top`, `left`—is the biggest cause of performance degradation. Design implementations not to "change sizes," but rather to "scale using `transform: scale()`."

### 13.4 Don't Overdo It (Ensuring Accessibility)
Excessive animation stresses users by making them feel "they are being made to wait," and creates physical impediments for users with vestibular disorders (screen motion sickness).
* **Design by Subtraction**: Instead of ostentatiously animating everything, restrict motion strictly to "areas you want the user to focus on."
* **Supporting "Reduce Motion" Settings**: Detecting OS-level settings (`prefers-reduced-motion`) and disabling animations (or swapping them for simple crossfades) is increasingly a mandatory requirement in modern web development.

---

By applying the principles and rules in this guide, even without specialized "knowledge of art," you can deliver highly usable, robust product designs. Validate the "User and Environment Prerequisites"—Web or Mobile, B2B or B2C—first, and when in doubt, always fall back on the "Basics (CRAP rules, 8pt Grid, Token Management, and Meaningful Motion)."
