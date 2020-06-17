import { DocumentType } from '@typegoose/typegoose';
import { ObjectId } from 'mongodb';
import { Question } from '../../models/Question.model';
import { User } from '../../models/User.model';

export function withoutUser(
  input: DocumentType<Question>[],
  user: DocumentType<User>
) {
  const result = input.filter((question) => {
    return (
      (question.user as ObjectId).toHexString() !==
      (user._id as ObjectId).toHexString()
    );
  });

  return result;
}
