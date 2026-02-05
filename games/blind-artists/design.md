# Blind Artists

## Overview

Blind Artists is a cooperative game where everyone is "blind" and trying to paint a picture together. Players don't know what they're painting—the image emerges from their collective contributions. Through deduction, clues, and coordination, they must paint the correct colors in the correct slots to match a hidden target that none of them can see.

Players never see the colors on the canvas. They only learn what's been painted through Liaison feedback from the client. The challenge is piecing together fragmented information to guide brushes and painters toward the right result.

---

## Core Concepts

### The Canvas

The canvas has 4 zones, each with 4 slots, for 16 total slots to fill.

**Zones** represent depth layers in the scene:

| Zone | Concept |
|------|---------|
| Back | Distant/upper |
| Mid | Middle depth |
| Fore | Close/lower |
| Focus | Accent element |

**Slots** define each zone's visual character:

| Slot | Purpose |
|------|---------|
| Primary | Dominant color |
| Secondary | Secondary color |
| Highlight | Accentuates the element |
| Shadow | Provides depth and contrast |

**The Target** is the client's hidden vision—a complete mapping of colors to all 16 slots:

| Zone | Primary | Secondary | Highlight | Shadow |
|------|---------|-----------|-----------|--------|
| Back | ? | ? | ? | ? |
| Mid | ? | ? | ? | ? |
| Fore | ? | ? | ? | ? |
| Focus | ? | ? | ? | ? |

Each `?` is one of 6 possible colors. Players must deduce and paint the correct colors.

**Canvas visibility:** Players can see which slots have been painted and which are still empty. They cannot see what color is in any slot—not when it's painted, not after. Color information comes exclusively through Liaison feedback.

### Colors

**6 colors** can appear on the canvas: Red, Yellow, Blue, Orange, Green, Purple.

**3 pigments** exist among players: Red, Yellow, Blue. Pigments are distributed among players at game start based on the target's color requirements to maximize overhead (see Target and pigment generation). These combine to make colors:

| Result | Pigments Combined |
|--------|-------------------|
| Red | Red alone |
| Yellow | Yellow alone |
| Blue | Blue alone |
| Orange | Red + Yellow |
| Green | Yellow + Blue |
| Purple | Red + Blue |

---

## Roles

Every player has two things:
1. A **Pigment** (hidden color—they are a resource)
2. A **Role** (their action type each round)

| Role | Action per round |
|------|------------------|
| Fine Brush | Select 1 player → creates a primary color |
| Thick Brush | Select 2 adjacent players → creates primary or secondary |
| Painter | Select loaded brush + zone + slot → paints 1 stroke |
| Liaison | Ask the client 1 question → shares feedback verbally |

### Brushes

Brushes select players to create loaded brushes with colors. The resulting color is never revealed to anyone—not to the brush, not to the painter, not to anyone. Players only learn what color ended up on the canvas through Liaison feedback.

**Fine Brush:**
- Select 1 player → creates a primary color (Red, Yellow, or Blue)
- Can select any player, including themselves

**Thick Brush:**
- Select 2 players: any player + one of their direct neighbors
- Can select themselves (as one of the two)

**Pigment limits:**
- Each player can only be selected 5 times total across the entire game
- Once a player has been selected 5 times, they cannot be chosen by any Brush
- Remaining uses per player must be visible in the UI

**Pigment limit enforcement:** Multiple brushes can select the same player within a single round. A player becomes unavailable only when their lifetime total of 5 uses has been reached (counting all previous rounds plus current selections). Players can freely change their brush choices until the host ends the round.

### Painters

- Choose a loaded brush, a zone, and a slot
- The brush's color is applied to that slot (the painter does not learn what color it is)
- If the slot already has a color, the new stroke replaces it

**Slot exclusivity:** Each zone+slot combination can only be selected by one painter at a time. If a painter has a slot selected, it is unavailable to other painters. If that painter changes their choice, the slot becomes available again. Players can freely change their selections until the host ends the round.

### Liaisons

Liaisons are the conduit between the players and the client. They receive feedback on their screen and share it with the group verbally—there is no in-app chat or text sharing.

**Starting knowledge:**
- Know the scene type
- Each Liaison learns one element of the painting (e.g., "The Back is Aurora")
- Liaisons learn different elements—no overlap among them

**Each round:**
- Choose a question category and receive feedback on their screen
- Receive freebie feedback from the client
- Share all feedback with the group in their own words, out loud

#### Question Menu

Each Liaison independently chooses a question category, makes any required sub-choices, and receives their own feedback.

