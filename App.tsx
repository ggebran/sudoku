import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Board from './components/Board';
import DifficultyMenu from './components/DifficultyMenu';
import NumberPad from './components/NumberPad';
import { Difficulty, Grid, countDigits, findConflicts, generatePuzzle, isBoardComplete } from './lib/sudoku';

type Phase = 'menu' | 'playing';

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
  const [phase, setPhase] = useState<Phase>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [game, setGame] = useState<ReturnType<typeof newGame> | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [won, setWon] = useState(false);
  const [paused, setPaused] = useState(false);

  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 24, 396);

  const conflicts = useMemo(() => (game ? findConflicts(game.board) : new Set<number>()), [game]);
  const complete = useMemo(() => (game ? isBoardComplete(game.board) : false), [game]);
  const completedDigits = useMemo(() => {
    if (!game) return new Set<number>();
    const counts = countDigits(game.board);
    const done = new Set<number>();
    for (let d = 1; d <= 9; d++) {
      if (counts[d] >= 9) done.add(d);
    }
    return done;
  }, [game]);

  useEffect(() => {
    if (complete && conflicts.size === 0) {
      setWon(true);
    }
  }, [complete, conflicts]);

  useEffect(() => {
    if (phase !== 'playing' || won || paused) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [phase, won, paused]);

  const selectDifficulty = useCallback((d: Difficulty) => {
    setDifficulty(d);
    setGame(newGame(d));
    setSelectedIndex(null);
    setSeconds(0);
    setWon(false);
    setPaused(false);
    setPhase('playing');
  }, []);

  const goToMenu = useCallback(() => {
    setPhase('menu');
    setPaused(false);
  }, []);

  const handleSelect = useCallback(
    (idx: number) => {
      if (!game || paused) return;
      setSelectedIndex(idx);
    },
    [game, paused]
  );

  const clueSelected = !!game && selectedIndex !== null && game.initial[selectedIndex];

  const handleNumberPress = useCallback(
    (n: number) => {
      if (selectedIndex === null || won || paused) return;
      setGame((g) => {
        if (!g || g.initial[selectedIndex]) return g;
        const board: Grid = g.board.slice();
        board[selectedIndex] = n;
        return { ...g, board };
      });
    },
    [selectedIndex, won, paused]
  );

  const handleErase = useCallback(() => {
    if (selectedIndex === null || won || paused) return;
    setGame((g) => {
      if (!g || g.initial[selectedIndex]) return g;
      const board: Grid = g.board.slice();
      board[selectedIndex] = 0;
      return { ...g, board };
    });
  }, [selectedIndex, won, paused]);

  const togglePause = useCallback(() => {
    if (won) return;
    setPaused((p) => !p);
  }, [won]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Text style={styles.title}>Sudoku</Text>

        {phase === 'menu' || !game ? (
          <DifficultyMenu width={contentWidth} onSelect={selectDifficulty} />
        ) : (
          <>
            <View style={[styles.statusRow, { width: contentWidth }]}>
              <View style={styles.timerRow}>
                <Text style={styles.timer}>{formatTime(seconds)}</Text>
                <Pressable
                  onPress={togglePause}
                  disabled={won}
                  style={[styles.pauseButton, won && styles.pauseButtonDisabled]}
                >
                  <Text style={styles.pauseText}>{paused ? '▶' : '⏸'}</Text>
                </Pressable>
              </View>
              <Text style={styles.difficultyLabel}>
                {difficulty[0].toUpperCase() + difficulty.slice(1)}
              </Text>
              <Pressable onPress={goToMenu} style={styles.menuButton}>
                <Text style={styles.menuButtonText}>Menu</Text>
              </Pressable>
            </View>

            <View>
              <Board
                board={game.board}
                initial={game.initial}
                conflicts={conflicts}
                selectedIndex={selectedIndex}
                onSelect={handleSelect}
              />
              {paused && (
                <Pressable style={styles.pauseOverlay} onPress={togglePause}>
                  <Text style={styles.pauseOverlayText}>Paused</Text>
                  <Text style={styles.pauseOverlaySubtext}>Tap to resume</Text>
                </Pressable>
              )}
            </View>

            <NumberPad
              onNumberPress={handleNumberPress}
              onErase={handleErase}
              disabled={won || paused || clueSelected}
              completedDigits={completedDigits}
            />
          </>
        )}

        <Modal visible={won} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>You won! 🎉</Text>
              <Text style={styles.modalSubtitle}>
                {difficulty[0].toUpperCase() + difficulty.slice(1)} · {formatTime(seconds)}
              </Text>
              <Pressable style={styles.modalButton} onPress={() => selectDifficulty(difficulty)}>
                <Text style={styles.modalButtonText}>Play Again</Text>
              </Pressable>
              <Pressable style={styles.modalLinkButton} onPress={goToMenu}>
                <Text style={styles.modalLinkText}>Change Difficulty</Text>
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timer: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
    fontVariant: ['tabular-nums'],
  },
  pauseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseButtonDisabled: {
    opacity: 0.4,
  },
  pauseText: {
    fontSize: 14,
    color: '#1a1a2e',
  },
  difficultyLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#868e96',
    textTransform: 'uppercase',
  },
  pauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248,249,250,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1a1a2e',
  },
  pauseOverlayText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 6,
  },
  pauseOverlaySubtext: {
    fontSize: 14,
    color: '#495057',
  },
  menuButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#3b5bdb',
  },
  menuButtonText: {
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
  modalLinkButton: {
    marginTop: 14,
    paddingVertical: 6,
  },
  modalLinkText: {
    color: '#868e96',
    fontWeight: '600',
    fontSize: 13,
  },
});
