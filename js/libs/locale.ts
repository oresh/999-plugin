type Vocabulary = {[key: string]: string};

type I18NVocabulary = {[key: string]: Vocabulary}

export class Locale {
  private vocabulary: I18NVocabulary;
  public language: keyof I18NVocabulary;

  constructor(language: keyof I18NVocabulary = 'ru') {
    this.vocabulary = {};
  }

  setVocabulary(language: keyof I18NVocabulary, vocabulary: Vocabulary) : void {
    this.vocabulary[language] = vocabulary;
  }

  translate(word: string): string {
    return this.vocabulary[this.language][word] || word;
  }
}