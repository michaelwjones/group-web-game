# Blind Artists

## Overview

Blind Artists is a cooperative game where everyone is "blind" and trying to paint a picture together. Players don't know what they're painting—the image emerges from their collective contributions. Through deduction, clues, and coordination, they must paint the correct colors in the correct slots to match a hidden target that none of them can see.

---

## Core Concepts

### The Canvas

The canvas has 4 zones, each with 4 slots, for 16 total slots to fill.

**Zones** represent depth layers in the scene:

| Zone | Concept | What it becomes |
|------|---------|-----------------|
| Back | Distant/upper | Sky, deep space, backdrop |
| Mid | Middle depth | Horizon, mountains, main subject |
| Fore | Close/lower | Ground, foreground, table |
| Focus | Accent element | Sun, moon, focal object |

**Slots** define each zone's visual character:

| Slot | Purpose |
|------|---------|
| Primary | Dominant color of the zone |
| Secondary | Secondary color adding interest |
| Highlight | Brightest point in the zone |
| Shadow | Depth and contrast |

**The Target** is the client's hidden vision—a complete mapping of colors to all 16 slots:

| Zone | Primary | Secondary | Highlight | Shadow |
|------|---------|-----------|-----------|--------|
| Back | ? | ? | ? | ? |
| Mid | ? | ? | ? | ? |
| Fore | ? | ? | ? | ? |
| Focus | ? | ? | ? | ? |

Each `?` is one of 6 possible colors. Players must deduce and paint the correct colors.

### Colors

**6 colors** can appear on the canvas: Red, Yellow, Blue, Orange, Green, Purple.

**3 pigments** exist among players: Red, Yellow, Blue. Pigments are distributed as equally as possible among players at game start. These combine to make colors:

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
| Liaison | Ask the client 1 question → shares feedback |

### Brushes

Brushes select players to create loaded brushes with colors.

**Fine Brush:**
- Select 1 player → creates a primary color (Red, Yellow, or Blue)
- Can select any player, including themselves
- The resulting color is hidden until the brush is used

**Thick Brush:**
- Select 2 players: any player + one of their direct neighbors
- Can select themselves (as one of the two)
- The resulting color is hidden until the brush is used

**Pigment limits:**
- Each player can only be selected 4 times total across the entire game
- Once a player has been selected 4 times, they cannot be chosen by any Brush
- Remaining uses per player must be visible in the UI
- Multiple brushes can select the same player in a round, as long as the pigment limit is respected
- If more brushes select a player than they have uses remaining, affected brushes must re-choose

### Painters

- Choose a loaded brush, a zone, and a slot
- Apply the brush's color to that slot
- If the slot already has a color, the new stroke replaces it
- Multiple painters cannot target the same slot in the same round—if conflicts occur, affected painters must re-select until all choices are unique

### Liaisons

Liaisons are the conduit between the players and the client.

**Starting knowledge:**
- Know the scene type
- Each Liaison learns one element of the painting (e.g., "The Back is Aurora")
- Liaisons learn different elements—no overlap among them

**Each round:**
- Choose a question category and receive feedback
- Receive freebie feedback from the client
- Share all feedback with the group in their own words

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

## Round Structure

The game lasts exactly 5 rounds.

### Simultaneous Choices

All players make their choices at any time during the round. Once everyone has submitted, the round resolves.

**Brushes:**
- Fine Brushes select 1 player
- Thick Brushes select 2 adjacent players
- Loaded brushes are created with the resulting colors

**Painters:**
- Select a loaded brush, a zone, and a slot
- The brush's color is applied to that slot
- New strokes replace existing colors in that slot

**Liaisons:**
- Choose what question to ask the client
- Receive feedback from their question
- Receive freebie feedback from the client

### Resolution

- All choices resolve simultaneously
- Canvas is updated with new strokes
- Feedback is generated and shared

---

## Information & Deduction

### What Players Know

- Their own role (Brush/Painter/Liaison)
- Seating arrangement (who is adjacent—matters for Thick Brushes)
- What colors have been painted where (visible canvas)
- Feedback from the client (via Liaisons)
- Liaisons also know the scene type and one element each (no overlap)

### What Players Don't Know

- Their own pigment
- Other players' pigments
- The target painting (specific color requirements)
- What color a loaded brush contains (until used)

### Starting Clues

At game start, each player receives one clue about pigment distribution. Clues are intentionally vague—they provide a starting point for deduction but never certainty. Players must use brush strokes to confirm their theories.

Design principle: No combination of starting clues should allow players to deduce anyone's exact pigment. Clues narrow possibilities; strokes confirm them.

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

- Feedback hints at what slots need
- Painted colors hint at what pigments created them
- Players deduce pigments from patterns of success/failure
- Coordination improves as information accumulates

---

## Setup

### Circular Seating

Players must be arranged in a circle. The game needs to know the seating order because Thick Brushes can only select adjacent players. Each player will need to specify who is sitting to their left and right. The game will then generate the circle from that information.

### Example: 12 Players

| Role | Count |
|------|-------|
| Fine Brush | 2 |
| Thick Brush | 2 |
| Painter | 5 |
| Liaison | 3 |

**Per round:**
- 4 Brushes → 4 loaded brushes available
- 5 Painters → 5 strokes applied
- 3 Liaisons → 3 questions asked, 3 freebies received

**Over 5 rounds:**
- 25 strokes total (16 slots + 9 corrections)
- 15 questions + 15 freebies = 30 pieces of client feedback

**At game start:**
- 3 Liaisons learn 3 different elements → 1 zone remains unknown to all

---

## Content: Landscape

The target painting is always a scene. Currently, the only scene type is Landscape.

**Target generation:**
- One element is randomly selected for each zone. All combinations are valid—no curated pairings.
- For Primary and Secondary slots, a color is randomly chosen from the element's valid options.
- For Highlight and Shadow slots, a color is randomly chosen from all 6 colors.

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

---

## Open Questions

### Win Condition
- Binary: All 16 slots must be correct (exact match)
- Scoring: Points based on how many slots match
- Threshold: Need X of 16 slots correct to "satisfy" the client
- Tiered: Bronze/Silver/Gold based on match percentage


