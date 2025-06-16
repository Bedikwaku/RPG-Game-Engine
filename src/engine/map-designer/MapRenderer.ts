import * as PIXI from "pixi.js";

export class MapRenderer {
  app: PIXI.Application;
  stage: PIXI.Container;
  viewport: PIXI.Container;
  backgroundRenderTexture: PIXI.RenderTexture;
  backgroundSprite: PIXI.Sprite;

  constructor(container: HTMLElement, width: number, height: number) {
    this.app = new PIXI.Application({
      width,
      height,
      backgroundColor: 0x000000,
      resolution: window.devicePixelRatio || 1,
      antialias: true,
    });

    container.appendChild(this.app.view);

    this.stage = this.app.stage;

    this.viewport = new PIXI.Container();
    this.stage.addChild(this.viewport);

    // Setup offscreen background RenderTexture
    this.backgroundRenderTexture = PIXI.RenderTexture.create({ width, height });
    this.backgroundSprite = new PIXI.Sprite(this.backgroundRenderTexture);
    this.viewport.addChild(this.backgroundSprite);
  }

  renderMapToTexture(renderFn: (g: PIXI.Graphics) => void) {
    const g = new PIXI.Graphics();
    renderFn(g);

    this.backgroundRenderTexture.resize(
      this.backgroundRenderTexture.width,
      this.backgroundRenderTexture.height
    );

    this.app.renderer.render(g, {
      renderTexture: this.backgroundRenderTexture,
    });

    g.destroy();
  }

  resize(width: number, height: number) {
    this.app.renderer.resize(width, height);
  }
}
