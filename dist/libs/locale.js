"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dictionary_ru = require("../dictionaries/ru.dict.json");
var dictionary_ro = require("../dictionaries/ro.dict.json");
var Locale = (function () {
    function Locale(language) {
        if (language === void 0) { language = 'ru'; }
        this.vocabulary = {};
        this.setVocabulary('ru', dictionary_ru);
        this.setVocabulary('ro', dictionary_ro);
    }
    Locale.prototype.setVocabulary = function (language, vocabulary) {
        this.vocabulary[language] = vocabulary;
    };
    Locale.prototype.translate = function (word) {
        return this.vocabulary[this.language][word] || word;
    };
    return Locale;
}());
exports.Locale = Locale;
