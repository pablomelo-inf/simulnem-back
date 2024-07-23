import express, { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import xml2js from 'xml2js';
import fs from 'fs';
import { exit } from 'process';

const app = express();
const port = 80;

const prisma = new PrismaClient({log: ['query', 'info', 'warn', 'error']})

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, world! oilllos');
});

interface Question { $: { id: any; }; header: any[]; statement: any[]; answers: { option: any; }[]; }[]

async function readAndParseXML(
  filePath: string,
  callback: (err: any, questions: Question | null) => void
): Promise<void> {

  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    const parser = new xml2js.Parser();

    parser.parseString(data, (err: any, result: any) => {
      if (err) {
        callback(err, null);
        return;
      }

      callback(null, result);
    });

    console.log('File read successfully');

  } catch (err) {
    console.error(err);
    callback(err, null);
  }
}

function removeTabs(strin: any): string {
  if (typeof strin === 'string')
    return strin//strin.replace(/\t/g, '').replace(/\n/g, '').replace(/\r/g, '')

  return '';
}



type Alternative = {
  correct: string;
  text: string;
  option: string;
  response_detail: string;
};

type QuestionData = {
  year: string;
  number: string;
  source_font: string;
  statement_question: string;
  header_question: string;
  alternatives: Alternative[];
};



function processQuestions(result: {
  prova: {
    $: any; question: any;
  };
}) {

  const questions = result.prova.question;


  questions.forEach(async (question: any) => {
    
    const questionAnswers = question.answers[0].option;

    let dataQuestions: QuestionData = {
      year: result.prova.$.year,
      number: removeTabs(question.$.id),
      source_font: "",
      statement_question: removeTabs(question.statement[0]),
      header_question: removeTabs(question.header[0]),
      alternatives: []
    };

    questionAnswers.forEach((answer: any) => {
      dataQuestions.alternatives.push({
        correct: answer.$.correct === 'Yes' ? "1" : "0",
        text: removeTabs(answer._),
        option: removeTabs(answer.$.id),
        response_detail: "Paris is the capital of France."
      });

    });
    await saveQuestion(dataQuestions);
  });

  
}

async function saveQuestion(
  questionData: {
    year: string,
    number: string,
    source_font: string,
    statement_question: string,
    header_question: string,
    alternatives:
    {
      correct: string,
      text: string,
      option: string,
      response_detail: string;
    }[]
  }
) {
  console.log(`Server is running at http://localhost:${port}`);

    try {
      const newQuestion = await prisma.question.create({
        data: {
          year: questionData.year,
          number: questionData.number,
          source_font: questionData.source_font,
          statement_question: questionData.statement_question,
          header_question: questionData.header_question,
        }
      })
      console.log('question_created:', newQuestion.id)

      let { id } = newQuestion
      
      
      await Promise.all(questionData.alternatives.map(async (data: any) => {
        const newAlternative = await prisma.alternative.create({
          data: {
            questionId: id,
            correct: data.correct,
            text: data.text,
            option: data.option,
            response_detail: data.option
          }
        });
        console.log('alternative_created:', newAlternative.id);
      }));
      
      
    } catch (er: any) {
      console.log(er.message);
     }
}



app.get('/readxml', (req: Request, res: Response) => {

  readAndParseXML(__dirname + '/2009-1.xml', (err: any, questions: any) => {

    if (err) {
      res.status(500).send('Erro ao processar o XML.');
      return;
    }

    processQuestions(questions);

    res.send('XML processado com sucesso.');
  });

})


