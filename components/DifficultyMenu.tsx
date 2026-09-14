import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Difficulty } from '../lib/sudoku';

const OPTIONS: { value: Difficulty; label: string; blurb: string }[] = [
  { value: 'easy', label: 'Easy', blurb: '40 clues · relaxed' },
  { value: 'medium', label: 'Medium', blurb: '33 clues · a bit of bite' },
  { value: 'hard', label: 'Hard', blurb: '27 clues · think it through' },
  { value: 'expert', label: 'Expert', blurb: '~25 clues · brutal' },
];

type Props = {
  width: number;
  onSelect: (difficulty: Difficulty) => void;
};

export default function DifficultyMenu({ width, onSelect }: Props) {
  return (
    <View style={[styles.container, { width }]}>
      <Text style={styles.heading}>Choose a difficulty</Text>
      <Text style={styles.subheading}>The board appears and the clock starts the moment you pick.</Text>
      {OPTIONS.map((opt) => (
        <Pressable key={opt.value} style={styles.card} onPress={() => onSelect(opt.value)}>
          <Text style={styles.cardLabel}>{opt.label}</Text>
          <Text style={styles.cardBlurb}>{opt.blurb}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 13,
    color: '#868e96',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  cardLabel: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardBlurb: {
    color: '#adb5bd',
    fontSize: 13,
  },
});
