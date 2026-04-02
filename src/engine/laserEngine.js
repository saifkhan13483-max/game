// Direction constants: 0=right, 1=down, 2=left, 3=up
export const DIR = { RIGHT: 0, DOWN: 1, LEFT: 2, UP: 3 };

// Delta [dRow, dCol] for each direction
const DIR_DELTA = [
  [0, 1],   // right
  [1, 0],   // down
  [0, -1],  // left
  [-1, 0],  // up
];

// Mirror / reflection: maps incoming direction → outgoing direction
// e.g. beam going right (0) hits / → goes up (3)
const FORWARD_MIRROR = [3, 2, 1, 0]; // right→up, down→left, left→down, up→right

// Mirror \ reflection
// e.g. beam going right (0) hits \ → goes down (1)
const BACKWARD_MIRROR = [1, 0, 3, 2]; // right→down, down→right, left→up, up→left

export function computeBeam(grid, source, gridSize) {
  const segments = [];
  let row = source.row;
  let col = source.col;
  let dir = source.direction;
  let hitCrystal = false;

  const maxSteps = gridSize * gridSize * 4 + 4;

  for (let step = 0; step < maxSteps; step++) {
    const [dr, dc] = DIR_DELTA[dir];
    const nextRow = row + dr;
    const nextCol = col + dc;

    // Beam exits grid
    if (nextRow < 0 || nextRow >= gridSize || nextCol < 0 || nextCol >= gridSize) {
      segments.push({
        r1: row, c1: col,
        r2: nextRow, c2: nextCol,
        exit: true,
      });
      break;
    }

    segments.push({ r1: row, c1: col, r2: nextRow, c2: nextCol, exit: false });
    row = nextRow;
    col = nextCol;

    const cell = grid[row][col];
    if (!cell) continue;

    switch (cell.type) {
      case 'crystal':
        hitCrystal = true;
        return { segments, hitCrystal };

      case 'blocker':
      case 'movable-blocker':
        return { segments, hitCrystal: false };

      case 'mirror-forward':
      case 'movable-mirror-forward':
        dir = FORWARD_MIRROR[dir];
        break;

      case 'mirror-backward':
      case 'movable-mirror-backward':
        dir = BACKWARD_MIRROR[dir];
        break;

      default:
        break;
    }
  }

  return { segments, hitCrystal };
}

// Build a 2D grid array from level definition
export function buildGrid(levelDef) {
  const { gridSize, source, crystal, fixed = [], movable = [] } = levelDef;
  const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));

  // Source cell
  grid[source.row][source.col] = { type: 'source', direction: source.direction };

  // Crystal
  grid[crystal.row][crystal.col] = { type: 'crystal' };

  // Fixed objects
  for (const obj of fixed) {
    grid[obj.row][obj.col] = { type: obj.type, id: obj.id };
  }

  // Movable objects
  for (const obj of movable) {
    grid[obj.row][obj.col] = { type: obj.type, id: obj.id };
  }

  return grid;
}

export function getStarRating(moveCount, levelDef) {
  const { optimalMoves, perfectMoves, moveLimit } = levelDef;
  if (moveCount <= perfectMoves) return 3;
  if (moveCount <= optimalMoves) return 2;
  return 1;
}

export function directionLabel(dir) {
  return ['→', '↓', '←', '↑'][dir];
}
