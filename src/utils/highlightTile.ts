/**
 * Highlight the selected tile visually
 */
function highlightTile(
  canvasTiles: HTMLCanvasElement[][],
  selection: [number, number] | [number, number, number, number]
) {
  for (let i = 0; i < canvasTiles.length; i++) {
    for (let j = 0; j < canvasTiles[i].length; j++) {
      canvasTiles[i][j].style.border = "0px solid transparent";
    }
  }

  if (selection.length === 2) {
    const [i, j] = selection;
    canvasTiles[i][j].style.border = "2px solid yellow";
  } else {
    const [startRow, startCol, endRow, endCol] = selection;
    for (let i = startRow; i <= endRow; i++) {
      for (let j = startCol; j <= endCol; j++) {
        canvasTiles[i][j].style.border = "2px solid yellow";
      }
    }
  }
}

export { highlightTile };
