import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Difficulty } from '../lib/sudoku';

const OPTIONS: { value: Difficulty; label: string; blurb: string }[] = [
  { value: 'easy', label: 'Easy', blurb: '40 clues · relaxed' },
  { value: 'medium', label: 'Medium', blurb: '33 clues · a bit of bite' },
  { value: 'hard', label: 'Hard', blurb: '27 clues · think it through' },
  { value: 'expert', label: 'Expert', blurb: '~25 clues · brutal' },
];

type ActiveGame = {
  label: string;
  timeLabel: string;
};

type Props = {
  width: number;
  onSelect: (difficulty: Difficulty) => void;
  activeGame?: ActiveGame | null;
  onContinue?: () => void;
};

export default function DifficultyMenu({ width, onSelect, activeGame, onContinue }: Props) {
  return (
    <View style={[styles.container, { width }]}>
      {activeGame && (
        <>
          <Pressable style={styles.continueCard} onPress={onContinue}>
            <View style={styles.continueIconWrap}>
              <Text style={styles.continueIcon}>▶</Text>
            </View>
            <View style={styles.continueTextWrap}>
              <Text style={styles.continueTitle}>Continue Game</Text>
              <Text style={styles.continueSubtitle}>
                {activeGame.label} · {activeGame.timeLabel}
              </Text>
            </View>
          </Pressable>
          <Text style={styles.divider}>or start something new</Text>
        </>
      )}

      <Text style={styles.heading}>Choose a difficulty</Text>
      <Text style={styles.subheading}>
        {activeGame
          ? 'Picking one replaces your current game.'
          : 'The board appears and the clock starts the moment you pick.'}
      </Text>
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
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b5bdb',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  continueIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  continueIcon: {
    color: '#fff',
    fontSize: 16,
  },
  continueTextWrap: {
    flex: 1,
  },
  continueTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  continueSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 1,
  },
  divider: {
    textAlign: 'center',
    color: '#adb5bd',
    fontSize: 12,
    marginBottom: 18,
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
