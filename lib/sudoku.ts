export type Grid = number[]; // length 81, row-major, 0 = empty

const SIZE = 9;
const BOX = 3;

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isSafe(grid: Grid, row: number, col: number, val: number): boolean {
  const boxRow = Math.floor(row / BOX) * BOX;
  const boxCol = Math.floor(col / BOX) * BOX;
  for (let i = 0; i < SIZE; i++) {
    if (grid[row * SIZE + i] === val) return false;
    if (grid[i * SIZE + col] === val) return false;
  }
  for (let r = 0; r < BOX; r++) {
    for (let c = 0; c < BOX; c++) {
      if (grid[(boxRow + r) * SIZE + (boxCol + c)] === val) return false;
    }
  }
  return true;
}

function findEmpty(grid: Grid): number {
  return grid.indexOf(0);
}

export function generateSolvedGrid(): Grid {
  const grid: Grid = new Array(81).fill(0);

  function fill(): boolean {
    const idx = findEmpty(grid);
    if (idx === -1) return true;
    const row = Math.floor(idx / SIZE);
    const col = idx % SIZE;
    for (const val of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
      if (isSafe(grid, row, col, val)) {
        grid[idx] = val;
        if (fill()) return true;
        grid[idx] = 0;
      }
    }
    return false;
  }

  fill();
  return grid;
}

// Counts solutions up to `cap`, stopping early once reached.
function countSolutions(grid: Grid, cap: number): number {
  let count = 0;

  function backtrack(): boolean {
    const idx = findEmpty(grid);
    if (idx === -1) {
      count++;
      return count >= cap;
    }
    const row = Math.floor(idx / SIZE);
    const col = idx % SIZE;
    for (let val = 1; val <= 9; val++) {
      if (isSafe(grid, row, col, val)) {
        grid[idx] = val;
        const stop = backtrack();
        grid[idx] = 0;
        if (stop) return true;
      }
    }
    return false;
  }

  backtrack();
  return count;
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

const CLUES: Record<Difficulty, number> = {
  easy: 40,
  medium: 33,
  hard: 27,
  expert: 22,
};

export function generatePuzzle(difficulty: Difficulty): { puzzle: Grid; solution: Grid } {
  const solution = generateSolvedGrid();
  const puzzle = solution.slice();
  const targetClues = CLUES[difficulty];
  const positions = shuffle(Array.from({ length: 81 }, (_, i) => i));

  let clues = 81;
  for (const idx of positions) {
    if (clues <= targetClues) break;
    const backup = puzzle[idx];
    puzzle[idx] = 0;
    if (countSolutions(puzzle.slice(), 2) === 1) {
      clues--;
    } else {
      puzzle[idx] = backup;
    }
  }

  return { puzzle, solution };
}

export function isBoardComplete(grid: Grid): boolean {
  return grid.every((v) => v !== 0);
}

// Returns the set of cell indices that conflict with another cell in the
// same row, column, or 3x3 box.
export function findConflicts(grid: Grid): Set<number> {
  const conflicts = new Set<number>();

  const markDuplicates = (indices: number[]) => {
    const seen = new Map<number, number>();
    for (const idx of indices) {
      const val = grid[idx];
      if (val === 0) continue;
      if (seen.has(val)) {
        conflicts.add(idx);
        conflicts.add(seen.get(val)!);
      } else {
        seen.set(val, idx);
      }
    }
  };

  for (let row = 0; row < SIZE; row++) {
    markDuplicates(Array.from({ length: SIZE }, (_, col) => row * SIZE + col));
  }
  for (let col = 0; col < SIZE; col++) {
    markDuplicates(Array.from({ length: SIZE }, (_, row) => row * SIZE + col));
  }
  for (let br = 0; br < BOX; br++) {
    for (let bc = 0; bc < BOX; bc++) {
      const indices: number[] = [];
      for (let r = 0; r < BOX; r++) {
        for (let c = 0; c < BOX; c++) {
          indices.push((br * BOX + r) * SIZE + (bc * BOX + c));
        }
      }
      markDuplicates(indices);
    }
  }

  return conflicts;
}
