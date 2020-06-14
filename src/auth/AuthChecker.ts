import { Action } from 'routing-controllers';
import { getEntityManager } from './EntityManager';
import { User } from '../models/User.model';

export const AuthChecker = async (action: Action) => {
  // Get token from the request headers
  const token = action.request.headers['authorization'];
  if (!token) return false;

  // Check for existing user for preventing falsy auth requests
  const user = await getEntityManager(User).findOneByToken(token as string);

  // If user exists, pass
  if (user) return true;
  // If not, deny access
  return false;
};
