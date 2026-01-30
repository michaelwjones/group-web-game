# Blind Artists

## Game Overview

Blind Artists is a cooperative game for 12 players where everyone is "blind" and trying to paint a picture together. Players don't know what they're painting - the image emerges from their collective contributions, like impressionism. Through deduction, clues, and coordination, they must paint the correct colors in the correct slots to match a hidden target that none of them can see.

---

## Theme: Scenes

The target painting is always a scene. Players contribute colors to zones without knowing the full picture. When they succeed, the scene reveals itself.

Each element below has a set of valid colors. "Any" means all 6 colors are valid.

---

### Landscape

| Zone | Element | Valid Colors |
|------|---------|--------------|
| Back | Clear Sky | Blue |
| Back | Sunset Sky | Orange, Red, Purple |
| Back | Overcast Sky | Purple, Blue |
| Mid | Mountains | Purple, Blue, Orange |
| Mid | Rolling Hills | Green, Yellow |
| Mid | Autumn Forest | Orange, Red, Yellow |
| Mid | Lake | Blue, Green |
| Fore | Grass Field | Green, Yellow |
| Fore | Autumn Field | Orange, Yellow, Red |
| Fore | Sandy Beach | Yellow, Orange |
| Fore | Snowy Ground | Blue, Purple |
| Focus | Sun | Yellow, Orange |
| Focus | Moon | Blue, Purple, Yellow |
| Focus | Tree | Green, Orange, Red, Yellow |

---

### Underwater

| Zone | Element | Valid Colors |
|------|---------|--------------|
| Back | Surface Light | Blue, Yellow, Green |
| Back | Open Water | Blue, Green, Purple |
| Mid | Coral Reef | Orange, Red, Purple, Yellow |
| Mid | Kelp Forest | Green, Yellow |
| Mid | School of Fish | Any |
| Fore | Sandy Seafloor | Yellow, Orange |
| Fore | Seagrass Bed | Green |
| Fore | Rocky Bottom | Purple, Blue, Orange |
| Focus | Tropical Fish | Any |
| Focus | Jellyfish | Purple, Blue, Red |
| Focus | Treasure Chest | Yellow, Orange |
| Focus | Sea Turtle | Green, Blue, Yellow |

---

### Space

| Zone | Element | Valid Colors |
|------|---------|--------------|
| Back | Deep Space | Blue, Purple |
| Back | Colorful Nebula | Purple, Red, Orange, Blue, Green |
| Mid | Distant Galaxy | Purple, Blue, Yellow |
| Mid | Gas Giant | Orange, Red, Yellow, Purple |
| Mid | Ice Planet | Blue, Green, Purple |
| Mid | Rocky Planet | Orange, Red, Yellow |
| Fore | Asteroid Field | Orange, Yellow, Red |
| Fore | Alien Terrain | Any |
| Fore | Crater Surface | Purple, Blue, Orange |
| Focus | Star | Yellow, Orange, Red |
| Focus | Moon | Blue, Yellow, Purple |
| Focus | Comet | Blue, Purple, Green |
| Focus | Space Station | Any |

---

### Still Life

| Zone | Element | Valid Colors |
|------|---------|--------------|
| Back | Painted Wall | Any |
| Back | Window Light | Yellow, Blue, Orange |
| Back | Curtain | Any |
| Mid | Ceramic Vase | Any |
| Mid | Wooden Bowl | Orange, Yellow, Red |
| Mid | Glass Bottle | Green, Blue, Purple |
| Mid | Metal Pot | Blue, Purple, Yellow |
| Fore | Wooden Table | Orange, Yellow, Red |
| Fore | Tablecloth | Any |
| Fore | Stone Counter | Blue, Purple, Orange |
| Focus | Flower | Any |
| Focus | Fruit | Red, Yellow, Orange, Green, Purple |
| Focus | Candle Flame | Yellow, Orange, Red |
| Focus | Wine Glass | Red, Purple, Yellow |

---

### Fantasy

| Zone | Element | Valid Colors |
|------|---------|--------------|
| Back | Mystical Sky | Purple, Blue, Green |
| Back | Aurora | Green, Purple, Blue, Yellow |
| Back | Enchanted Sunset | Orange, Purple, Red |
| Mid | Dark Forest | Green, Purple, Blue |
| Mid | Crystal Spires | Purple, Blue, Yellow |
| Mid | Floating Islands | Green, Orange, Yellow |
| Mid | Castle Silhouette | Purple, Blue |
| Fore | Magical Meadow | Green, Purple, Blue |
| Fore | Enchanted Grove | Green, Yellow, Purple |
| Fore | Volcanic Rock | Red, Orange |
| Fore | Crystal Cave | Purple, Blue, Yellow |
| Focus | Dragon | Any |
| Focus | Magic Orb | Any |
| Focus | Phoenix | Red, Orange, Yellow |
| Focus | Unicorn | Any |
| Focus | Wizard | Any |

---

## The Canvas

### Zones (4 total)

Zones represent depth layers in the scene:

