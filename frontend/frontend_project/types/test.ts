import { UUID } from "crypto"

export type Test = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  duration: number;
};

export type Questions = {
    question_text: string
    options: string[]
    correct_answers: number[]
    question_type: 'multiple_choice' | 'single_choice'
}

export type QuestionWithRelations = Questions & {
  test?: Test;
};

export type Create_test = {
    title: string;
    description?: string;
    duration: number;
    questions: Create_question[];
}

export type Create_question = {
    question_text: string;
    options: string[];
    correct_answers: number[];
    question_type?: 'multiple_choice' | 'single_choice';
}