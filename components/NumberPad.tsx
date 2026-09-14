import React from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

type Props = {
  onNumberPress: (n: number) => void;
  onErase: () => void;
  disabled?: boolean;
  completedDigits?: Set<number>;
};

export default function NumberPad({ onNumberPress, onErase, disabled, completedDigits }: Props) {
  const { width } = useWindowDimensions();
  const padWidth = Math.min(width - 24, 396);
  const gap = 6;
  const keyWidth = Math.floor((padWidth - gap * 8) / 9);

  return (
    <View style={[styles.container, { width: padWidth }]}>
      <View style={[styles.row, { gap }]}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
          const isDisabled = disabled || !!completedDigits?.has(n);
          return (
            <Pressable
              key={n}
              style={[styles.key, { width: keyWidth }, isDisabled && styles.keyDisabled]}
              onPress={() => onNumberPress(n)}
              disabled={isDisabled}
            >
              <Text style={styles.keyText}>{n}</Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        style={[styles.eraseKey, disabled && styles.keyDisabled]}
        onPress={onErase}
        disabled={disabled}
      >
        <Text style={styles.eraseText}>⌫  Erase</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  key: {
    height: 52,
    borderRadius: 8,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyDisabled: {
    opacity: 0.4,
  },
  keyText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  eraseKey: {
    marginTop: 10,
    paddingHorizontal: 28,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#495057',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eraseText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
