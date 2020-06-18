export abstract class Notification {
  public subject: string;
  protected greeting: string;
  protected action?: string;

  constructor(subject: string, greeting: string, action?: string) {
    this.subject = subject;
    this.greeting = greeting;
    this.action = action || '';
  }

  public getContent(): string {
    return '';
  }
}