| Category | Player Chooses | Feedback | Example |
|----------|----------------|----------|---------|
| Locate | "zones" or "slots" | the worst one | "Mid" or "Primaries" |
| Diagnose | a zone or slot type | which are wrong in that scope | "Primary, Shadow" |
| Prescribe | nothing | color + (zone OR slot type) | "Blue in Mid" |
| Validate | zone + slot | yes / no | "No" |

**Locate** — Find where the biggest problems are.
- Choose to ask about zones or slot types
- Feedback: Names the zone (or slot type) with the most errors (ties broken randomly)
- Example: "Which zone needs the most work?" → "Mid"

**Diagnose** — Deep dive into one area.
- Choose a zone OR a slot type to investigate
- Feedback: Lists which positions are incorrect within that scope
- If everything in that scope is correct, says so
- Example: "What's wrong in Mid?" → "Primary, Shadow" or "Nothing—it's perfect"

**Prescribe** — Get a recommended action.
- No player input required
- Feedback: A color plus a partial location (zone OR slot type—game decides which)
- If the painting is already perfect, says so
- Example: "Blue in Mid" (but which of 4 slots?) or "Orange as a Primary" (but which of 4 zones?)
- The vagueness is intentional—players combine with other info to pinpoint

**Validate** — Confirm a specific theory.
- Choose a specific slot (zone + slot type)
- Feedback: Yes or No
- Example: "Is Mid/Primary correct?" → "No"

#### Freebie Feedback

At the end of each round, each Liaison receives an additional piece of unprompted feedback from the client.

- Each Liaison gets a different freebie
- The game selects useful information, prioritizing:
  - **Defensive**: Protect correct work from being painted over ("The Back is perfect")
  - **Offensive**: Direct attention to problem areas ("Nothing is right about the Fore")
- Phrased in client voice, e.g.:
  - "I love the Primary in the Focus"
  - "The Mid is almost there"
  - "The Shadows need serious work"

---

## Information & Deduction

### What Players Can See

- Their own role (Brush/Painter/Liaison)
- Seating arrangement (who is adjacent—matters for Thick Brushes)
- Which canvas slots have been painted and which are empty (no colors, no history)
- Each player's remaining pigment uses
- Each player's pigment self-assessment
- Liaisons also know the scene type and one element each (no overlap)

### What Players Cannot See

- Their own pigment
- Other players' pigments
- The target painting (specific color requirements)
- What color any loaded brush contains
- What color is in any canvas slot

### Starting Clues

At game start, each player receives one clue about pigment distribution. Clues are randomly assigned from the types below. They provide a starting point for deduction—ideally they narrow possibilities without giving certainty, though exact deduction from clues alone is not strictly prevented.

**Neighbor Clues:**
| Format | Example |
|--------|---------|
| One of your neighbors is [color] | "One of your neighbors is Yellow" |
| Neither of your neighbors is [color] | "Neither of your neighbors is Blue" |

**Distance Clues:**
| Format | Example |
|--------|---------|
| Someone within 2 seats of you is [color] | "Someone within 2 seats of you is Blue" |
| No one within 2 seats of you is [color] | "No one within 2 seats of you is Yellow" |

**Exclusion Clues:**
| Format | Example |
|--------|---------|
| [X] is not [color] | "Alice is not Yellow" |

**Color Potential Clues (about 3 players):**
| Format | Example | Meaning |
|--------|---------|---------|
| [X], [Y], and [Z] can make [secondary] | "Alice, Bob, and Carol can make Purple" | At least one Red and one Blue among them |
| [X], [Y], and [Z] cannot make [secondary] | "Alice, Bob, and Carol cannot make Green" | Missing at least one Yellow or one Blue |

**Presence Clues (about 3-4 players):**
| Format | Example |
|--------|---------|
| At least one of [X], [Y], [Z] is [color] | "At least one of Alice, Bob, Carol is Red" |
| Among [W], [X], [Y], [Z], at least two are [color] | "Among Alice, Bob, Carol, Dan, at least two are Blue" |

### Pigment Self-Assessment

Players can mark what pigment they believe they are:
- Unknown (default)—player hasn't deduced their pigment yet
- Red, Yellow, or Blue—player's current guess

This is optional and can be changed at any time. Visible to all players to aid coordination.

### How Deduction Works

- Liaison feedback hints at what slots need which colors
- When a brush's color lands on the canvas and Liaisons later report on it, players can work backward to deduce which pigments produced that color
- Players deduce pigments from patterns of success and failure
- Coordination improves as information accumulates over rounds

---

## Round Structure

The game lasts exactly 5 rounds. Rounds are untimed—players can change their choices freely until the host ends the round. The host has a button to advance to resolution when the group is ready.

### Live Choices

All players set their choices during the round. Choices are not locked on submission—players can change their mind at any time until the host ends the round.

