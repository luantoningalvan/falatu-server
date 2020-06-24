export abstract class Notification {
  public subject: string;
  public templatePath: string;
  public greeting: string;
  public action?: string;

  constructor(
    subject: string,
    greeting: string,
    templatePath: string,
    action?: string
  ) {
    this.subject = subject;
    this.greeting = greeting;
    this.templatePath = templatePath;
    this.action = action || '';
  }

  /**
   * @deprecated since June 23, 2020 when Pug templates were added
   */
  public getContent(): string {
    return '';
  }
}
