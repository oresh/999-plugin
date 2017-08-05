import * as dictionary_ru from '../dictionaries/ru.dict.json';
import * as dictionary_ro from '../dictionaries/ro.dict.json';

type Vocabulary = {[key: string]: string};

type I18NVocabulary = {[key: string]: Vocabulary}

export class Locale {
  private vocabulary: I18NVocabulary;
  public language: keyof I18NVocabulary;

  constructor(language: keyof I18NVocabulary = 'ru') {
    this.vocabulary = {};
    this.setVocabulary('ru', dictionary_ru);
    this.setVocabulary('ro', dictionary_ro);
  }

  setVocabulary(language: keyof I18NVocabulary, vocabulary: Vocabulary) : void {
    this.vocabulary[language] = vocabulary;
  }

  translate(word: string): string {
    return this.vocabulary[this.language][word] || word;
  }
}