app.get('/questions', async (req: Request, res: Response) => {
    const year_enem = req.query.enem

// Defina o tipo de uma alternativa
type Alternative = {
  text: string;
  option: string;
  correct: boolean;
  response_detail: string;
};

// Defina o tipo de uma questão com alternativas
type QuestionWithAnswers = {
  questionId: number;
  number: number;
  source_font: string;
  header_question: string;
  statement_question: string;
  answers: Alternative[];
};

// Defina o tipo do resultado bruto da consulta
type RawResult = {
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

//const year_enem = 2023; // Substitua com o ano desejado

const query = Prisma.sql`SELECT
                            q.number, q.source_font,
                            q.header_question,
                            q.statement_question, 
                            a."text" AS answer_text, a."option",
                            a.correct, 
                            a.response_detail,
                            a."questionId" 
                            FROM exam.question q 
                            JOIN exam.alternative a on a."questionId" = q.id 
                            WHERE q.year = ${year_enem}
                            ORDER BY q.number, a."option"
                            LIMIT 1`

const rawResults = await prisma.$queryRaw<RawResult[]>(query);

const questionsWithAnswers: QuestionWithAnswers[] = rawResults.reduce((acc, curr) => {
  const { questionId, number, source_font, header_question, statement_question, answer_text, option, correct, response_detail } = curr;

  // Encontre a questão no acumulador
  let question = acc.find(q => q.questionId === questionId);

  // Se a questão não existe no acumulador, crie uma nova
  if (!question) {
    question = {
      questionId,
      number,
      source_font,
      header_question,
      statement_question,
      answers: []
    };
    acc.push(question);
  }

  // Adicione a alternativa à questão
  question.answers.push({
    text: answer_text,
    option,
    correct,
    response_detail
  });

  return acc;
}, [] as QuestionWithAnswers[]);

//console.log(questionsWithAnswers);

console.log(questionsWithAnswers)

  // const query = Prisma.sql`SELECT
  //                           q.number, q.source_font,
  //                           q.header_question,
  //                           q.statement_question, 
  //                           a."text", a."option",
  //                           a.correct, 
  //                           a.response_detail,
  //                           a."questionId" 
  //                           FROM exam.question q 
  //                           JOIN exam.alternative a on a."questionId" = q.id 
  //                           WHERE q.year = ${year_enem}
  //                           ORDER BY a."questionId"`
  //                           const rawResults = await prisma.$queryRaw(query);

  //                           const questionsWithAnswers = rawResults.reduce((acc, curr) => {
  //                             const { questionId, number, source_font, header_question, statement_question, answer_text, option, correct, response_detail } = curr;
                              
  //                             if (!acc[questionId]) {
  //                               acc[questionId] = {
  //                                 questionId,
  //                                 number,
  //                                 source_font,
  //                                 header_question,
  //                                 statement_question,
  //                                 answers: []
  //                               };
  //                             }
                              
  //                             acc[questionId].answers.push({
  //                               text: answer_text,
  //                               option,
  //                               correct,
  //                               response_detail
  //                             });
                            
  //                             return acc;
  //                           }, {});
                            
  //                           const formattedResults = Object.values(questionsWithAnswers);
                            
  //                           console.log(formattedResults);

  /*const questionsWithAnswers = await prisma.question.findMany({
    where: {
      year: '2007',
    },
    include: {   
      
      alternative: {
        select: {
          text: true,
          option: true,
          correct: true,
          response_detail: true,
          questionId: true
        },
        orderBy: {
          questionId: 'asc'
        }
      }
    },
    take: 3 // Limiting to 3 results
  });*/

   // console.log(questionsWithAnswers)
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); // Substitua com seu domínio de origem
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.send({
      "id": "2342",
      "topic": "elliot wave",
      "questions":
      questionsWithAnswers
    });

})


app.listen(port, async () => {
  console.log(`Server is running at http://localhost:${port}`);
  
  try {
    // const newUser = await prisma.user.create({
    //   data: {
    //     name: 'Alice',
    //     email: 'alic@prismahp.ioo',
    //     password: '123',
    //     phone: '62986231272'
    //   },
    // })

    // let { id } = newUser
    //console.log('Created new user:', id)

  } catch (er: any) {
    console.log(er.message);
  }

  //const users = await prisma.user.findMany()
  //console.log('All users:', users)


});
