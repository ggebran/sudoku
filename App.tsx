import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Board from './components/Board';
import NumberPad from './components/NumberPad';
import {
  Difficulty,
  Grid,
  findConflicts,
  generatePuzzle,
  isBoardComplete,
} from './lib/sudoku';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function newGame(difficulty: Difficulty) {
  const { puzzle, solution } = generatePuzzle(difficulty);
  return {
    board: puzzle.slice(),
    solution,
    initial: puzzle.map((v) => v !== 0),
  };
}

export default function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [game, setGame] = useState(() => newGame('easy'));
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [won, setWon] = useState(false);

  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 24, 396);

  const conflicts = useMemo(() => findConflicts(game.board), [game.board]);
  const complete = useMemo(() => isBoardComplete(game.board), [game.board]);

  useEffect(() => {
    if (complete && conflicts.size === 0) {
      setWon(true);
    }
  }, [complete, conflicts]);

  useEffect(() => {
    if (won) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [won]);

  const startNewGame = useCallback((d: Difficulty) => {
    setDifficulty(d);
    setGame(newGame(d));
    setSelectedIndex(null);
    setSeconds(0);
    setWon(false);
  }, []);

  const handleSelect = useCallback(
    (idx: number) => {
      if (game.initial[idx]) return;
      setSelectedIndex(idx);
    },
    [game.initial]
  );

  const handleNumberPress = useCallback(
    (n: number) => {
      if (selectedIndex === null || won) return;
      setGame((g) => {
        const board: Grid = g.board.slice();
        board[selectedIndex] = n;
        return { ...g, board };
      });
    },
    [selectedIndex, won]
  );

  const handleErase = useCallback(() => {
    if (selectedIndex === null || won) return;
    setGame((g) => {
      const board: Grid = g.board.slice();
      board[selectedIndex] = 0;
      return { ...g, board };
    });
  }, [selectedIndex, won]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Text style={styles.title}>Sudoku</Text>

      <View style={styles.difficultyRow}>
        {DIFFICULTIES.map((d) => (
          <Pressable
            key={d}
            onPress={() => startNewGame(d)}
            style={[styles.difficultyChip, difficulty === d && styles.difficultyChipActive]}
          >
            <Text
              style={[
                styles.difficultyText,
                difficulty === d && styles.difficultyTextActive,
              ]}
            >
              {d[0].toUpperCase() + d.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={[styles.statusRow, { width: contentWidth }]}>
        <Text style={styles.timer}>{formatTime(seconds)}</Text>
        <Pressable onPress={() => startNewGame(difficulty)} style={styles.newGameButton}>
          <Text style={styles.newGameText}>New Game</Text>
        </Pressable>
      </View>

      <Board
        board={game.board}
        initial={game.initial}
        conflicts={conflicts}
        selectedIndex={selectedIndex}
        onSelect={handleSelect}
      />

      <NumberPad onNumberPress={handleNumberPress} onErase={handleErase} disabled={won} />

      <Modal visible={won} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>You won! 🎉</Text>
            <Text style={styles.modalSubtitle}>
              {difficulty[0].toUpperCase() + difficulty.slice(1)} · {formatTime(seconds)}
            </Text>
            <Pressable style={styles.modalButton} onPress={() => startNewGame(difficulty)}>
              <Text style={styles.modalButtonText}>Play Again</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <StatusBar style="auto" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    paddingTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  difficultyChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
  },
  difficultyChipActive: {
    backgroundColor: '#1a1a2e',
  },
  difficultyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
  },
  difficultyTextActive: {
    color: '#fff',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timer: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
    fontVariant: ['tabular-nums'],
  },
  newGameButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#3b5bdb',
  },
  newGameText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    minWidth: 240,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    color: '#1a1a2e',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#3b5bdb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