| Zone | Concept | What it becomes |
|------|---------|-----------------|
| Back | Distant/upper | Sky, deep space, backdrop |
| Mid | Middle depth | Horizon, mountains, main subject |
| Fore | Close/lower | Ground, foreground, table |
| Focus | Accent element | Sun, moon, focal object |

### Slots (4 per zone)

Each zone has four slots that define its visual character:

| Slot | Purpose |
|------|---------|
| Primary | Dominant color of the zone |
| Accent | Secondary color adding interest |
| Highlight | Brightest point in the zone |
| Shadow | Depth and contrast |

### Target Structure (16 requirements)

The client's vision is a complete mapping of colors to slots:

| Zone | Primary | Accent | Highlight | Shadow |
|------|---------|--------|-----------|--------|
| Back | ? | ? | ? | ? |
| Mid | ? | ? | ? | ? |
| Fore | ? | ? | ? | ? |
| Focus | ? | ? | ? | ? |

Each `?` is one of the 6 possible colors. Players must deduce and paint the correct colors.

---

## Pigments & Colors

### Player Pigments
Every player has a hidden pigment: Red, Yellow, or Blue
- Hidden from everyone, including the player themselves
- Players are selected by Brushes to contribute their pigment to a mix
- Each player can only be selected 4 times total across the entire game
- Once a player has been selected 4 times, they cannot be chosen by any Brush
- Remaining uses per player must be visible in the UI (shown to all players when relevant)

### Pigment Self-Assessment
Players can mark what pigment they believe they are:
- Unknown (default) — player hasn't deduced their pigment yet
- Red, Yellow, or Blue — player's current guess

This is optional and can be changed at any time. Visible to all players to aid coordination.

### Starting Clues

At the start of the game, each player receives one clue about pigment distribution. Clues are intentionally vague — they provide a starting point for deduction but never certainty. Players must use brush strokes to confirm their theories.

Design principle: No combination of starting clues should allow players to deduce anyone's exact pigment. Clues narrow possibilities; strokes confirm them.

#### Neighbor Clues

| Format | Example |
|--------|---------|
| One of your neighbors is [color] | "One of your neighbors is Yellow" |
| Neither of your neighbors is [color] | "Neither of your neighbors is Blue" |
| Your two neighbors are not both [color] | "Your two neighbors are not both Red" |

#### Distance Clues

| Format | Example |
|--------|---------|
| Someone within 2 seats of you is [color] | "Someone within 2 seats of you is Blue" |
| No one within 2 seats of you is [color] | "No one within 2 seats of you is Yellow" |

#### Exclusion Clues

| Format | Example |
|--------|---------|
| [X] is not [color] | "Alice is not Yellow" |
| [X] and [Y] are not both [color] | "Alice and Bob are not both Red" |

#### Color Potential Clues (about 3 players)

| Format | Example | Meaning |
|--------|---------|---------|
| [X], [Y], and [Z] can make [secondary] | "Alice, Bob, and Carol can make Purple" | At least one Red and one Blue among them |
| [X], [Y], and [Z] cannot make [secondary] | "Alice, Bob, and Carol cannot make Green" | Missing at least one Yellow or one Blue |

#### Presence Clues (about 3-4 players)

| Format | Example |
|--------|---------|
| At least one of [X], [Y], [Z] is [color] | "At least one of Alice, Bob, Carol is Red" |
| Among [W], [X], [Y], [Z], at least two are [color] | "Among Alice, Bob, Carol, Dan, at least two are Blue" |

### Mixed Colors (6 total)
When pigments combine:

| Result | Pigments Combined |
|--------|-------------------|
| Red | Red alone |
| Yellow | Yellow alone |
| Blue | Blue alone |
| Orange | Red + Yellow |
| Green | Yellow + Blue |
| Purple | Red + Blue |

---

## Player Roles (12 Players)

Every player has two things:
1. A Pigment (hidden color - they are a resource)
2. A Role (their action type each round)

### Role Distribution

| Role | Count | Action per round |
|------|-------|------------------|
| Fine Brush | 2 | Select 1 player → creates a primary color |
| Thick Brush | 2 | Select 2 adjacent players → creates primary or secondary |
| Painter | 5 | Select loaded brush + zone + slot → paints 1 stroke |
| Liaison | 3 | Ask the client 1 question → shares feedback |

*If odd number of brushes, the extra is Thick.*

### Role Details

Brushes (Fine):
- Assigned role - cannot choose brush size
- Select 1 player → creates a primary color (Red, Yellow, or Blue)
- Can select themselves
- Each player can only be selected by one Brush per round
- The resulting color is hidden until the brush is used

Brushes (Thick):
- Assigned role - cannot choose brush size
- Select 2 adjacent players → creates a primary or secondary color
- Can select themselves (as one of the two)
- Each player can only be selected by one Brush per round
- The resulting color is hidden until the brush is used

Painters:
- Choose a loaded brush, a zone, and a slot
- Apply the brush's color to that slot
- If the slot already has a color, the new stroke replaces it

Liaisons:
- Start the game knowing the scene type (but not the specific target)
- Choose what question to ask the client each round
- Interpret and share feedback with the group

---

## Round Structure

### Simultaneous Choices

All players make their choices at any time during the round. Once everyone has submitted, the round resolves:

