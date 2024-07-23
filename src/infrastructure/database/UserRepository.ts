import prisma from './prismaClient';
import { IQuestionRepository } from '../../domain/repositories/IQuestionRepository';
import { Prisma } from '@prisma/client';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

export class UserRepository implements IUserRepository {


  async create(data: User): Promise<boolean> { 
   
    console.log(data);
      try {
         await prisma.user.create({
            data: {
              clerkId: data.clerkId,
              email: data.email,
              userName: data.userName,
              firstName: data.firstName,
              lastName: data.lastName,
              photo: data.photo,
              phone: ""
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



