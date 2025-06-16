import { useEffect, useRef } from "react";
import { MapRenderer } from "./MapRenderer";

import React from "react";

export default function MapCanvas(): React.JSX.Element {
  const canvasContainer = useRef<HTMLDivElement>(null);
  let renderer: MapRenderer;

  useEffect(() => {
    if (canvasContainer.current) {
      renderer = new MapRenderer(canvasContainer.current, 1280, 720);
      renderer.renderMapToTexture((g) => {
        g.fill(0x336699);
        g.rect(0, 0, 1280, 720);
      });
    }

    return () => {
      renderer?.app.destroy(true, {
        children: true,
        texture: true,
        context: true,
      });
    };
  }, []);

  return (
    <div ref={canvasContainer} style={{ width: "100%", height: "100%" }} />
  );
}
