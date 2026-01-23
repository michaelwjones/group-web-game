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
        question: 'What is the chemical symbol for gold?',
        options: ['Go', 'Gd', 'Au', 'Ag'],
        correctIndex: 2,
        category: 'Science',
        difficulty: 'medium'
    },
    {
        id: 'q2',
        question: 'In what year did World War II end?',
        options: ['1943', '1944', '1945', '1946'],
        correctIndex: 2,
        category: 'History',
        difficulty: 'medium'
    },
    {
        id: 'q3',
        question: 'What is the smallest country in the world?',
        options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'],
        correctIndex: 1,
        category: 'Geography',
        difficulty: 'medium'
    },
    {
        id: 'q4',
        question: 'What is the speed of light in vacuum (approximately)?',
        options: ['300,000 km/s', '150,000 km/s', '500,000 km/s', '1,000,000 km/s'],
        correctIndex: 0,
        category: 'Science',
        difficulty: 'hard'
    },
    {
        id: 'q5',
        question: 'Which element has the highest melting point?',
        options: ['Iron', 'Tungsten', 'Platinum', 'Titanium'],
        correctIndex: 1,
        category: 'Science',
        difficulty: 'hard'
    },
    {
        id: 'q6',
        question: 'What is the longest river in Asia?',
        options: ['Mekong', 'Ganges', 'Yangtze', 'Yellow River'],
        correctIndex: 2,
        category: 'Geography',
        difficulty: 'medium'
    },
    {
        id: 'q7',
        question: 'Who discovered penicillin?',
        options: ['Louis Pasteur', 'Alexander Fleming', 'Joseph Lister', 'Robert Koch'],
        correctIndex: 1,
        category: 'Science',
        difficulty: 'medium'
    },
    {
        id: 'q8',
        question: 'In what year was the Berlin Wall torn down?',
        options: ['1987', '1988', '1989', '1990'],
        correctIndex: 2,
        category: 'History',
        difficulty: 'medium'
    },
    {
        id: 'q9',
        question: 'What is the capital of Kazakhstan?',
        options: ['Almaty', 'Astana', 'Bishkek', 'Tashkent'],
        correctIndex: 1,
        category: 'Geography',
        difficulty: 'hard'
    },
    {
        id: 'q10',
        question: 'Which composer wrote "The Four Seasons"?',
        options: ['Bach', 'Mozart', 'Vivaldi', 'Beethoven'],
        correctIndex: 2,
        category: 'Art',
        difficulty: 'medium'
    },
    {
        id: 'q11',
        question: 'What is the Pythagorean theorem formula?',
        options: ['a + b = c', 'a² + b² = c²', 'a × b = c²', '2a + 2b = c'],
        correctIndex: 1,
        category: 'Science',
        difficulty: 'medium'
    },
    {
        id: 'q12',
        question: 'Which ancient wonder was located in Alexandria?',
        options: ['Colossus', 'Hanging Gardens', 'Lighthouse', 'Mausoleum'],
        correctIndex: 2,
        category: 'History',
        difficulty: 'hard'
    },
    {
        id: 'q13',
        question: 'What is the deepest point in the ocean called?',
        options: ['Mariana Trench', 'Puerto Rico Trench', 'Java Trench', 'Philippine Trench'],
        correctIndex: 0,
        category: 'Geography',
        difficulty: 'medium'
    },
    {
        id: 'q14',
        question: 'Who wrote "One Hundred Years of Solitude"?',
        options: ['Pablo Neruda', 'Jorge Luis Borges', 'Gabriel García Márquez', 'Mario Vargas Llosa'],
        correctIndex: 2,
        category: 'Literature',
        difficulty: 'hard'
    },
    {
        id: 'q15',
        question: 'What is the atomic number of carbon?',
        options: ['4', '6', '8', '12'],
        correctIndex: 1,
        category: 'Science',
        difficulty: 'medium'
    },
    {
        id: 'q16',
        question: 'Which treaty ended World War I?',
        options: ['Treaty of Paris', 'Treaty of Versailles', 'Treaty of Ghent', 'Treaty of Tordesillas'],
        correctIndex: 1,
        category: 'History',
        difficulty: 'medium'
    },
    {
        id: 'q17',
        question: 'What is the largest desert in the world?',
        options: ['Sahara', 'Arabian', 'Gobi', 'Antarctic'],
        correctIndex: 3,
        category: 'Geography',
        difficulty: 'hard'
    },
    {
        id: 'q18',
        question: 'Who painted "The Starry Night"?',
        options: ['Claude Monet', 'Vincent van Gogh', 'Pablo Picasso', 'Salvador Dalí'],
        correctIndex: 1,
        category: 'Art',
        difficulty: 'medium'
    },
    {
        id: 'q19',
        question: 'What is the half-life of Carbon-14 (approximately)?',
        options: ['1,000 years', '5,730 years', '10,000 years', '50,000 years'],
        correctIndex: 1,
        category: 'Science',
        difficulty: 'hard'
    },
    {
        id: 'q20',
        question: 'Which empire was ruled by Cyrus the Great?',
        options: ['Roman Empire', 'Ottoman Empire', 'Persian Empire', 'Byzantine Empire'],
        correctIndex: 2,
        category: 'History',
        difficulty: 'hard'
    },
    {
        id: 'q21',
        question: 'What is the currency of Switzerland?',
        options: ['Euro', 'Swiss Franc', 'Swiss Mark', 'Swiss Pound'],
        correctIndex: 1,
        category: 'Geography',
        difficulty: 'medium'
    },
    {
        id: 'q22',
        question: 'Who wrote "Crime and Punishment"?',
        options: ['Leo Tolstoy', 'Fyodor Dostoevsky', 'Anton Chekhov', 'Ivan Turgenev'],
        correctIndex: 1,
        category: 'Literature',
        difficulty: 'medium'
    },
    {
        id: 'q23',
        question: 'What is the most abundant gas in Earth\'s atmosphere?',
        options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'],
        correctIndex: 2,
        category: 'Science',
        difficulty: 'medium'
    },
    {
        id: 'q24',
        question: 'In which year did the French Revolution begin?',
        options: ['1776', '1789', '1799', '1804'],
        correctIndex: 1,
        category: 'History',
        difficulty: 'hard'
    }
];

export function getRandomQuestions(count: number): TriviaQuestion[] {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}
