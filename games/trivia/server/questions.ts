export interface TriviaQuestion {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

export const questions: TriviaQuestion[] = [
    {
        id: 'q1',
        question: 'What is the capital of France?',
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        correctIndex: 2,
        category: 'Geography',
        difficulty: 'easy'
    },
    {
        id: 'q2',
        question: 'Which planet is known as the Red Planet?',
        options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
        correctIndex: 1,
        category: 'Science',
        difficulty: 'easy'
    },
    {
        id: 'q3',
        question: 'Who painted the Mona Lisa?',
        options: ['Michelangelo', 'Raphael', 'Leonardo da Vinci', 'Donatello'],
        correctIndex: 2,
        category: 'Art',
        difficulty: 'easy'
    },
    {
        id: 'q4',
        question: 'What is the largest ocean on Earth?',
        options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
        correctIndex: 3,
        category: 'Geography',
        difficulty: 'easy'
    },
    {
        id: 'q5',
        question: 'How many continents are there?',
        options: ['5', '6', '7', '8'],
        correctIndex: 2,
        category: 'Geography',
        difficulty: 'easy'
    },
    {
        id: 'q6',
        question: 'What is the chemical symbol for gold?',
        options: ['Go', 'Gd', 'Au', 'Ag'],
        correctIndex: 2,
        category: 'Science',
        difficulty: 'medium'
    },
    {
        id: 'q7',
        question: 'In what year did World War II end?',
        options: ['1943', '1944', '1945', '1946'],
        correctIndex: 2,
        category: 'History',
        difficulty: 'medium'
    },
    {
        id: 'q8',
        question: 'What is the smallest country in the world?',
        options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'],
        correctIndex: 1,
        category: 'Geography',
        difficulty: 'medium'
    },
    {
        id: 'q9',
        question: 'Who wrote "Romeo and Juliet"?',
        options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
        correctIndex: 1,
        category: 'Literature',
        difficulty: 'easy'
    },
    {
        id: 'q10',
        question: 'What is the speed of light in vacuum (approximately)?',
        options: ['300,000 km/s', '150,000 km/s', '500,000 km/s', '1,000,000 km/s'],
        correctIndex: 0,
        category: 'Science',
        difficulty: 'hard'
    }
];

export function getRandomQuestions(count: number): TriviaQuestion[] {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}
