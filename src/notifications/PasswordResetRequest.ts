import { Notification } from './Notification';

export class PasswordResetRequest extends Notification {
  constructor(greeting: string, token: string) {
    super('Recuperação de senha do FalaTu', greeting, 'password', token);
  }

  /**
   * @deprecated
   */
  public getContent() {
    return `
      Olá, ${this.greeting}!

      Recebemos uma solicitação para recuperação de senha
      vinda da sua conta do FalaTu.

      Seu token de recuperação é ${this.action}.

      Se não foi você quem fez esse pedido, basta
      ignorar que ele expira em 24 horas. 
      
      Sua conta está segura :)

      Equipe FalaTu
    `;
  }
}
