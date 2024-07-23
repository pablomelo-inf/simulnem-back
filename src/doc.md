
# Clean Architecture for Express and Prisma Application

This document describes how to organize an Express application using Clean Architecture principles.

## Project Structure

```
src/
|-- application/
|   |-- services/
|       |-- questionService.ts
|-- domain/
|   |-- entities/
|       |-- Question.ts
|       |-- Alternative.ts
|   |-- repositories/
|       |-- IQuestionRepository.ts
|-- infrastructure/
|   |-- database/
|       |-- prismaClient.ts
|       |-- QuestionRepository.ts
|-- interfaces/
|   |-- http/
|       |-- routes.ts
|       |-- controllers/
|           |-- questionController.ts
|-- app.ts
```

## Files Details

### `src/domain/entities/Alternative.ts`

```typescript
export type Alternative = {
  text: string;
  option: string;
  correct: boolean;
  response_detail: string;
};
```

### `src/domain/entities/Question.ts`

```typescript
import { Alternative } from './Alternative';

export type QuestionWithAnswers = {
  questionId: number;
  number: number;
  source_font: string;
  header_question: string;
  statement_question: string;
  answers: Alternative[];
};
```

### `src/domain/repositories/IQuestionRepository.ts`

```typescript
import { RawResult } from '../../infrastructure/database/QuestionRepository';

export interface IQuestionRepository {
  getQuestionsByYear(year: string): Promise<RawResult[]>;
}
```

### `src/infrastructure/database/prismaClient.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
```

### `src/infrastructure/database/QuestionRepository.ts`

```typescript
import prisma from './prismaClient';
import { IQuestionRepository } from '../../domain/repositories/IQuestionRepository';

export type RawResult = {
  questionId: number;
  number: number;
  source_font: string;
  header_question: string;
  statement_question: string;
  answer_text: string;
  option: string;
  correct: boolean;
  response_detail: string;
};

export class QuestionRepository implements IQuestionRepository {
  async getQuestionsByYear(year: string): Promise<RawResult[]> {
    const query = Prisma.sql`
      SELECT
        q.id AS questionId, q.number, q.source_font,
        q.header_question, q.statement_question, 
        a.text AS answer_text, a.option, a.correct, 
        a.response_detail
      FROM exam.question q 
      JOIN exam.alternative a ON a.questionId = q.id 
      WHERE q.year = ${year}
      ORDER BY q.number, a.option
      LIMIT 1`;

    return prisma.$queryRaw<RawResult[]>(query);
  }
}
```

### `src/application/services/questionService.ts`

```typescript
import { QuestionWithAnswers } from '../../domain/entities/Question';
import { IQuestionRepository } from '../../domain/repositories/IQuestionRepository';

export class QuestionService {
  constructor(private questionRepository: IQuestionRepository) {}

  async getQuestionsByYear(year: string): Promise<QuestionWithAnswers[]> {
    const rawResults = await this.questionRepository.getQuestionsByYear(year);

    return rawResults.reduce((questionsAcc, currentResult) => {
      const {
        questionId,
        number,
        source_font,
        header_question,
        statement_question,
        answer_text,
        option,
        correct,
        response_detail
      } = currentResult;

      let question = questionsAcc.find(q => q.questionId === questionId);

      if (!question) {
        question = {
          questionId,
          number,
          source_font,
          header_question,
          statement_question,
          answers: []
        };
        questionsAcc.push(question);
      }

      question.answers.push({
        text: answer_text,
        option,
        correct,
        response_detail
      });

      return questionsAcc;
    }, [] as QuestionWithAnswers[]);
  }
}
```

### `src/interfaces/http/controllers/questionController.ts`

```typescript
import { Request, Response } from 'express';
import { QuestionService } from '../../../application/services/questionService';

export class QuestionController {
  constructor(private questionService: QuestionService) {}

  async getQuestions(req: Request, res: Response): Promise<void> {
    try {
      const yearEnem = req.query.enem;

      if (!yearEnem) {
        res.status(400).send({ error: "Year 'enem' query parameter is required" });
        return;
      }

      const questionsWithAnswers = await this.questionService.getQuestionsByYear(yearEnem as string);

      res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); // Substitua com seu domínio de origem
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.send({
        id: "2342",
        topic: "elliot wave",
        questions: questionsWithAnswers
      });
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  }
}
```

### `src/interfaces/http/routes.ts`

```typescript
import { Router } from 'express';
import { QuestionController } from './controllers/questionController';
import { QuestionService } from '../../application/services/questionService';
import { QuestionRepository } from '../../infrastructure/database/QuestionRepository';

const router = Router();

const questionRepository = new QuestionRepository();
const questionService = new QuestionService(questionRepository);
const questionController = new QuestionController(questionService);

router.get('/questions', (req, res) => questionController.getQuestions(req, res));

export default router;
```

### `src/app.ts`

```typescript
import express from 'express';
import routes from './interfaces/http/routes';

const app = express();
const port = 3000;

app.use(express.json());
app.use('/api', routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
```

## Explanation

- **Entities**: Define the fundamental data structures (`Question` and `Alternative`).
- **Repositories**: Interface (`IQuestionRepository`) defines the contract, and the implementation (`QuestionRepository`) communicates with the database via Prisma.
- **Services**: Contains the application logic (`questionService.ts`).
- **Controllers**: Handle HTTP requests (`questionController.ts`).
- **Routes**: Define HTTP routes and map them to the controllers.
- **App**: Initializes the Express server and sets up middlewares and routes.

This structure provides clear separation of responsibilities, making the code modular, testable, and easy to maintain.
