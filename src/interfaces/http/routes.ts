import { Router } from 'express';
import { QuestionController } from './controllers/questionController';
import { QuestionService } from '../../application/services/questionService';
import { QuestionRepository } from '../../infrastructure/database/QuestionRepository';
import { UserController } from './controllers/userController';
import { UserRepository } from '../../infrastructure/database/UserRepository';
import { UserService } from '../../application/services/userService';

const router = Router();

const questionRepository = new QuestionRepository();
const questionService = new QuestionService(questionRepository);
const questionController = new QuestionController(questionService);

const userRepository = new UserRepository();  
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.get('/questions', (req, res) => questionController.getQuestions(req, res));
router.post('/questions', (req, res) => questionController.createQuestionResponseUser(req, res));


router.post('/user', (req, res) => userController.createUser(req, res));


export default router;
