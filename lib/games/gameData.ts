// Game vocabulary and data

export interface VocabularyItem {
  letter: string
  word: string
  emoji: string
}

export interface SentenceItem {
  text: string
  correct: string
  wrongs: string[]
  emoji: string
  trans: Record<string, string>
}

export const VOCABULARY: VocabularyItem[] = [
  { letter: 'A', word: 'Apple', emoji: '🍎' },
  { letter: 'A', word: 'Ant', emoji: '🐜' },
  { letter: 'A', word: 'Airplane', emoji: '✈️' },
  { letter: 'B', word: 'Bear', emoji: '🐻' },
  { letter: 'B', word: 'Banana', emoji: '🍌' },
  { letter: 'B', word: 'Ball', emoji: '🏀' },
  { letter: 'C', word: 'Cat', emoji: '🐱' },
  { letter: 'C', word: 'Car', emoji: '🚗' },
  { letter: 'C', word: 'Cow', emoji: '🐄' },
  { letter: 'D', word: 'Dog', emoji: '🐶' },
  { letter: 'D', word: 'Duck', emoji: '🦆' },
  { letter: 'D', word: 'Dolphin', emoji: '🐬' },
  { letter: 'E', word: 'Elephant', emoji: '🐘' },
  { letter: 'E', word: 'Egg', emoji: '🥚' },
  { letter: 'F', word: 'Frog', emoji: '🐸' },
  { letter: 'F', word: 'Fish', emoji: '🐟' },
  { letter: 'G', word: 'Goat', emoji: '🐐' },
  { letter: 'G', word: 'Ghost', emoji: '👻' },
  { letter: 'H', word: 'Hat', emoji: '🎩' },
  { letter: 'H', word: 'Horse', emoji: '🐴' },
  { letter: 'I', word: 'Ice', emoji: '🧊' },
  { letter: 'I', word: 'Iguana', emoji: '🦎' },
  { letter: 'J', word: 'Juice', emoji: '🧃' },
  { letter: 'J', word: 'Jacket', emoji: '🧥' },
  { letter: 'K', word: 'Kangaroo', emoji: '🦘' },
  { letter: 'K', word: 'Key', emoji: '🔑' },
  { letter: 'L', word: 'Lion', emoji: '🦁' },
  { letter: 'L', word: 'Lemon', emoji: '🍋' },
  { letter: 'M', word: 'Monkey', emoji: '🐵' },
  { letter: 'M', word: 'Mouse', emoji: '🐭' },
  { letter: 'N', word: 'Nest', emoji: '🪹' },
  { letter: 'N', word: 'Nose', emoji: '👃' },
  { letter: 'O', word: 'Octopus', emoji: '🐙' },
  { letter: 'O', word: 'Orange', emoji: '🍊' },
  { letter: 'P', word: 'Pig', emoji: '🐷' },
  { letter: 'P', word: 'Pizza', emoji: '🍕' },
  { letter: 'Q', word: 'Queen', emoji: '👸' },
  { letter: 'Q', word: 'Quiet', emoji: '🤫' },
  { letter: 'R', word: 'Rabbit', emoji: '🐰' },
  { letter: 'R', word: 'Rocket', emoji: '🚀' },
  { letter: 'S', word: 'Sun', emoji: '☀️' },
  { letter: 'S', word: 'Star', emoji: '⭐' },
  { letter: 'T', word: 'Tiger', emoji: '🐯' },
  { letter: 'T', word: 'Turtle', emoji: '🐢' },
  { letter: 'U', word: 'Umbrella', emoji: '☂️' },
  { letter: 'U', word: 'Unicorn', emoji: '🦄' },
  { letter: 'V', word: 'Violin', emoji: '🎻' },
  { letter: 'V', word: 'Van', emoji: '🚐' },
  { letter: 'W', word: 'Watermelon', emoji: '🍉' },
  { letter: 'W', word: 'Whale', emoji: '🐳' },
  { letter: 'X', word: 'Xylophone', emoji: '🪗' },
  { letter: 'X', word: 'X-ray', emoji: '🩻' },
  { letter: 'Y', word: 'Yellow', emoji: '🟨' },
  { letter: 'Y', word: 'Yoyo', emoji: '🪀' },
  { letter: 'Z', word: 'Zebra', emoji: '🦓' },
  { letter: 'Z', word: 'Zombie', emoji: '🧟' },
]

