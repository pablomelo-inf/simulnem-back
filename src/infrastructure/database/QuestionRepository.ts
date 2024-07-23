import prisma from './prismaClient';
import { IQuestionRepository } from '../../domain/repositories/IQuestionRepository';
import { Prisma } from '@prisma/client';
import { ResponseUser } from '../../domain/entities/ResponseUser';
 

export type RawResult = {
  questionid: string;
  number: string;
  source_font: string;
  header_question: string;
  statement_question: string;
  answer_text: string;
  option: string;
  correct: boolean;
  response_detail: string;
  alternativeid: string;
};

export class QuestionRepository implements IQuestionRepository {
  async getQuestionsByYear(year: string, qtde_questions: string): Promise<RawResult[]> {


    const limit = parseInt(qtde_questions) * 5;

    // Check if limit is a valid number
    if (isNaN(limit)) {
      throw new Error('Invalid limit: must be a number');
    }
    console.log(limit)


    const query = Prisma.sql`
      SELECT
        q.id AS questionid, q.number, q.source_font,
        q.header_question, q.statement_question, 
        a.text AS answer_text, a.option, a.correct, a.id alternativeid,
        a.response_detail
      FROM exam.question q 
      JOIN exam.alternative a ON a."questionId" = q.id 
      WHERE q.year = ${year}
      ORDER BY q.number, a.option
      LIMIT ${limit}`;

    return prisma.$queryRaw<RawResult[]>(query);
  }

  async create(data: ResponseUser): Promise<boolean> { 
    console.log(data);
      try {
         await prisma.response_user.create({
            data: {
              response: data.response,
              questionId: data.questionId,
              userId: data.userId,              
              alternativeId: data.alternativeId
          }
        });
        
        return true;
      } catch (e) {       
      
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          // The .code property can be accessed in a type-safe manner
          console.log('CODIGO ERROR: ',e.code);

          if (e.code === 'P2002') {
            console.log(
              'There is a unique constraint violation, a new user cannot be created with this email'
            )
            throw new Error('' + e.message);

          }
        }

        throw e;
      }
      return false;
  }
}



