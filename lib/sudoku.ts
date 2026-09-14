export type Grid = number[]; // length 81, row-major, 0 = empty

const SIZE = 9;
const BOX = 3;
const FULL_MASK = 0x1ff; // bits 0-8 represent digits 1-9

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function boxOf(row: number, col: number): number {
  return Math.floor(row / BOX) * BOX + Math.floor(col / BOX);
}

function popcount(mask: number): number {
  let count = 0;
  while (mask) {
    mask &= mask - 1;
    count++;
  }
  return count;
}

// Tracks which digits are already used per row/column/box as 9-bit masks so
// candidate lookup is O(1) instead of rescanning 27 cells per empty square.
class Constraints {
  rowMask = new Array(SIZE).fill(0);
  colMask = new Array(SIZE).fill(0);
  boxMask = new Array(SIZE).fill(0);

  constructor(grid: Grid) {
    for (let i = 0; i < 81; i++) {
      const val = grid[i];
      if (val === 0) continue;
      const row = Math.floor(i / SIZE);
      const col = i % SIZE;
      const bit = 1 << (val - 1);
      this.rowMask[row] |= bit;
      this.colMask[col] |= bit;
      this.boxMask[boxOf(row, col)] |= bit;
    }
  }

  candidates(row: number, col: number): number {
    return FULL_MASK & ~(this.rowMask[row] | this.colMask[col] | this.boxMask[boxOf(row, col)]);
  }

  place(row: number, col: number, bit: number): void {
    this.rowMask[row] |= bit;
    this.colMask[col] |= bit;
    this.boxMask[boxOf(row, col)] |= bit;
  }

  remove(row: number, col: number, bit: number): void {
    this.rowMask[row] &= ~bit;
    this.colMask[col] &= ~bit;
    this.boxMask[boxOf(row, col)] &= ~bit;
  }
}

// Minimum-remaining-values: scan empty cells and return the one with the
// fewest legal digits (that's the cell most worth branching on first). A
// cell with zero candidates is an immediate dead end, reported via count -1
// so the caller can bail out without finishing the scan.
function findMrvCell(grid: Grid, constraints: Constraints): { idx: number; candidates: number } | null {
  let bestIdx = -1;
  let bestCandidates = 0;
  let bestCount = 10;

  for (let idx = 0; idx < 81; idx++) {
    if (grid[idx] !== 0) continue;
    const row = Math.floor(idx / SIZE);
    const col = idx % SIZE;
    const candidates = constraints.candidates(row, col);
    const count = popcount(candidates);
    if (count === 0) return { idx: -2, candidates: 0 }; // dead end sentinel
    if (count < bestCount) {
      bestCount = count;
      bestIdx = idx;
      bestCandidates = candidates;
      if (count === 1) break;
    }
  }

  return bestIdx === -1 ? null : { idx: bestIdx, candidates: bestCandidates };
}

export function generateSolvedGrid(): Grid {
  const grid: Grid = new Array(81).fill(0);
  const constraints = new Constraints(grid);

  function fill(): boolean {
    const cell = findMrvCell(grid, constraints);
    if (cell === null) return true; // no empty cells left: solved
    if (cell.idx === -2) return false; // a cell has no legal digit: dead end

    const { idx, candidates } = cell;
    const row = Math.floor(idx / SIZE);
    const col = idx % SIZE;
    const digits: number[] = [];
    for (let d = 1; d <= 9; d++) {
      if (candidates & (1 << (d - 1))) digits.push(d);
    }

    for (const d of shuffle(digits)) {
      const bit = 1 << (d - 1);
      grid[idx] = d;
      constraints.place(row, col, bit);
      if (fill()) return true;
      grid[idx] = 0;
      constraints.remove(row, col, bit);
    }
    return false;
  }

  fill();
  return grid;
}

// Counts solutions up to `cap`, stopping early once reached. This is the
// function that has to prove a dug-out puzzle still has exactly one
// solution, so it dominates generation time - the MRV heuristic keeps its
// search tree small even once most of the board is empty.
function countSolutions(grid: Grid, cap: number): number {
  const constraints = new Constraints(grid);
  let count = 0;

  function backtrack(): boolean {
    const cell = findMrvCell(grid, constraints);
    if (cell === null) {
      count++;
      return count >= cap;
    }
    if (cell.idx === -2) return false;

    const { idx, candidates } = cell;
    const row = Math.floor(idx / SIZE);
    const col = idx % SIZE;

    for (let d = 1; d <= 9; d++) {
      const bit = 1 << (d - 1);
      if (!(candidates & bit)) continue;
      grid[idx] = d;
      constraints.place(row, col, bit);
      const stop = backtrack();
      grid[idx] = 0;
      constraints.remove(row, col, bit);
      if (stop) return true;
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
