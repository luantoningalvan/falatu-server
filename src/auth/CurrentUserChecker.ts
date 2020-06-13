import { Action } from 'routing-controllers';
import { getEntityManager } from './EntityManager';
import { User } from '../models/User.model';

export const CurrentUserChecker = async (action: Action) => {
  // Get token from the request headers
  const token = action.request.headers['authorization'];
  // Check for existing user for preventing falsy auth requests
  const user = await getEntityManager(User).findOneByToken(token);
  return user;
};
