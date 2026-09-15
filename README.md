# Sudoku

A Sudoku game built with Expo and React Native, running on iOS, Android, and web from a single TypeScript codebase.

## Features

- Four difficulty levels (Easy, Medium, Hard, Expert), each targeting a specific clue count
- Puzzle generator that guarantees a unique solution, built on a backtracking solver with an MRV (minimum-remaining-values) heuristic and bitmask constraint tracking for speed
- Conflict highlighting for cells that break row/column/box rules
- Given clues are locked; only cells you fill in are editable
- Timer with pause/resume, and a pause overlay that hides the board
- Number pad keys grey out once a digit has been fully placed
- In-progress games are saved automatically and restored (paused) the next time the app opens
- Leaving to the difficulty menu doesn't discard your game — resume it from the "Continue" option

## Getting started

Requires Node.js. The Expo CLI is pulled in automatically via `npx`.

```bash
npm install
npm start
```

This opens the Expo dev tools. From there, run on a specific platform:

```bash
npm run ios      # iOS simulator
npm run android  # Android emulator/device
npm run web      # Browser
```

## Building a standalone Android APK

The project includes an EAS Build configuration (`eas.json`) for producing a sideloadable Android APK:

```bash
eas build --platform android
```

See Expo's [EAS Build docs](https://docs.expo.dev/build/introduction/) for initial setup.

## Tech stack

- [Expo](https://expo.dev/) / React Native
- TypeScript
- `@react-native-async-storage/async-storage` for save-game persistence

## License

MIT — see [LICENSE](LICENSE).
