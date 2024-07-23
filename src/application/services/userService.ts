import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';


export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async createUser(user: User): Promise<boolean> {
    return this.userRepository.create(user);

  }
}