**Brushes:**
- Fine Brushes select 1 player
- Thick Brushes select 2 adjacent players
- Multiple brushes can select the same player in the same round, as long as the player has not hit their lifetime limit of 5 uses (see Brushes section)

**Painters:**
- Select a loaded brush, a zone, and a slot
- A zone+slot combination can only be selected by one painter at a time; if another painter already has it selected, it is unavailable until that painter changes their choice (see Painters section)

**Liaisons:**
- Choose what question to ask the client

### Resolution

Once all players have submitted and the host ends the round:
- Brush colors are determined and applied to the canvas
- Liaison feedback is generated and shown on their screens
- The canvas slot grid updates to reflect which slots now have paint

---

## Setup

### Circular Seating

Players are arranged in a circle. The game needs to know the seating order because Thick Brushes can only select adjacent players. Each player specifies who is sitting to their left and right. The server assembles the circle from these reports and repeats the request for areas that are inconsistent.

### Player Counts

The game supports 12-18 players. Roles are assigned according to the table below.

| Players | Fine Brush | Thick Brush | Painter | Liaison |
|---------|------------|-------------|---------|---------|
| 12 | 2 | 2 | 5 | 3 |
| 13 | TBD | TBD | TBD | TBD |
| 14 | TBD | TBD | TBD | TBD |
| 15 | TBD | TBD | TBD | TBD |
| 16 | TBD | TBD | TBD | TBD |
| 17 | TBD | TBD | TBD | TBD |
| 18 | TBD | TBD | TBD | TBD |

**12-player breakdown per round:**
- 4 Brushes → 4 loaded brushes available
- 5 Painters → 5 strokes applied
- 3 Liaisons → 3 questions asked, 3 freebies received

**Over 5 rounds:**
- 25 strokes total (16 slots + 9 corrections)
- 15 questions + 15 freebies = 30 pieces of client feedback

**At game start:**
- 3 Liaisons learn 3 different elements → 1 zone remains unknown to all

---

## Win Condition

The game uses a tiered result based on how many of the 16 slots match the target:

| Correct Slots | Result |
|---------------|--------|
| 16 | Masterpiece |
| 14-15 | Impressed |
| 12-13 | Satisfied |
| Below 12 | Rejected |

### End of Game

After the final round resolves, the game reveals:
- The tier result
- The players' canvas (with colors now visible)
- The target painting

Both canvases are shown side by side so players can compare for themselves.

---

## Content: Landscape

The target painting is always a scene. Currently, the only scene type is Landscape.

**Target and pigment generation:**

1. **Generate target** — One element is randomly selected for each zone. All combinations are valid—no curated pairings. For Primary and Secondary slots, a color is randomly chosen from the element's valid options. For Highlight and Shadow slots, a color is randomly chosen from all 6 colors.
2. **Calculate pigment demand** — Tally the Red, Yellow, and Blue pigment uses required to paint the target. Each primary color (Red, Yellow, Blue) costs 1 use of its type. Each secondary color (Orange, Green, Purple) costs 1 use of each constituent pigment.
3. **Distribute pigments** — Assign pigments to players to maximize overhead. Instead of always distributing evenly, skew the assignment toward the pigment types in higher demand so that each type has the best possible supply-to-demand ratio.
4. **Validate** — Each pigment type must have at least 2x supply relative to its demand. If any type falls below 2x, regenerate the target and repeat.

Each element below has valid colors for Primary and Secondary slots.

### Back

| Element | Primary | Secondary |
|---------|---------|-----------|
| Aurora | Green, Purple | Green, Purple, Blue, Yellow |
| Sunset | Orange, Red | Orange, Red, Purple, Yellow |
| Storm Front | Purple, Blue | Purple, Blue, Green, Yellow |

### Mid

| Element | Primary | Secondary |
|---------|---------|-----------|
| Mountains | Purple, Blue | Purple, Blue, Orange, Green |
| Forest | Green, Orange | Green, Orange, Yellow, Red |
| Lake | Blue, Green | Blue, Green, Purple, Yellow |

### Fore

| Element | Primary | Secondary |
|---------|---------|-----------|
| Meadow | Green, Yellow | Green, Yellow, Orange, Purple |
| Rocky Shore | Blue, Orange | Blue, Orange, Purple, Yellow |
| Snow Field | Blue, Purple | Blue, Purple, Yellow, Green |

### Focus

| Element | Primary | Secondary |
|---------|---------|-----------|
| Lone Tree | Green, Orange | Green, Orange, Red, Yellow, Purple |
| Windmill | Orange, Red | Orange, Red, Yellow, Purple, Blue |
| Campfire | Orange, Yellow | Orange, Yellow, Red |