export const SENTENCES: SentenceItem[] = [
  {
    text: 'The ___ is red.',
    correct: 'Apple',
    wrongs: ['Banana', 'Cat', 'Sun'],
    emoji: '🍎',
    trans: { The: 'ה...', is: 'הינו/היא', red: 'אדום' },
  },
  {
    text: 'A ___ can bark.',
    correct: 'Dog',
    wrongs: ['Fish', 'Car', 'Tree'],
    emoji: '🐶',
    trans: { A: '...', can: 'יכול', bark: 'לנבוח' },
  },
  {
    text: 'I drive a ___.',
    correct: 'Car',
    wrongs: ['Apple', 'Dog', 'Sun'],
    emoji: '🚗',
    trans: { I: 'אני', drive: 'נוהג ב...' },
  },
  {
    text: 'The ___ is hot.',
    correct: 'Sun',
    wrongs: ['Ice', 'Pig', 'Moon'],
    emoji: '☀️',
    trans: { The: 'ה...', is: 'הוא', hot: 'חם' },
  },
  {
    text: 'A ___ says meow.',
    correct: 'Cat',
    wrongs: ['Cow', 'Dog', 'Bird'],
    emoji: '🐱',
    trans: { A: '...', says: 'אומר/ת', meow: 'מיאו' },
  },
  {
    text: 'Monkeys love to eat ___.',
    correct: 'Banana',
    wrongs: ['Pizza', 'Car', 'Hat'],
    emoji: '🍌',
    trans: { Monkeys: 'קופים', love: 'אוהבים', 'to eat': 'לאכול' },
  },
  {
    text: 'I wear a ___ on my head.',
    correct: 'Hat',
    wrongs: ['Shoe', 'Dog', 'Fish'],
    emoji: '🎩',
    trans: { I: 'אני', wear: 'חובש/לובש', 'on my head': 'על הראש שלי' },
  },
  {
    text: 'A ___ swims in the water.',
    correct: 'Fish',
    wrongs: ['Bird', 'Cat', 'Car'],
    emoji: '🐟',
    trans: { swims: 'שוחה', 'in the water': 'במים' },
  },
  {
    text: 'I open the door with a ___.',
    correct: 'Key',
    wrongs: ['Ball', 'Apple', 'Hat'],
    emoji: '🔑',
    trans: { open: 'פותח', 'the door': 'את הדלת', with: 'בעזרת/עם' },
  },
  {
    text: 'The ___ gives us milk.',
    correct: 'Cow',
    wrongs: ['Dog', 'Lion', 'Fish'],
    emoji: '🐄',
    trans: { gives: 'נותנת', us: 'לנו', milk: 'חלב' },
  },
]

export const GAMES = [
  { id: 'letters', name: '🅰️ משחק אותיות', description: 'הקשיבו לאות ובחרו אותה' },
  { id: 'sounds', name: '🍎 צליל פותח', description: 'בחרו את אות ההתחלה' },
  { id: 'missing', name: '🧩 השלם מילה', description: 'מצאו את האות החסרה' },
  { id: 'elimination', name: '🧹 משחק הניפוי', description: 'זרקו את האותיות השגויות' },
  { id: 'sentences', name: '📝 השלם משפט PRO', description: 'תרגום ➔ השלמה ➔ דיבור!' },
  { id: 'speaking', name: '🎤 אתגר הדיבור', description: 'דברו את המילה באנגלית' },
  { id: 'memory', name: '🧠 זיכרון (2 שחקנים)', description: 'משחק זיכרון תחרותי' },
]

// Utility functions
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function getRandomItems<T>(array: T[], count: number): T[] {
  return shuffleArray(array).slice(0, count)
}

export function getRandomWrongLetters(correctLetter: string, count: number): string[] {
  const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  const wrongLetters = allLetters.filter(l => l !== correctLetter)
  return getRandomItems(wrongLetters, count)
}

export function extractWordsFromSentence(sentence: string): string[] {
  return sentence
    .replace('___', '')
    .split(/\s+/)
    .filter(w => w.length > 0)
}
