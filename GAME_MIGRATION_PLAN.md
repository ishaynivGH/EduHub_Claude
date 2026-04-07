# Game Migration Plan - Week 4

## 🎮 All 7 Games to Migrate

### Game 1: Letters Game
- **Mechanics**: Listen to letter sound, click correct letter from options
- **Scoring**: +1 point per correct answer
- **Win Condition**: 5 consecutive correct answers trigger bonus round
- **Lose Condition**: Game continues indefinitely (no lose condition)
- **Options**: 4 random letters (1 correct + 3 wrong)
- **Audio**: Letter pronunciation using Web Speech API
- **Progression**: Cycles through all 26 letters with associated words
- **Data Source**: vocabulary array (A-Z with words and emojis)

### Game 2: Sounds Game
- **Mechanics**: Listen to word sound, click first letter of word
- **Scoring**: +1 point per correct answer
- **Win Condition**: 5 consecutive correct answers trigger bonus round
- **Lose Condition**: Game continues indefinitely
- **Options**: 4 random letters (1 correct + 3 wrong)
- **Audio**: Word pronunciation
- **Progression**: Same vocabulary as Letters game
- **Data Source**: vocabulary array

### Game 3: Missing Letter Game
- **Mechanics**: See word with missing letter (___), click correct letter
- **Scoring**: +1 point per correct answer
- **Win Condition**: 5 consecutive correct answers trigger bonus round
- **Lose Condition**: Game continues indefinitely
- **Options**: Letters shown in UPPERCASE
- **Display**: Shows word with blank (e.g., "A_ple")
- **Audio**: Play word sound before showing question
- **Progression**: Random vocabulary items
- **Data Source**: vocabulary array

### Game 4: Elimination Game
- **Mechanics**: 13 letter options appear, click/drag to remove wrong letters, keep 1 correct
- **Scoring**: +1 point per correct answer (when only correct letter remains)
- **Win Condition**: Eliminates all 12 wrong options, leaves 1 correct
- **Lose Condition**: Player throws away the correct letter
- **Options**: 13 letters total (1 correct + 12 wrong)
- **Display**: Letters in grid/scattered layout
- **Feedback**: "מעולה! נשארה רק האות הנכונה! 🎉" when correct letter remains
- **Audio**: Play letter sound
- **Progression**: Cycles through vocabulary
- **Data Source**: vocabulary array

### Game 5: Sentences Game (Advanced)
- **Mechanics**: 3-phase game combining multiple tasks
- **Phase 1: Translation Matching**
  - Show English sentence with Hebrew translations below
  - Player matches English words to Hebrew translations
  - Example: "The ___ is red." with translation pairs
- **Phase 2: Sentence Completion**
  - Show sentence with blank: "The ___ is red."
  - Click correct word to fill blank
  - Wrong word options provided
- **Phase 3: Speaking**
  - Speak the completed sentence
  - Voice recognition checks if spoken correctly
- **Scoring**: +1 point per correct answer per phase
- **Win Condition**: Complete all 3 phases for a sentence
- **Lose Condition**: Game continues (wrong answers allow retry)
- **Data Source**: sentenceBank array (10 sentences)

### Game 6: Speaking Game
- **Mechanics**: Listen to word, speak it aloud, system recognizes speech
- **Scoring**: +1 point per correct pronunciation
- **Win Condition**: 5 consecutive correct answers trigger bonus round
- **Lose Condition**: 3 failed speech attempts
- **Speech Recognition**: Uses Web Speech API (English US)
- **Retries**: Up to 2 retries if no speech detected
- **Timeout**: 6 seconds to speak
- **Audio Feedback**: Different sounds for correct/incorrect
- **Progression**: Random vocabulary
- **Data Source**: vocabulary array

### Game 7: Memory Game (2-Player)
- **Mechanics**: Competitive memory card matching game
- **Players**: 2 players alternate turns
- **Scoring**: Tracks individual player scores
- **Grid Size**: 4x5 = 20 cards (10 matching pairs)
- **Win Condition**: Player with most matches when all pairs found
- **Lose Condition**: N/A (game always completes)
- **Matching**: Click 2 cards, if they match (word + emoji), collect them
- **Display**: Player scores shown as "Player 1: 5" vs "Player 2: 4"
- **Progression**: Uses vocabulary pairs (word + emoji)
- **Data Source**: vocabulary array

