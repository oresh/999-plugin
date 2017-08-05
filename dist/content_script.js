"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var websql_1 = require("./libs/websql");
var local_hidden_1 = require("./libs/local_hidden");
var locale_1 = require("./libs/locale");
var response_parser_1 = require("./libs/response_parser");
(function () {
    var NineNineNinePlus = (function () {
        function NineNineNinePlus() {
            this.removal_classname = 'marked-for-removal';
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
            this.storage = new local_hidden_1.LocalStorageHidden();
            this.db = new websql_1.WebSQLWorker();
            this.locale = new locale_1.Locale(this.lang);
            this.parser = new response_parser_1.ResponseParser(this.locale);
            this.window_load();
        }
        NineNineNinePlus.prototype._removeItem = function (el) {
            el.classList.add(this.removal_classname);
        };
        NineNineNinePlus.prototype._remove_marked_elements = function () {
            var remove_el = document.getElementsByClassName(this.removal_classname);
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
                self.db.add_url(url, res);
            }
            self.db.find_url(url, function (data) {
                if (data == false) {
                    self.parser.send_request(url, cb);
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
                    self.storage.add_one_hidden(id);
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
        NineNineNinePlus.prototype.thumbs_cleaner = function () {
            var photoItems = document.getElementsByClassName('ads-list-photo-item');
            this._photo_items = photoItems;
            if (photoItems[0].classList.contains('js-cleaner-process')) {
                return;
            }
            photoItems[0].classList.add('js-cleaner-process');
            var photos = [];
            for (var i = 0, id_counter = 0, len = photoItems.length; i < len; i++) {
                var item = photoItems[i];
                if (item == undefined)
                    break;
                if (item.getElementsByClassName('ads-list-photo-item-price').length == 0) {
                    this._removeItem(item);
                    continue;
                }
                var href = item.getElementsByTagName('a')[0].getAttribute('href');
                if (href.indexOf('/booster/') === 0) {
                    this._removeItem(item);
                    continue;
                }
                var id = this._get_id(item);
                if (this.storage.is_hidden(id)) {
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
                var url = 'https://999.md' + href;
                this.init_parses(id_counter, url);
                photos.push(img_src);
                id_counter++;
            }
            this._remove_marked_elements();
            this.click_listener();
        };
        NineNineNinePlus.prototype.table_cleaner = function () {
            var table = document.getElementsByClassName('ads-list-table')[0];
            var trs = table.getElementsByTagName('tr');
            for (var i = 0, len = trs.length; i < len; i++) {
                var tr = trs[i];
                if (tr.getElementsByClassName('ads-list-table-price')[0].innerHTML.trim().length == 0) {
                    this._removeItem(tr);
                    continue;
                }
                var id = this._get_id(tr);
                if (this.storage.is_hidden(id)) {
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
                this.table_cleaner();
            }
            if (document.getElementsByClassName('ads-list-photo-item').length) {
                this.thumbs_cleaner();
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
                    self.storage.add_one_hidden(id);
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
            var hidden = this.storage.get_all_hidden();
            ul.innerHTML = '<span class="unhide-all">unhide all</span>';
            var props = Object.getOwnPropertyNames(hidden);
            for (var i = 0, len = props.length; i < len; i++) {
                var item = props[i];
                var item_str = '<li class="hidden-item">ID: ' + item + ' <a href="http://999.md/' + self.lang + '/' + item + '">link</a>';
                item_str += '<span class="unhide" data-id="' + item + '">unhide</span></li>';
                ul.innerHTML += item_str;
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
                    self.storage.remove_all_hidden();
                    fadeAllHidden();
                }
                else if (target.classList.contains('unhide')) {
                    self.storage.remove_from_hidden(target.getAttribute('data-id'));
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
