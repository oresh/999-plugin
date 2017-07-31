"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Locale = (function () {
    function Locale(language) {
        if (language === void 0) { language = 'ru'; }
        this.vocabulary = {};
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