### Bonus Round
- **Trigger**: After 5 consecutive correct answers in Letters, Sounds, Missing, Speaking
- **Mechanics**: Bonus question with image/emoji
- **Scoring**: +5 bonus points if correct
- **Display**: "⭐ שאלת בונוס! ⭐" (Hebrew text)
- **Content**: Special vocabulary with visual clues

---

## 📊 Scoring & Progression Summary

| Game | Points/Answer | Correct Streak | Bonus | Max Score |
|------|---|---|---|---|
| Letters | 1 | 5 = Bonus | +5 | ∞ |
| Sounds | 1 | 5 = Bonus | +5 | ∞ |
| Missing Letter | 1 | 5 = Bonus | +5 | ∞ |
| Elimination | 1 | None | None | ∞ |
| Sentences | 1/phase | None | None | ∞ |
| Speaking | 1 | 5 = Bonus | +5 | ∞ |
| Memory | Varies | N/A | None | 10 |

---

## 🗄️ Database Schema

### Games Table
```
id: UUID (primary key)
profile_id: UUID (foreign key to profiles)
game_type: VARCHAR (letters, sounds, missing, elimination, sentences, speaking, memory)
score: INTEGER
correct_answers: INTEGER
incorrect_answers: INTEGER
completion_time: INTEGER (seconds)
bonus_points: INTEGER
started_at: TIMESTAMP
completed_at: TIMESTAMP
status: VARCHAR (in_progress, completed, abandoned)
game_data: JSON (game-specific data)
```

### Example Game Data (JSON)
```json
{
  "gameType": "letters",
  "questionsAsked": 15,
  "correctAnswers": 12,
  "streak": 3,
  "bonusRoundsTriggered": 2,
  "averageResponseTime": 2.5
}
```

---

## 🎯 Implementation Strategy

### Phase 1: Game Components (Tonight)
1. Create base game component structure
2. Build individual game components:
   - `<LettersGame />`
   - `<SoundsGame />`
   - `<MissingLetterGame />`
   - `<EliminationGame />`
   - `<SentencesGame />`
   - `<SpeakingGame />`
   - `<MemoryGame />`
   - `<BonusRound />`
3. Create game selection page
4. Set up state management (Zustand)

### Phase 2: Backend Integration
1. Create `games` database table
2. Create API routes for game progress
3. Connect games to user profiles
4. Add progress tracking

### Phase 3: Polish & Testing
1. Add animations
2. Sound effects
3. Mobile responsiveness
4. Performance optimization

---

## 📁 File Structure

```
app/
├── games/
│   ├── page.tsx (Game selection menu)
│   ├── [gameType]/
│   │   └── page.tsx (Individual game page)
│   └── components/
│       ├── LettersGame.tsx
│       ├── SoundsGame.tsx
│       ├── MissingLetterGame.tsx
│       ├── EliminationGame.tsx
│       ├── SentencesGame.tsx
│       ├── SpeakingGame.tsx
│       ├── MemoryGame.tsx
│       ├── BonusRound.tsx
│       └── GameHeader.tsx (Shared UI)
│
lib/
├── games/
│   ├── gameData.ts (Vocabulary, sentences)
│   ├── gameLogic.ts (Scoring, logic)
│   ├── gameService.ts (API calls)
│   └── gameSounds.ts (Audio utilities)
│
api/
└── games/
    ├── create/route.ts
    ├── progress/route.ts
    └── complete/route.ts
```

---

## 🔊 Audio Features

- **Text-to-Speech**: Web Speech API (English US)
- **Speech Recognition**: Web Speech API (Speaking game)
- **Sound Effects**: Correct/wrong/bonus sounds
- **Voice Selection**: Auto-selects best available English voice

---

## 🎨 UI Components Needed

1. **Game Header**: Score, back button, timer
2. **Question Display**: Letter/word/image display
3. **Options Grid**: Multiple choice buttons
4. **Feedback Area**: Correct/incorrect messages
5. **Score Board**: Current score, progress
6. **Game Over Screen**: Final score, replay option
7. **2-Player Score Board**: For memory game

---

## ⚡ Performance Considerations

- Pre-shuffle vocabulary array
- Cache vocabulary data
- Optimize speech synthesis
- Lazy load game components
- Memoize expensive calculations

---

## 🚀 Tonight's Goals

- [ ] Create all 7 game components
- [ ] Build game selection page
- [ ] Implement state management
- [ ] Connect to database (basic)
- [ ] Deploy to Vercel
- [ ] Test each game thoroughly

---

**Status**: Ready to begin implementation
