import { RawResult } from '../../infrastructure/database/QuestionRepository';
import { ResponseUser } from '../entities/ResponseUser';
 

export interface IQuestionRepository {
  getQuestionsByYear(year: string, qtde_questions: string): Promise<RawResult[]>;
  create(data: ResponseUser): Promise<boolean>;
 
}
