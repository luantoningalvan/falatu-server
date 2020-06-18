// Options for the CryptoClass::generate method
interface GenerateOptions {
  alpha?: boolean;
  numbers?: boolean;
  scores?: boolean;
  special?: boolean;
  length?: number;
}

class CryptoClass {
  private static _instance: CryptoClass;

  protected readonly alpha: string;
  protected readonly numbers: string;
  protected readonly scores: string;
  protected readonly special: string;

  protected defaultOptions: GenerateOptions;

  private constructor() {
    this.alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    this.numbers = '0123456789';
    this.scores = '-_';
    this.special = ',.;:#*?=)(/&%$!{}[]|@';
    this.defaultOptions = {
      alpha: true,
      numbers: true,
      scores: false,
      special: false,
      length: 24,
    };
  }

  public static Instance() {
    return this._instance || (this._instance = new this());
  }

  private generate(opts: GenerateOptions = this.defaultOptions) {
    let c = '';
    let generated = '';

    for (const key in opts) {
      if (key !== 'length') {
        c += this[key];
      }
    }

    for (let i = 0; i < opts.length; i++) {
      const rand = Math.floor(Math.random() * c.length);
      generated += c.substring(rand, rand + 1);
    }

    return generated;
  }

  public token() {
    return this.generate({
      alpha: true,
      numbers: true,
      scores: true,
      length: 16,
    });
  }
}

export const Crypto = CryptoClass.Instance();
