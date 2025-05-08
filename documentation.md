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
webgl-ts-game/
├── public/                  # Static assets (e.g., index.html)
├── src/                     # Application source code
│   ├── core/                # Core game logic (e.g., map, camera)
│   │   └── Map3D.ts         # Map creation and handling
│   ├── types/               # Shared types and interfaces
│   │   └── index.ts         # Map3D, TileProps, etc.
│   ├── main.ts              # App entry point and rendering bootstrap
│   └── renderer/            # WebGL rendering utilities (planned)
├── test/                    # Unit and integration tests
│   └── main.test.ts         # Example test
├── tsconfig.json            # TypeScript config (with path aliases)
├── vite.config.ts           # Vite and Vitest configuration
└── package.json             # Project metadata and scripts
```

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

- Implement `Camera.ts` for tile-based movement with smooth interpolation.
- Begin `WebGLRenderer.ts` with support for rendering basic tiles.
- Add input handling for keyboard controls.
- Expand map logic to support dynamic events and collision detection.

---

> This document serves as both onboarding context and an LLM-readable design record. Future updates should continue documenting high-level architecture, key APIs, and rationale for technical choices.
