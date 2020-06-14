import { Service, Container } from 'typedi';
import { UserRepository } from '../repositories/User.repository';
import { sign } from 'jsonwebtoken';
import { UnauthorizedError } from 'routing-controllers';

@Service()
export class AuthService {
  private readonly repo: UserRepository;

  constructor() {
    this.repo = Container.get(UserRepository);
  }

  public async checkLogin(email: string, password: string) {
    const user = await this.repo.findWithPassword({ email });
    if (user) {
      // Check if password does match
      const passMatch = await user.verifyPassword(password);
      if (passMatch) {
        const token = sign(
          { id: user._id, username: user.username },
          process.env.JWT_SECRET
        );
        return { user: user.username, token };
      }
    }
    throw new UnauthorizedError('Invalid credentials provided.');
  }
}
