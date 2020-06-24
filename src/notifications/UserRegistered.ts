import { Notification } from './Notification';
import { resolve } from 'path';

export class UserRegistered extends Notification {
  constructor(name: string) {
    super(
      'Boas-vindas ao FalaTu',
      name,
      resolve(__dirname, '..', 'resources', 'emails', 'welcome')
    );
  }

  /**
   * @deprecated
   */
  public getContent() {
    return `
      Olá, ${this.greeting}!
      Boas-vindas ao FalaTu.

      Prontx para começar a responder perguntas e fazer as suas?
      Se ainda não fez o download do app, entre na sua loja de
      aplicativos e nos ache por lá! 
      
      Estamos te esperando ansiosamente.

      Equipe FalaTu
    `;
  }
}
