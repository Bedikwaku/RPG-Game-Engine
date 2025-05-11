# WebGL TypeScript Game Project Overview

## 🧩 Purpose

This project is a browser-based game built using TypeScript and WebGL. The game will feature a 3D tile-based map, with camera control and support for dynamic game logic such as events and blocked tiles. It will be modular and easily testable, with an architecture designed for clarity and scalability.

## 🚀 Technologies

- **Language:** TypeScript
- **Rendering:** WebGL
- **Build Tool:** Vite
- **Testing Framework:** Vitest
- **Module Aliases:** Configurable via `tsconfig.json`

## 📁 Project Structure

```

```

## Game Objects

### Map

The map object defines the maps or scenes within the game. Each map is a 3D array of tiles, where each tile can have different properties such as texture, type, and other attributes. The map object also includes methods for loading and saving maps, as well as generating default maps. The map is designed to be flexible and extensible, allowing for easy addition of new features or changes to existing ones.
The map object is used in conjunction with the tileset object, which defines the available textures and their properties. The map and tileset objects work together to create a rich and immersive game world, allowing for dynamic interactions and events based on the properties of the tiles and the player's actions.

### Tileset

To add documentation

### Tile

To add documentation

## Game Engine Tools

### Map Editor

### Character (NPC) Editor

## AI

### NPC

#### Movement

#### Dialogue

#### Combat

#### Events

## 🗺️ Map Representation

- The map is modeled as a 3D array: `Map3D[z][y][x]`
- Each tile is an object of type `TileProps`:

  ```ts
  type TileProps = {
    textureId: string; // ID of the texture to render
    blocked?: boolean; // Whether the tile can be traversed
    event?: string; // Optional event trigger ID
    [key: string]: any; // Extendable for future gameplay mechanics
  };
  ```

- The choice of Z → Y → X order supports:

  - Layered rendering from background to foreground (Z)
  - Efficient row-column access for rendering (Y and X)

## 🧠 Design Decisions

- **Sparse vs Dense Map:** We use a dense 3D array because >80% of tiles will contain some data (texture, event, etc.). Sparse representations would add overhead without much gain.
- **Type Modularity:** All type declarations are isolated in `types/index.ts` to support strong typing and LLM context clarity.
- **Aliases:** `@shared/*` (formerly `@types/*`) used for clearer and conflict-free imports of shared types.
- **Testing:** Vitest is integrated early to enforce TDD and rapid iteration.

## 🧪 Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test
```

## 🧭 Next Steps

- Save map on paint
- Add ability to change Z level for painting
- Add transparency

---

> This document serves as both onboarding context and an LLM-readable design record. Future updates should continue documenting high-level architecture, key APIs, and rationale for technical choices.