Brushes:
- Fine Brushes select 1 player
- Thick Brushes select 2 adjacent players
- Loaded brushes are created with the resulting colors

Painters:
- Select a loaded brush, a zone, and a slot
- The brush's color is applied to that slot
- New strokes replace existing colors in that slot

Liaisons:
- Choose what question to ask the client
- Receive and share feedback with the group

Resolution:
- All choices resolve simultaneously
- Canvas is updated with new strokes
- Feedback is generated based on results

### Pacing

- The game lasts exactly 5 rounds
- 5 strokes per round (25 total), 16 slots to fill
- Allows time to fill all slots plus correct some mistakes
- 3 questions per round (15 total) provides steady information flow

---

## The Client

The client is a game element (not a player) who has commissioned the painting.

- The client has a vision (the hidden target - 16 color requirements)
- The client provides feedback through the Liaison
- Feedback varies: sometimes precise, sometimes impressionistic

### Liaison Question Menu

Liaisons choose from a fixed menu of question types. Each question category has specific options and feedback styles.

#### 1. Zone Check
Ask about the state of a specific zone.

| Question | Feedback Style |
|----------|----------------|
| "How does the Back feel?" | Impressionistic: "too cold" / "too warm" / "harmonious" |
| "How does the Mid feel?" | Impressionistic |
| "How does the Fore feel?" | Impressionistic |
| "How does the Focus feel?" | Impressionistic |

#### 2. Slot Check
Ask about a slot type across all zones.

| Question | Feedback Style |
|----------|----------------|
| "How are the Primaries?" | Impressionistic: "struggling" / "mostly right" / "perfect" |
| "How are the Accents?" | Impressionistic |
| "How are the Highlights?" | Impressionistic |
| "How are the Shadows?" | Impressionistic |

#### 3. Color Check
Ask about a specific color's usage.

| Question | Feedback Style |
|----------|----------------|
| "How is Red being used?" | Mixed: "overused" / "underused" / "misplaced" / "just right" |
| "How is Yellow being used?" | Mixed |
| "How is Blue being used?" | Mixed |
| "How is Orange being used?" | Mixed |
| "How is Green being used?" | Mixed |
| "How is Purple being used?" | Mixed |

#### 4. Comparison
Ask which of two things is better or worse.

| Question | Feedback Style |
|----------|----------------|
| "Which zone is strongest?" | Precise: names the zone |
| "Which zone is weakest?" | Precise: names the zone |
| "Which slot type is strongest?" | Precise: names the slot type |
| "Which slot type is weakest?" | Precise: names the slot type |

#### 5. Progress
Ask about overall completion.

| Question | Feedback Style |
|----------|----------------|
| "How many slots are correct?" | Precise: number (e.g., "8 of 16") |
| "How satisfied is the client?" | Impressionistic: "frustrated" / "hopeful" / "pleased" / "delighted" |

#### 6. Element Reveal
Ask what element belongs in a zone (reveals concept, not colors).

| Question | Feedback Style |
|----------|----------------|
| "What element is in the Back?" | Precise: names the element (e.g., "Sunset Sky") |
| "What element is in the Mid?" | Precise: names the element |
| "What element is in the Fore?" | Precise: names the element |
| "What element is in the Focus?" | Precise: names the element |

Client responds with impressionistic feedback. Liaisons interpret and share with the group (room for imprecision).

---

## Information Flow

What players know:
- Their own role (Brush/Painter/Liaison)
- Liaisons also know the scene type
- Seating arrangement (who is adjacent - matters for thick brushes)
- Feedback from the client (via Liaison)
- What colors have been painted where (visible canvas)

What players don't know:
- Their own pigment
- Other players' pigments
- The target painting (specific color requirements)
- What color a loaded brush contains (until used)

How deduction works:
- Feedback hints at what slots need
- Painted colors hint at what pigments created them
- Players deduce pigments from patterns of success/failure
- Coordination improves as information accumulates

---

## Win Condition

TBD - options to explore:
- Binary: All 16 slots must be correct (exact match)
- Scoring: Points based on how many slots match
- Threshold: Need X of 16 slots correct to "satisfy" the client
- Tiered: Bronze/Silver/Gold based on match percentage

---

## Setup Requirements

Circular Arrangement: Players must be arranged in a circle. The game needs to know the physical seating order because Thick Brushes can only select adjacent players. Each player has exactly two neighbors (left and right).

---

## Open Questions

### Roles & Rounds
- Do roles rotate between rounds or stay fixed?

### Resolution & Conflicts
- What happens if multiple painters target the same slot in one round?
- What happens if multiple brushes try to select the same player? (Each player can only be selected once, but need conflict resolution)

### Feedback & Information
- How specific/vague is client feedback? (Categories defined, but exact algorithms needed)
- When do Liaisons act - their own phase, or during Loading/Painting?
- How are correct slots indicated? Progressive reveal, or only at end?

### Win Condition
- Which win condition model? (Binary, Scoring, Threshold, or Tiered - see above)

### Target Generation
- How is the target painting created? Random element per zone from scene type? Curated combinations?
- Are certain element combinations invalid or always valid within a scene type?
