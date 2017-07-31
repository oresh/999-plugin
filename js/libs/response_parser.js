"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var reseller_1 = require("./reseller");
var ResponseParser = (function () {
    function ResponseParser(locale) {
        this.resellers = new reseller_1.Resellers();
        this.locale = locale;
    }
    ResponseParser.prototype.send_request = function (url, cb) {
        var self = this;
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                var resp_text = request.responseText;
                var resp = self._parse_response(resp_text);
                cb(resp);
            }
            else {
                cb(false);
            }
        };
        request.onerror = function () {
            cb(false);
        };
        request.send();
    };
    ResponseParser.prototype._parse_response = function (resp) {
        var el = document.createElement('html');
        el.innerHTML = resp;
        return {
            'photos': this._get_photos(el),
            'title': this._generate_name(el),
            'credit': this._get_credit_info(el),
            'is_reseller': this.resellers.is_reseller(el)
        };
    };
    ResponseParser.prototype._get_photos = function (el) {
        var photos = [];
        var photo_items = el.getElementsByClassName('adPage__content__photos__item');
        for (var i = 0, len = photo_items.length; i < len; i++) {
            var src = photo_items[i].getElementsByTagName('img')[0].getAttribute('src');
            src = src.replace('/160x120/', '/640x480/');
            photos.push(src);
        }
        return photos;
    };
    ResponseParser.prototype._capitalize_string = function (string) {
        var s = string.toLowerCase();
        if (!s.length)
            return s;
        return s[0].toUpperCase() + s.slice(1).replace(/\ [a-zA-Z0-9_ĂăÂâÎîȘșȚț]/g, function (l) { return l.toUpperCase(); }).trim();
    };
    ResponseParser.prototype._get_street_name = function (name) {
        var words_sep = ['strada', 'str', 'ул', 'улица'];
        var name_split = name.split(' ').filter(function (_) { return words_sep.indexOf(_) < 0; });
        var out = name_split.join(' ').replace('str.', '').replace('ул.', '');
        var n = out.search(/[A-Za-z]\.[A-Za-z]/);
        if (n != -1)
            out = out.slice(0, n + 2) + ' ' + out.slice(n + 2);
        if (out.indexOf(',') != -1)
            return this._capitalize_string(out.split(',')[0]);
        var num = out.search(/\d+/);
        if (num != -1)
            return this._capitalize_string(out.slice(0, num));
        return this._capitalize_string(out);
    };
    ResponseParser.prototype._generate_name = function (el) {
        var name = [];
        var lang = el.getElementsByTagName('h1')[0].getElementsByTagName('a')[0].href.split('999.md/')[1].slice(0, 2);
        var address = el.getElementsByClassName('adPage__content__region')[0].getElementsByTagName('dd');
        var features_col = el.getElementsByClassName('adPage__content__features__col')[0];
        var comodities = features_col.getElementsByClassName('adPage__content__features__key');
        var properties = features_col.getElementsByClassName('adPage__content__features__value');
        if (address[2]) {
            if (address[2].innerText.indexOf('Кишинёв') != -1 || address[2].innerText.indexOf('Chișinău') != -1) {
                if (address.length > 3)
                    name.push(address[3].innerText.slice(2));
                if (address.length > 4)
                    name.push(this._get_street_name(address[4].innerText.slice(2)));
            }
            else {
                name.push(address[2].innerText.slice(2));
                if (address.length > 3) {
                    name.push(address[3].innerText.slice(2));
                }
                if (address.length > 4)
                    name.push(this._get_street_name(address[4].innerText.slice(2)));
            }
        }
        for (var i = comodities.length - 1; i > 0; i--) {
            switch (comodities[i].innerText) {
                case 'состояние квартиры':
                case 'starea apartamentului':
                    name[1] = properties[i].innerText.trim();
                    break;
                case 'кол. комнат':
                case 'numărul de camere':
                    var room_numb = properties[i].innerText.match(/\d+/);
                    if (room_numb != null) {
                        var room_match = parseInt(room_numb[0]);
                        var room_name = (room_match == 1) ? 'room' : (room_match > 4) ? '5rooms' : 'rooms';
                        name[2] = room_match + ' ' + this.locale.translate(room_name);
                    }
                    break;
                case 'общая площадь':
                case 'suprafață totală':
                    name[3] = properties[i].innerText;
                    break;
            }
        }
        return name.filter(function (val) { return val; }).join(', ');
    };
    ResponseParser.prototype._get_credit_info = function (el) {
        var text = el.getElementsByClassName('adPage__content__description');
        if (text.length) {
            var first_text = text[0];
            var description_text = first_text.innerText.toLowerCase();
            var words = ['rată', 'in rate', 'rata', 'взнос', 'помесячная', 'ежемесечная'];
            for (var i = 0, len = words.length; i < len; i++) {
                if (description_text.indexOf(' ' + words[i] + ' ') != -1) {
                    return true;
                }
            }
        }
        return false;
    };
    return ResponseParser;
}());
exports.ResponseParser = ResponseParser;
