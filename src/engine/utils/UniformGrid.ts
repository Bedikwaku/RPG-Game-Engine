interface Plot {
  entities: Set<number>; // Using entity ID for reference
}

export class UniformGrid {
  private grid: Map<string, Plot> = new Map();
  private readonly plotSize: number;

  constructor(plotSize: number) {
    this.plotSize = plotSize;
  }

  private getPlotKey(x: number, y: number): string {
    const gridX = Math.floor(x / this.plotSize);
    const gridY = Math.floor(y / this.plotSize);
    return `${gridX},${gridY}`;
  }

  addEntity(x: number, y: number, entityId: number): void {
    const key = this.getPlotKey(x, y);
    if (!this.grid.has(key)) {
      this.grid.set(key, { entities: new Set() });
    }
    this.grid.get(key)?.entities.add(entityId);
  }

  removeEntity(x: number, y: number, entityId: number): void {
    const key = this.getPlotKey(x, y);
    const plot = this.grid.get(key);
    if (plot) {
      plot.entities.delete(entityId);
      if (plot.entities.size === 0) {
        this.grid.delete(key);
      }
    }
  }

  getEntitiesInRegion(
    x: number,
    y: number,
    width: number,
    height: number
  ): Set<number> {
    const result = new Set<number>();
    const startX = Math.floor(x / this.plotSize);
    const startY = Math.floor(y / this.plotSize);
    const endX = Math.floor((x + width) / this.plotSize);
    const endY = Math.floor((y + height) / this.plotSize);

    for (let gx = startX; gx <= endX; gx++) {
      for (let gy = startY; gy <= endY; gy++) {
        const plot = this.grid.get(`${gx},${gy}`);
        if (plot) {
          for (const id of plot.entities) {
            result.add(id);
          }
        }
      }
    }

    return result;
  }
}
