import { raw } from '@prisma/client/runtime/library';
import { QuestionWithAnswers } from '../../domain/entities/Question';
import { IQuestionRepository } from '../../domain/repositories/IQuestionRepository';
import { RawResult } from '../../infrastructure/database/QuestionRepository';
import { ResponseUser } from '../../domain/entities/ResponseUser';


export class QuestionService {
  constructor(private questionRepository: IQuestionRepository) {}

  async getQuestionsByYear(year: string, qtde_questions: any): Promise<QuestionWithAnswers[]> {
    const rawResults = await this.questionRepository.getQuestionsByYear(year, qtde_questions);  

    const groupByIndex  = (array: RawResult[], chave: keyof RawResult) => {
        return array.reduce((accumulator: Record<string, QuestionWithAnswers>, item) => {

          const key = item[chave] as string;

          const {
            questionid,
            number,
            source_font,
            header_question,
            statement_question,
            answer_text,
            option,
            correct,
            response_detail,
            alternativeid
          } = item;         
          
          if(!accumulator[key]){
            console.log(`${questionid}) ${key}`);
            
            accumulator[key]={
              questionid,
              number,
              source_font,
              header_question,
              statement_question,
              alternative: []
            };

          }
          
          accumulator[key].alternative.push({
            alternativeid,
            text: answer_text,
            option,
            correct,
            response_detail
          }); 
          
          return accumulator;

        }, {} as Record<string, QuestionWithAnswers>);
    };
    
    const questionWithAnswers = groupByIndex(rawResults, 'questionid');
    return Object.values(questionWithAnswers);

  }

  async createQuestionResponseUser(questionData: ResponseUser): Promise<boolean> {
    return this.questionRepository.create(questionData);

  }
}
