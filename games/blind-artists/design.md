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
| Thick Brush | Pair of 2 adjacent players; each selects 1 player → together create primary or secondary |
| Painter | Select loaded brush + valid slot (per subtype) → paints 1 stroke |
| Liaison | Consult the client → shares what they learn verbally |
| Critic | Examine the painting for correctness → shares what they observe verbally |

### Brushes

Brushes select players to create loaded brushes with colors. The resulting color is never revealed to anyone—not to the brush, not to the painter, not to anyone. Players only learn what color ended up on the canvas through Liaison feedback.

**Fine Brush:**
- Select 1 player → creates a primary color (Red, Yellow, or Blue)
- Can select any player, including themselves

**Thick Brush:**
- The role is held by 2 players who sit adjacent to each other
- Each selects 1 player independently; the two selected pigments combine to create the loaded brush color
- Each can select any player, including themselves

**Pigment limits:**
- Each player can only be selected 5 times total across the entire game
- Once a player has been selected 5 times, they cannot be chosen by any Brush
- Remaining uses per player must be visible in the UI

**Pigment limit enforcement:** Multiple brushes can select the same player within a single round. A player becomes unavailable only when their lifetime total of 5 uses has been reached (counting all previous rounds plus current selections). Players can freely change their brush choices until the host ends the round.

### Painters

Each painter is assigned one of 8 **subtypes** that restricts which canvas slots they can paint:

| Subtype | Can paint |
|---------|-----------|
| Back | Any slot in the Back zone |
| Mid | Any slot in the Mid zone |
| Fore | Any slot in the Fore zone |
| Focus | Any slot in the Focus zone |
| Primary | The Primary slot in any zone |
| Secondary | The Secondary slot in any zone |
| Highlight | The Highlight slot in any zone |
| Shadow | The Shadow slot in any zone |

Subtypes are assigned from a fixed priority order: Back, Mid, Fore, Focus, Shadow, Highlight, Secondary, Primary. With 5 painters, the first 5 in that list are always used. Painter subtypes are visible to all players.

- Choose a loaded brush and a valid slot (within their subtype's area)
- The brush's color is applied to that slot (the painter does not learn what color it is)
- If the slot already has a color, the new stroke replaces it

**Slot exclusivity:** Each zone+slot combination can only be selected by one painter at a time. If a painter has a slot selected, it is unavailable to other painters. If that painter changes their choice, the slot becomes available again. Players can freely change their selections until the host ends the round.

### Liaisons

Liaisons are the conduit between the players and the client. They consult with the client each round and share what they learn verbally.

**Starting knowledge:**
- Know the scene type
- Each Liaison learns one element of the painting
- Liaisons learn different elements—no overlap among them

**Each round:**
- Make a choice that determines what they ask the client
- Receive the client's response on their screen
- Share what they learn with the group in their own words

*Specific mechanics TBD.*

### Critic

The Critic reads the painting to assess how close it is to correct. They have no knowledge of the target—only of accuracy. They share what they observe verbally.

**Starting knowledge:** None. The Critic begins with no element or scene knowledge.

**Each round:**
- Make a choice that determines what aspect of the painting they examine
- Receive correctness feedback on their screen (what is right/wrong, not what colors are present)
- Share what they observe with the group in their own words

*Specific mechanics TBD.*

---

## Information & Deduction

### What Players Can See

- Their own role (Brush/Painter/Liaison)
- Seating arrangement (who is adjacent—matters for Thick Brushes)
- Which canvas slots have been painted and which are empty (no colors, no history)
- Each player's remaining pigment uses
- Each player's pigment self-assessment
- Each painter's subtype (which zone or slot type they are restricted to)
- Liaisons also know the scene type and the exact target colors for one element each (no overlap)
- The Critic knows none of this—only what correctness feedback they accumulate through play

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
| At least one of your neighbors is [color] | "At least one of your neighbors is Yellow" |
| Neither of your neighbors is [color] | "Neither of your neighbors is Blue" |

**Distance Clues:**

| Format | Example |
|--------|---------|
| At least one person within 2 seats of you (not including you) is [color] | "At least one person within 2 seats of you (not including you) is Blue" |
| No one within 2 seats of you (not including you) is [color] | "No one within 2 seats of you (not including you) is Yellow" |

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
- Each player in a Thick Brush pair selects 1 player independently
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

The game supports 14-18 players. Roles are assigned according to the table below. The Thick Brush Pairs column counts pairs—each pair is 2 adjacent players, so multiply by 2 for total players in that role.

| Players | Fine Brush | Thick Brush Pairs | Painter | Liaison | Critic |
|---------|------------|-------------------|---------|---------|--------|
| 14 | 2 | 2 | 5 | 2 | 1 |
| 15 | TBD | TBD | TBD | TBD | TBD |
| 16 | TBD | TBD | TBD | TBD | TBD |
| 17 | TBD | TBD | TBD | TBD | TBD |
| 18 | TBD | TBD | TBD | TBD | TBD |

**14-player breakdown per round:**
- 2 Fine Brushes + 2 Thick Brush pairs → 4 loaded brushes available
- 5 Painters → 5 strokes applied
- 2 Liaisons → 2 targeted questions asked
- 1 Critic → 1 assessment action + 1 freebie

**Over 5 rounds:**
- 25 strokes total (16 slots + 9 corrections)
- 10 Liaison questions + 5 Critic assessments + 5 freebies = 20 pieces of client feedback

**At game start:**
- 2 Liaisons learn 2 different elements → 2 zones remain unknown to all

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
