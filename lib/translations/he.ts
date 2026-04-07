// Hebrew translations for the app
export const hebrewTranslations = {
  // Game names
  gameNames: {
    letters: 'אותיות',
    sounds: 'צלילים',
    missing: 'השלמת מילה',
    elimination: 'ניפוי',
    sentences: 'משפטים',
    speaking: 'דיבור',
    memory: 'זיכרון',
  },

  // Game UI
  gameUI: {
    listen: 'מאזינים...',
    speak: 'דברו עכשיו',
    correct: 'כן! נכון!',
    incorrect: 'טעות',
    tryAgain: 'נסו שוב',
    nextQuestion: 'שאלה הבאה',
    skip: 'דלג',
    finish: 'סיום',
  },

  // Dashboard
  dashboard: {
    statistics: 'סטטיסטיקה כללית',
    recentHistory: 'היסטוריה אחרונה',
    totalGames: 'סה״כ משחקים',
    totalScore: 'ניקוד כולל',
    bestScore: 'הניקוד הגבוה',
    accuracy: 'דיוק כללי',
    performanceByGame: 'ביצוע לפי משחק',
    noGamesPlayed: 'לא שיחקתם עדיין משחקים',
    average: 'ממוצע',
    highest: 'הגבוה',
    timeTotal: 'זמן כולל',
    results: 'תוצאות',
  },

  // Streaks and stats
  stats: {
    streak: 'רצף',
    currentStreak: 'רצף נוכחי',
    longestStreak: 'הרצף הארוך ביותר',
    correctAnswers: 'תשובות נכונות',
    incorrectAnswers: 'תשובות שגויות',
    accuracy: 'דיוק',
    completedAt: 'הושלם ב',
    duration: 'משך זמן',
  },

  // Game completion
  gameCompletion: {
    congratulations: 'מזל טוב!',
    gameCompleted: 'סיימתם את המשחק',
    finalScore: 'הניקוד הסופי שלכם',
    backToMenu: 'חזור לתפריט המשחקים',
    playAgain: 'שחקו שוב',
  },

  // Feedback messages
  feedback: {
    correct: (word: string) => `✅ כן! ${word} נכון!`,
    incorrect: (word: string) => `❌ טעות! ${word} אינו נכון`,
    tryAgain: '❌ נסו שוב',
    bonusQuestion: 'שאלת בונוס',
    bonusIncorrect: '❌ טעות בשאלת הבונוס',
  },

  // Profile and user
  profile: {
    selectProfile: 'בחרו פרופיל',
    yourStudentProfiles: 'פרופילי התלמידים שלכם',
    gamesPlayed: 'משחקים שהושמעו',
    playGames: 'שחקו משחקים',
    addNewProfile: 'הוסיפו פרופיל חדש',
    studentName: 'שם התלמיד',
    age: 'גיל',
    gradeLevel: 'רמת כיתה',
  },

  // Sentences game
  sentencesGame: {
    matchTranslations: 'התאימו תרגומים',
    englishWord: 'מילה באנגלית',
    hebrewTranslation: 'תרגום בעברית',
    selectEnglish: 'בחרו מילה באנגלית',
    completeSentence: 'השלימו משפט',
    speakSentence: 'דברו את המשפט',
  },
}
