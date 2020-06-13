import { Service, Inject } from 'typedi';
import { UserRepository } from '../repositories/User.repository';
import { sign } from 'jsonwebtoken';

@Service()
export class AuthService {
  @Inject(() => UserRepository)
  private readonly repo: UserRepository;

  public async checkLogin(email: string, password: string) {
    const user = await this.repo.findOne({ email });
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
    return { error: 'Invalid credentials provided.' };
  }
}
