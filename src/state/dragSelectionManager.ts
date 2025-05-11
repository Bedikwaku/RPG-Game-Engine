type DragStart = [number, number] | null;

export class DragSelectionManager {
  private isDragging = false;
  private dragStart: DragStart = null;

  start(row: number, col: number) {
    this.isDragging = true;
    this.dragStart = [row, col];
  }

  update(row: number, col: number): [number, number, number, number] | null {
    if (!this.isDragging || !this.dragStart) return null;
    const [startRow, startCol] = this.dragStart;
    return [
      Math.min(startRow, row),
      Math.min(startCol, col),
      Math.max(startRow, row),
      Math.max(startCol, col),
    ];
  }

  stop() {
    this.isDragging = false;
    this.dragStart = null;
  }
}

export const dragSelectionManager = new DragSelectionManager();
