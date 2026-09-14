import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Difficulty, Grid } from './sudoku';

const SAVE_KEY = 'sudoku:save:v1';

export type SavedGame = {
  difficulty: Difficulty;
  board: Grid;
  solution: Grid;
  initial: boolean[];
  selectedIndex: number | null;
  seconds: number;
};

// Best-effort persistence: a failed read/write should never crash the game,
// worst case you just lose the resume point.

export async function saveGame(state: SavedGame): Promise<void> {
  try {
    await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export async function loadGame(): Promise<SavedGame | null> {
  try {
    const raw = await AsyncStorage.getItem(SAVE_KEY);
    return raw ? (JSON.parse(raw) as SavedGame) : null;
  } catch {
    return null;
  }
}

export async function clearSavedGame(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SAVE_KEY);
  } catch {
    // ignore
  }
}
