import type { TileProps, Map3D } from "@shared/index";

export function createEmptyMap3D(
  width: number,
  height: number,
  depth: number,
  defaultTexture = "void"
): Map3D {
  return Array.from({ length: depth }, () =>
    Array.from({ length: height }, () =>
      Array.from({ length: width }, () => ({ textureId: defaultTexture }))
    )
  );
}
