# Blind Artists - Artist Commission Brief

## Project Overview

**Blind Artists** is a cooperative game for 12+ players where everyone is "blind" and trying to paint a picture together. Players paint strokes as the game progresses but they don't know what their painting looks like until the end of the game. At that point, the image they painted and the ideal reference image will be displayed side by side.

### How Art Will Be Used

The game uses a layered scene system with 4 depth zones:

| Zone | Layer Order | Purpose |
|------|-------------|---------|
| **Back** | Bottom layer | Sky, atmosphere, distant elements |
| **Mid** | Second layer | Horizon, middle-distance features |
| **Fore** | Third layer | Foreground, ground-level elements |
| **Focus** | Top layer | Focal accent element |

These layers combine to create complete landscape scenes. Players contribute colors to slots within these zones, and the collective painting emerges from their contributions.

---

## Art Style Direction

### Style: Painterly/Impressionist

- **Loose brushstrokes** - visible brush texture, not photorealistic
- **Soft edges** - elements should blend naturally when layered
- **Slightly Sloppy** - since the "artists" in this game are blind, don't be afraid to get a little messy. Brush strokes/paint drops/imperfections are okay

### Layering Considerations

Each element will be composited with others. Art should:
- Work harmoniously when combined with other layers
- Have appropriate transparency for depth
- Use consistent lighting direction across all elements

---

## Technical Requirements

### Canvas Specifications

- **Aspect ratio:** 1:1 (square) or 4:5 (slightly vertical)
- **Format:** PNG with transparency
- **Resolution:** 2048x2048 or 2048x2560

### Color System

The game uses a 6-color system: **Red, Orange, Yellow, Green, Blue, Purple**. All painting actions from players will be using one of those 6 colors.

All assets should be delivered in **greyscale**. We will apply the 6 colors programmatically in code. Along with the assets, please provide **6 hex codes** that work well together that we can use to convert the images.

### Slot System

Each element has 4 color slots that define its appearance:

| Slot | Purpose |
|------|---------|
| **Primary** | Dominant color of the element |
| **Secondary** | Supporting color adding variety |
| **Highlight** | Brightest accent point |
| **Shadow** | Depth and contrast |

Each slot is a separate greyscale asset that we will tint with the appropriate color.

---

## Element Assets

### Overview

There are 12 elements across 4 zones. Each element needs 4 greyscale assets (one per slot: Primary, Secondary, Highlight, Shadow).

### Back Zone (3 elements)

| Element | Description | Assets |
|---------|-------------|--------|
| **Aurora** | Northern lights in the sky | Primary, Secondary, Highlight, Shadow |
| **Sunset** | Warm sky at dusk/dawn | Primary, Secondary, Highlight, Shadow |
| **Storm Front** | Dramatic stormy atmosphere | Primary, Secondary, Highlight, Shadow |

### Mid Zone (3 elements)

| Element | Description | Assets |
|---------|-------------|--------|
| **Mountains** | Distant mountain range | Primary, Secondary, Highlight, Shadow |
| **Forest** | Tree-covered terrain | Primary, Secondary, Highlight, Shadow |
| **Lake** | Body of water at mid-distance | Primary, Secondary, Highlight, Shadow |

### Fore Zone (3 elements)

| Element | Description | Assets |
|---------|-------------|--------|
| **Meadow** | Grassy field in foreground | Primary, Secondary, Highlight, Shadow |
| **Rocky Shore** | Stones and shoreline | Primary, Secondary, Highlight, Shadow |
| **Snow Field** | Snow-covered ground | Primary, Secondary, Highlight, Shadow |

### Focus Zone (3 elements)

| Element | Description | Assets |
|---------|-------------|--------|
| **Lone Tree** | Single tree as focal point | Primary, Secondary, Highlight, Shadow |
| **Windmill** | Windmill structure as focal point | Primary, Secondary, Highlight, Shadow |
| **Campfire** | Fire as warm focal point | Primary, Secondary, Highlight, Shadow |

---

## Deliverables Summary

### Greyscale Assets

| Zone | Elements | Assets per Element | Subtotal |
|------|----------|-------------------|----------|
| Back | Aurora, Sunset, Storm Front | 4 | 12 |
| Mid | Mountains, Forest, Lake | 4 | 12 |
| Fore | Meadow, Rocky Shore, Snow Field | 4 | 12 |
| Focus | Lone Tree, Windmill, Campfire | 4 | 12 |
| **Total** | **12 elements** | | **48 assets** |

### Color Palette

Please provide 6 hex codes for the colors red, orange, yellow, green, blue, and purple.

### Total Deliverables

- **48 greyscale PNG assets** (12 elements × 4 slots)
- **6 hex codes** for the color palette
- PNG format with transparency
- 1:1 or 4:5 aspect ratio
- 2048×2048 or 2048×2560 resolution

### Reference Art

Reference art has been attached.