import React from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { Grid } from '../lib/sudoku';

const SIZE = 9;

type Props = {
  board: Grid;
  initial: boolean[];
  conflicts: Set<number>;
  selectedIndex: number | null;
  onSelect: (idx: number) => void;
};

export default function Board({ board, initial, conflicts, selectedIndex, onSelect }: Props) {
  const { width } = useWindowDimensions();
  // Integer cell size keeps 9 cells fitting exactly inside the board on any density.
  const cellSize = Math.floor(Math.min(width - 24, 396) / SIZE);

  const selectedRow = selectedIndex !== null ? Math.floor(selectedIndex / SIZE) : null;
  const selectedCol = selectedIndex !== null ? selectedIndex % SIZE : null;
  const selectedVal = selectedIndex !== null ? board[selectedIndex] : 0;

  return (
    <View style={styles.board}>
      {Array.from({ length: SIZE }, (_, row) => (
        <View key={row} style={styles.row}>
          {Array.from({ length: SIZE }, (_, col) => {
            const idx = row * SIZE + col;
            const val = board[idx];
            const isClue = initial[idx];
            const isSelected = idx === selectedIndex;
            const isPeer =
              selectedIndex !== null &&
              !isSelected &&
              (row === selectedRow ||
                col === selectedCol ||
                (Math.floor(row / 3) === Math.floor((selectedRow as number) / 3) &&
                  Math.floor(col / 3) === Math.floor((selectedCol as number) / 3)));
            const isSameValue = val !== 0 && val === selectedVal && !isSelected;
            const isConflict = conflicts.has(idx);

            return (
              <Pressable
                key={col}
                onPress={() => onSelect(idx)}
                style={[
                  styles.cell,
                  {
                    width: cellSize,
                    height: cellSize,
                    borderRightWidth: col === SIZE - 1 ? 0 : (col + 1) % 3 === 0 ? 2 : StyleSheet.hairlineWidth,
                    borderBottomWidth: row === SIZE - 1 ? 0 : (row + 1) % 3 === 0 ? 2 : StyleSheet.hairlineWidth,
                  },
                  isPeer && styles.peerCell,
                  isSameValue && styles.sameValueCell,
                  isSelected && styles.selectedCell,
                ]}
              >
                <Text
                  style={[
                    styles.cellText,
                    { fontSize: Math.round(cellSize * 0.5) },
                    isClue ? styles.clueText : styles.userText,
                    isConflict && styles.conflictText,
                  ]}
                >
                  {val !== 0 ? String(val) : ''}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    borderWidth: 2,
    borderColor: '#1a1a2e',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#1a1a2e',
  },
  peerCell: {
    backgroundColor: '#eef2ff',
  },
  sameValueCell: {
    backgroundColor: '#dbe4ff',
  },
  selectedCell: {
    backgroundColor: '#a5b4fc',
  },
  cellText: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  clueText: {
    fontWeight: '700',
    color: '#1a1a2e',
  },
  userText: {
    fontWeight: '400',
    color: '#3b5bdb',
  },
  conflictText: {
    color: '#e03131',
  },
});
