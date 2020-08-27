export abstract class Notification {
  public subject: string;
  public templateName: string;
  public greeting: string;
  public action?: string;

  constructor(
    subject: string,
    greeting: string,
    templateName: string,
    action?: string
  ) {
    this.subject = subject;
    this.greeting = greeting;
    this.templateName = templateName;
    this.action = action || '';
  }

  /**
   * @deprecated since June 23, 2020 when Pug templates were added
   */
  public getContent(): string {
    return '';
  }
}
