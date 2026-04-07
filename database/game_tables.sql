-- Game Sessions Table - tracks each game instance
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL, -- 'letters', 'sounds', 'missing', 'elimination', 'speaking', 'sentences', 'memory'
  difficulty TEXT DEFAULT 'normal', -- 'easy', 'normal', 'hard'
  score INT DEFAULT 0,
  correct_answers INT DEFAULT 0,
  incorrect_answers INT DEFAULT 0,
  streak INT DEFAULT 0,
  duration_seconds INT, -- duration of game in seconds
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game Scores Table - stores individual round/question scores for analysis
CREATE TABLE IF NOT EXISTS public.game_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  round_number INT,
  question_text TEXT, -- the word/letter/sentence presented
  user_answer TEXT, -- what the user answered
  is_correct BOOLEAN DEFAULT FALSE,
  points_earned INT DEFAULT 0,
  response_time_ms INT, -- milliseconds to respond
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policy for game_sessions: Users can only see their own sessions
CREATE POLICY game_sessions_user_policy ON public.game_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY game_sessions_insert_policy ON public.game_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY game_sessions_update_policy ON public.game_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy for game_scores: Users can only see their own scores
CREATE POLICY game_scores_user_policy ON public.game_scores
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY game_scores_insert_policy ON public.game_scores
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS game_sessions_user_id ON public.game_sessions(user_id);
CREATE INDEX IF NOT EXISTS game_sessions_profile_id ON public.game_sessions(profile_id);
CREATE INDEX IF NOT EXISTS game_sessions_game_type ON public.game_sessions(game_type);
CREATE INDEX IF NOT EXISTS game_sessions_created_at ON public.game_sessions(created_at);

CREATE INDEX IF NOT EXISTS game_scores_session_id ON public.game_scores(session_id);
CREATE INDEX IF NOT EXISTS game_scores_user_id ON public.game_scores(user_id);
CREATE INDEX IF NOT EXISTS game_scores_game_type ON public.game_scores(game_type);
