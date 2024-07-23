import { Request, Response } from 'express';
import { QuestionService } from '../../../application/services/questionService';

export class QuestionController {
  constructor(private questionService: QuestionService) {}

  async getQuestions(req: Request, res: Response): Promise<void> {
    try {
      const yearEnem = req.query.enem;
      const qtde_questions = req.query.qtde_questions;

      if (!yearEnem) {
        res.status(400).send({ error: "Year 'enem' query parameter is required" });
        return;
      }
      const questionsWithAnswers = await this.questionService.getQuestionsByYear(yearEnem as string, qtde_questions as string);

      res.send({      
        questions: questionsWithAnswers
      });
      
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  }

  async createQuestionResponseUser(req: Request, res: Response): Promise<void> {
    try {
      const{userId,  questionId, alternativeId,  response} = req.body;
      await this.questionService.createQuestionResponseUser({userId,  questionId, alternativeId,  response});
      res.status(201).json({"response": 'ok'});
      
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar a pergunta' });
    }
  }
}
