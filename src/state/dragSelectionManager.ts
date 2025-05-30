type DragStart = [number, number] | null;

export class DragSelectionManager {
  private isDragging = false;
  private dragStart: DragStart = null;

  start(y: number, x: number) {
    this.isDragging = true;
    this.dragStart = [y, x];
  }

  update(y: number, x: number): [number, number, number, number] | null {
    if (!this.isDragging || !this.dragStart) return null;
    const [startY, startX] = this.dragStart;
    return [
      Math.min(startY, y),
      Math.min(startX, x),
      Math.max(startY, y),
      Math.max(startX, x),
    ];
  }

  stop() {
    this.isDragging = false;
    this.dragStart = null;
  }
}

export const dragSelectionManager = new DragSelectionManager();
