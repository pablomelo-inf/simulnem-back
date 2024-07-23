import { Alternative } from './Alternative';

export type QuestionWithAnswers = {
  questionid: string;
  number: string;
  source_font: string;
  header_question: string;
  statement_question: string;
  alternative: Alternative[];
};
