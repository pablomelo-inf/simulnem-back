import { Request, Response } from 'express';
import { UserService } from '../../../application/services/userService';

export class UserController {
  constructor(private userService: UserService) {}
  
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const{
        clerkId,
        email,
        userName,
        firstName,
        lastName,
        photo
      } = req.body;

      await this.userService.createUser({
        clerkId,
        email,
        userName,
        firstName,
        lastName,
        photo      
      });

      res.status(201).json({"response": 'ok'});
      
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar a pergunta' });
    }
  }
}
