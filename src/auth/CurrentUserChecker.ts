import { Action, UnauthorizedError } from 'routing-controllers';
import { getEntityManager } from './EntityManager';
import { User } from '../models/User.model';

export const CurrentUserChecker = async (action: Action) => {
  // Get token from the request headers
  const token = action.request.headers['authorization'];
  if (!token) throw new UnauthorizedError('No access token provided.');
  // Check for existing user for preventing falsy auth requests
  const user = await getEntityManager(User).findOneByToken(token);
  if (!user) throw new UnauthorizedError('Access denied.');
  return user;
};
