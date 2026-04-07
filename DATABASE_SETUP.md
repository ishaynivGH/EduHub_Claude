# LSIeduHub - Database Setup Guide

## Overview
This guide will help you set up the game tracking database tables in Supabase.

## Step 1: Create Tables in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Navigate to your project
3. Go to **SQL Editor**
4. Create a new query
5. Copy and paste the SQL from `database/game_tables.sql`
6. Click **Run**

The SQL creates two tables:
- **game_sessions** - Tracks each game played by a user
- **game_scores** - Records individual question/round scores

### Tables Schema

#### game_sessions
```
id (UUID) - Primary key
user_id (UUID) - Link to auth.users
profile_id (UUID) - Link to profiles
game_type (TEXT) - 'letters', 'sounds', 'missing', 'elimination', 'speaking', 'sentences', 'memory'
difficulty (TEXT) - 'easy', 'normal', 'hard'
score (INT) - Final score
correct_answers (INT) - Number of correct answers
incorrect_answers (INT) - Number of incorrect answers
streak (INT) - Longest consecutive correct answers
duration_seconds (INT) - How long the game took
started_at (TIMESTAMP) - When game started
completed_at (TIMESTAMP) - When game completed
created_at, updated_at (TIMESTAMP) - Metadata
```

#### game_scores
```
id (UUID) - Primary key
session_id (UUID) - Link to game_sessions
user_id (UUID) - Link to auth.users
profile_id (UUID) - Link to profiles
game_type (TEXT) - Game type
round_number (INT) - Which question/round
question_text (TEXT) - The question/word presented
user_answer (TEXT) - What user answered
is_correct (BOOLEAN) - Whether answer was correct
points_earned (INT) - Points for this answer
response_time_ms (INT) - Milliseconds to answer
created_at (TIMESTAMP) - When recorded
```

## Step 2: Update profiles Table

Add this column to the `profiles` table if it doesn't exist:

```sql
ALTER TABLE public.profiles
ADD COLUMN games_played INT DEFAULT 0;
```

This tracks how many games each profile has completed.

## Step 3: Verify Row Level Security (RLS)

The SQL file includes RLS policies that ensure:
- Users can only see their own game data
- Users can only insert/update their own records

To verify RLS is enabled:
1. Go to **Table Editor** in Supabase
2. Click on `game_sessions` table
3. Check **RLS is on** toggle (should be enabled)
4. Repeat for `game_scores` table

## API Endpoints

Once the tables are created, the following API endpoints are available:

### Start Game Session
```
POST /api/games/session/start
Body: {
  gameType: string,
  profileId: string,
  difficulty?: string (default: 'normal')
}
Response: { sessionId, message }
```

### Complete Game Session
```
POST /api/games/session/complete
Body: {
  sessionId: string,
  score: number,
  correctAnswers: number,
  incorrectAnswers: number,
  streak: number
}
Response: { sessionId, score, durationSeconds }
```

### Record Game Score
```
POST /api/games/score/record
Body: {
  sessionId: string,
  profileId: string,
  gameType: string,
  roundNumber: number,
  questionText: string,
  userAnswer: string,
  isCorrect: boolean,
  pointsEarned: number,
  responseTimeMs?: number
}
Response: { scoreId }
```

### Get Game History
```
GET /api/games/history?profileId=<id>&gameType=<type>&limit=50&offset=0
Response: { sessions, pagination }
```

### Get Game Statistics
```
GET /api/games/stats?profileId=<id>
Response: { stats: { totalGames, averageScore, gameTypeStats, ... } }
```

## Integration with Games

All game components automatically:
1. ✅ Create a game session when game starts
2. ✅ Save game completion when game ends
3. ✅ Track scores and progress

The game page (`/games/[gameType]`) handles:
- Profile selection
- Game session creation
- Game completion tracking
- Navigation with profile ID in URL

## Dashboard Integration

Next, the dashboard will be updated to show:
- Recent games
- Game statistics
- Progress charts
- Best scores per game type

## Testing the Setup

1. Start a game from the games page
2. Complete the game
3. Check Supabase to verify data is saved:
   - Go to **Table Editor**
   - Click on `game_sessions` table
   - You should see a new row with your game data

## Troubleshooting

**"Unauthorized" error when starting game:**
- Make sure you're logged in
- Check that `user_id` in game_sessions matches current user

**"Profile not found" error:**
- Verify profile exists and belongs to current user
- Check profileId in URL query parameter

**No data appearing in tables:**
- Check RLS policies are correctly set
- Verify you're logged in as the same user who played the game
- Check browser console for API errors

## Next Steps

1. ✅ Database tables created
2. ✅ API routes created
3. ✅ Games integrated with API
4. ⏳ Dashboard enhancement (showing game history and stats)
5. ⏳ Achievements system
6. ⏳ Leaderboards
