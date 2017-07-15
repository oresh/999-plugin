/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var dictionary_ru = __webpack_require__(1);
var dictionary_ro = __webpack_require__(2);
var websql_1 = __webpack_require__(3);
var local_hidden_1 = __webpack_require__(4);
var reseller_1 = __webpack_require__(5);
var locale_1 = __webpack_require__(6);
(function () {
    var NineNineNinePlus = (function () {
        function NineNineNinePlus() {
            this.removal_class = 'marked-for-removal';
            this.photo_galleries = {};
            this.observer_config = {
                attributes: true,
                attributeOldValue: true,
                childList: false,
                characterData: false,
                subtree: false,
                characterDataOldValue: false
            };
            this.lang = "ru";
            this.localstorage_worker = new local_hidden_1.LocalStorageHidden();
            this.db_worker = new websql_1.WebSQLWorker();
            this.locale = new locale_1.Locale(this.lang);
            this.resellers = new reseller_1.Resellers();
            this.locale.setVocabulary('ru', dictionary_ru);
            this.locale.setVocabulary('ro', dictionary_ro);
            this.window_load();
        }
        NineNineNinePlus.prototype._removeItem = function (el) {
            el.classList.add(this.removal_class);
        };
        NineNineNinePlus.prototype._remove_marked_elements = function () {
            var remove_el = document.getElementsByClassName(this.removal_class);
            while (remove_el[0]) {
                remove_el[0].parentNode.removeChild(remove_el[0]);
            }
        };
        NineNineNinePlus.prototype._get_id = function (el) {
            return el.getElementsByTagName('a')[0].getAttribute('href').split('/')[2];
        };
        NineNineNinePlus.prototype._fade_out = function (el) {
            el.style.opacity = '1';
            var last = +new Date();
            var tick = function () {
                var opacity_int = parseFloat(el.style.opacity);
                var date = (new Date()).valueOf();
                el.style.opacity = (opacity_int - (date - last) / 400).toString();
                last = +new Date();
                if (+el.style.opacity > 0) {
                    (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
                }
                else {
                    el.style.display = 'none';
                }
            };
            tick();
        };
        NineNineNinePlus.prototype._capitalize_string = function (string) {
            var s = string.toLowerCase();
            if (!s.length)
                return s;
            return s[0].toUpperCase() + s.slice(1).replace(/\ [a-zA-Z0-9_ĂăÂâÎîȘșȚț]/g, function (l) { return l.toUpperCase(); }).trim();
        };
        NineNineNinePlus.prototype._get_street_name = function (name) {
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
        NineNineNinePlus.prototype._generate_name = function (el) {
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
        NineNineNinePlus.prototype._get_photos = function (el) {
            var photos = [];
            var photo_items = el.getElementsByClassName('adPage__content__photos__item');
            for (var i = 0, len = photo_items.length; i < len; i++) {
                var src = photo_items[i].getElementsByTagName('img')[0].getAttribute('src');
                src = src.replace('/160x120/', '/640x480/');
                photos.push(src);
            }
            return photos;
        };
        NineNineNinePlus.prototype._get_credit_info = function (el) {
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
        NineNineNinePlus.prototype._parse_response = function (resp) {
            var el = document.createElement('html');
            el.innerHTML = resp;
            return {
                'photos': this._get_photos(el),
                'title': this._generate_name(el),
                'credit': this._get_credit_info(el),
                'is_reseller': this.resellers.is_reseller(el)
            };
        };
        NineNineNinePlus.prototype.send_request = function (url, cb) {
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
        NineNineNinePlus.prototype.init_parses = function (id_counter, url) {
            var self = this;
            function cb(res) {
                if (res == false)
                    return;
                if (Array.isArray(res['photos']) && res['photos'].length) {
                    self.photo_galleries[id_counter] = res['photos'];
                }
                if (res['title']) {
                    self._photo_items[id_counter].getElementsByClassName('ads-list-photo-item-title')[0].getElementsByTagName('a')[0].innerText = res['title'];
                }
                if (res['credit']) {
                    self._photo_items[id_counter].getElementsByClassName('ads-list-photo-item-price')[0].innerHTML += '<span class="credit-available">%</span>';
                }
                if (res['is_reseller']) {
                    self._photo_items[id_counter].getElementsByClassName('ads-list-photo-item-price')[0].innerHTML += '<span class="from-reseller">' + self.locale.translate('agency') + '</span>';
                }
                self.db_worker.add_url(url, res);
            }
            self.db_worker.find_url(url, function (data) {
                if (data == false) {
                    self.send_request(url, cb);
                }
                else {
                    cb(data);
                }
            });
        };
        NineNineNinePlus.prototype.click_listener = function () {
            var self = this;
            function _click_handler(e) {
                var target = e.target;
                var item = target.parentNode;
                if (target.classList.contains('item-rem')) {
                    var id = self._get_id(item);
                    self.localstorage_worker.add_one_hidden(id);
                    item.parentNode.removeChild(item);
                }
                if (target.classList.contains('arrow-left') || target.classList.contains('arrow-right')) {
                    e.preventDefault();
                    var id = target.getAttribute('id_counter');
                    var photos = self.photo_galleries[id];
                    if (target.classList.contains('arrow-left')) {
                        var last_photo = photos.pop();
                        photos.unshift(last_photo);
                    }
                    else {
                        var first_photo = photos.shift();
                        photos.push(first_photo);
                    }
                    self.photo_galleries[id] = photos;
                    item.getElementsByTagName('img')[0].setAttribute('src', photos[0]);
                }
            }
            var list = document.getElementsByClassName('ads-list-photo')[0];
            if (!list.classList.contains('js-click-processed')) {
                list.addEventListener("click", _click_handler);
                list.classList.add('js-click-processed');
            }
        };
        NineNineNinePlus.prototype.start_thumbs_cleaner = function () {
            var photoItems = document.getElementsByClassName('ads-list-photo-item');
            this._photo_items = photoItems;
            if (photoItems[0].classList.contains('js-cleaner-process')) {
                return;
            }
            photoItems[0].classList.add('js-cleaner-process');
            var photos = [];
            var checker = this.localstorage_worker.is_hidden();
            for (var i = 0, id_counter = 0, len = photoItems.length; i < len; i++) {
                var item = photoItems[i];
                if (item == undefined)
                    break;
                if (item.getElementsByClassName('ads-list-photo-item-price').length == 0) {
                    this._removeItem(item);
                    continue;
                }
                var id = this._get_id(item);
                if (checker(id)) {
                    this._removeItem(item);
                    continue;
                }
                var img = item.getElementsByTagName('img')[0];
                var img_src = img.getAttribute('src');
                if (img_src.indexOf('noimage.gif') != -1) {
                    this._removeItem(item);
                    continue;
                }
                if (photos.indexOf(img_src) != -1) {
                    this._removeItem(item);
                    continue;
                }
                img.setAttribute('src', img_src.replace('/320x240/', '/640x480/'));
                item.innerHTML += '<span class="item-rem">' + this.locale.translate('hide') + '</span>';
                item.getElementsByTagName('a')[0].innerHTML += '<span class="arrow-left" id_counter="' + id_counter + '"></span>';
                item.getElementsByTagName('a')[0].innerHTML += '<span class="arrow-right" id_counter="' + id_counter + '"></span>';
                var url = 'https://999.md' + item.getElementsByTagName('a')[0].getAttribute('href');
                this.init_parses(id_counter, url);
                photos.push(img_src);
                id_counter++;
            }
            this._remove_marked_elements();
            this.click_listener();
        };
        NineNineNinePlus.prototype.start_table_cleaner = function () {
            var checker = this.localstorage_worker.is_hidden();
            var table = document.getElementsByClassName('ads-list-table')[0];
            var trs = table.getElementsByTagName('tr');
            for (var i = 0, len = trs.length; i < len; i++) {
                var tr = trs[i];
                if (tr.getElementsByClassName('ads-list-table-price')[0].innerHTML.trim().length == 0) {
                    this._removeItem(tr);
                    continue;
                }
                var id = this._get_id(tr);
                if (checker(id)) {
                    this._removeItem(tr);
                    continue;
                }
                var tooltip_icon = tr.getElementsByClassName('js-tooltip-photo')[0];
                if (tooltip_icon) {
                    var tooltip_src = tooltip_icon.getAttribute('data-image').replace('/160x120/', '/320x240/');
                    tooltip_icon.setAttribute('data-image', tooltip_src);
                }
            }
            this._remove_marked_elements();
        };
        NineNineNinePlus.prototype.start_cleaners = function () {
            if (window.location.href.indexOf('/real-estate/') == -1)
                return;
            if (document.getElementsByClassName('ads-list-table').length) {
                this.start_table_cleaner();
            }
            if (document.getElementsByClassName('ads-list-photo-item').length) {
                this.start_thumbs_cleaner();
            }
        };
        NineNineNinePlus.prototype.profile_page_extra = function () {
            var self = this;
            var user_header = document.getElementsByClassName('user-profile-header');
            if (!document.getElementsByClassName('user-profile-header').length) {
                return;
            }
            var btn_click_handler = function (e) {
                var items = document.getElementsByClassName('profile-ads-list-photo-item');
                for (var i = 0, len = items.length; i < len; i++) {
                    var item = items[i];
                    var id = self._get_id(item);
                    self.localstorage_worker.add_one_hidden(id);
                    self._fade_out(item);
                }
            };
            user_header[0].innerHTML += '<span class="ban-items">Hide all from user</span>';
            var ban_btn = user_header[0].getElementsByClassName('ban-items')[0];
            ban_btn.addEventListener("click", btn_click_handler);
        };
        NineNineNinePlus.prototype.add_links = function () {
            var nav = document.getElementsByClassName('header_menu_nav');
            if (nav.length) {
                var nav_inner = nav[0].getElementsByTagName('ul')[0];
                nav_inner.innerHTML = '<li><a href="https://999.md/my-hidden">' + this.locale.translate('hidden') + '</a></li>' +
                    '<li><a href="https://999.md/cabinet/user-history">' + this.locale.translate('history') + '</a></li>' + nav_inner.innerHTML;
            }
        };
        NineNineNinePlus.prototype.show_hidden_page = function () {
            if (window.location.href != "https://999.md/my-hidden")
                return;
            var self = this;
            var error = document.getElementsByClassName('error-404-page')[0];
            error.parentNode.removeChild(error);
            var ul = document.createElement('ul');
            ul.setAttribute('class', 'list-of-hidden');
            document.getElementsByTagName('body')[0].appendChild(ul);
            var hidden = this.localstorage_worker.get_all_hidden();
            ul.innerHTML = '<span class="unhide-all">unhide all</span>';
            for (var i = 0, len = hidden.length; i < len; i++) {
                ul.innerHTML += '<li class="hidden-item">ID: ' + hidden[i] + ' <a href="http://999.md/' + self.lang + '/' + hidden[i] + '">link</a>';
                ul.innerHTML += '<span class="unhide" data-id="' + hidden[i] + '">unhide</span>';
            }
            var fadeAllHidden = function () {
                var lis = ul.getElementsByTagName('li');
                for (var i = 0, len = lis.length; i < len; i++) {
                    self._fade_out(lis[i]);
                }
            };
            var ul_click_handler = function (e) {
                var target = e.target;
                if (target.classList.contains('unhide-all')) {
                    localStorage.setItem("999_skips", '[]');
                    fadeAllHidden();
                }
                else if (target.classList.contains('unhide')) {
                    self.localstorage_worker.remove_from_hidden(target.getAttribute('data-id'));
                    self._fade_out(target.parentNode);
                }
            };
            ul.addEventListener('click', ul_click_handler);
        };
        NineNineNinePlus.prototype.window_load = function () {
            var self = this;
            window.addEventListener('load', function () {
                var cookie = document.cookie;
                var n = cookie.indexOf('simpalsid.lang=');
                if (n != -1) {
                    var lang_code = cookie.slice(n + 15).slice(0, 2);
                    self.lang = lang_code;
                    self.locale.language = lang_code;
                }
                self.add_links();
                self.init();
                var body_element = document.getElementsByTagName('body')[0];
                var observer = new MutationObserver(function (mutations) {
                    mutations.forEach(function (mutation) {
                        if (mutation.attributeName == 'class' && mutation.oldValue.indexOf('loading') != -1) {
                            self.init();
                        }
                    });
                });
                observer.observe(body_element, self.observer_config);
            });
        };
        NineNineNinePlus.prototype.init = function () {
            this.start_cleaners();
            this.profile_page_extra();
            this.show_hidden_page();
        };
        return NineNineNinePlus;
    }());
    var helper = new NineNineNinePlus();
})();


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = {
	"hidden": "спрятанное",
	"hide": "спрятать",
	"room": "комната",
	"rooms": "комнаты",
	"5rooms": "комнат",
	"history": "история",
	"agency": "агентство"
};

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = {
	"hidden": "ascuns",
	"hide": "ascunde",
	"room": "camera",
	"rooms": "camere",
	"5rooms": "camere",
	"history": "istoria",
	"agency": "agentie"
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var WebSQLWorker = (function () {
    function WebSQLWorker() {
        this.db = openDatabase('mydb', '1.0', '999 local cache', 2 * 1024 * 1024);
        this.db.transaction(function (t) {
            t.executeSql('CREATE TABLE IF NOT EXISTS pages (url unique, data)');
        });
    }
    WebSQLWorker.prototype.find_url = function (url, cb) {
        this.db.transaction(function (t) {
            t.executeSql('SELECT * FROM pages WHERE url = ?', [url], function (t, results) {
                if (results.rows.length) {
                    cb(JSON.parse(results.rows.item(0).data));
                }
                else {
                    return cb(false);
                }
            });
        });
    };
    WebSQLWorker.prototype.delete_all = function () {
        this.db.transaction(function (t) {
            t.executeSql('DELETE FROM pages');
        });
    };
    WebSQLWorker.prototype.delete_url = function (url) {
        this.db.transaction(function (t) {
            t.executeSql('DELETE FROM pages WHERE url = ?', [url]);
        });
    };
    WebSQLWorker.prototype.add_url = function (url, data) {
        this.db.transaction(function (t) {
            t.executeSql('INSERT INTO pages (url, data) VALUES (?, ?)', [url, JSON.stringify(data)]);
        });
    };
    return WebSQLWorker;
}());
exports.WebSQLWorker = WebSQLWorker;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var LocalStorageHidden = (function () {
    function LocalStorageHidden() {
    }
    LocalStorageHidden.prototype.get_all_hidden = function () {
        return JSON.parse(localStorage.getItem("999_skips")) || [];
    };
    LocalStorageHidden.prototype.save_all_hidden = function (ids) {
        localStorage.setItem("999_skips", JSON.stringify(ids));
    };
    LocalStorageHidden.prototype.add_one_hidden = function (id) {
        var hidden = this.get_all_hidden();
        hidden.push(id);
        this.save_all_hidden(hidden);
        return id;
    };
    LocalStorageHidden.prototype.remove_from_hidden = function (id) {
        var hidden = this.get_all_hidden();
        var id_index = hidden.indexOf(id);
        if (id_index != -1) {
            hidden.splice(id_index, 1);
            this.save_all_hidden(hidden);
            return hidden;
        }
    };
    LocalStorageHidden.prototype.is_hidden = function () {
        var hidden = this.get_all_hidden();
        return function (id) {
            return hidden.indexOf(id) != -1;
        };
    };
    return LocalStorageHidden;
}());
exports.LocalStorageHidden = LocalStorageHidden;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Resellers = (function () {
    function Resellers() {
        this.defaults = [
            'imobil', 'chirie', 'gazda', 'globalprim-const', 'globalprim', 'rentapartment',
            'anghilina', 'goodtime', 'caseafaceri', 'dom-solutions', 'euroval-cons', 'chirii',
            'apppel', 'apartamentul-tau', 'platondumitrash', 'classapartment', 'vladasimplu123',
            'casaluminoasa', 'nighttime', 'exfactor', 'acces', 'abicom', 'ivan-botanika', 'imobio'
        ];
        this.nonresellers = this.get_nonresellers_from_local();
        this.resellers = this.get_resellers_from_local();
        this.resellers_len = this.resellers.length;
    }
    Resellers.prototype.get_resellers_from_local = function () {
        return JSON.parse(localStorage.getItem("999_resellers")) || this.defaults;
    };
    Resellers.prototype.get_nonresellers_from_local = function () {
        return JSON.parse(localStorage.getItem("999_nonresellers")) || [];
    };
    Resellers.prototype.add_to_local = function (name) {
        this.resellers.push(name);
        this.save_to_local();
    };
    Resellers.prototype.remove_from_local = function (name) {
        var id_index = this.resellers.indexOf(name);
        if (id_index != -1) {
            this.resellers.splice(id_index, 1);
            this.save_to_local();
        }
    };
    Resellers.prototype.save_to_local = function () {
        localStorage.setItem("999_resellers", JSON.stringify(this.resellers));
    };
    Resellers.prototype.is_reseller = function (el) {
        var nameElement = el.getElementsByClassName('adPage__header__stats__owner')[0];
        if (nameElement.classList.contains('is-verified')) {
            console.log(nameElement.getElementsByTagName('dd')[0].innerText.toLowerCase(), ' is verified');
            return true;
        }
        var name = nameElement.getElementsByTagName('dd')[0].innerText.toLowerCase();
        console.log('name:', name);
        if (name.replace(/[0-9]/g, '').length == 0) {
            console.log('is reseller');
            return true;
        }
        for (var i = 0; i < this.resellers_len; i++) {
            if (name.indexOf(this.resellers[i]) != -1) {
                console.log('is reseller');
                return true;
            }
        }
        console.log('is NOT reseller');
        return false;
    };
    return Resellers;
}());
exports.Resellers = Resellers;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

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


/***/ })
/******/ ]);