/**
 * move list of agency names to settings;
 * add whitelist of resellers in settings;
 * don't remove ads, but add .adv class to them;
 * better naming convention
 * add constants for localstorage and DB workers
 * make parser as separate class
 */

import * as dictionary_ru from './dictionaries/ru.dict.json';
import * as dictionary_ro from './dictionaries/ro.dict.json';
import { WebSQLWorker } from './libs/websql';
import { LocalStorageHidden } from './libs/local_hidden';
import { Resellers } from './libs/reseller';
import { Locale } from './libs/locale';

interface PostResponse {
  photos: string[];
  title: string;
  credit: boolean;
  is_reseller: boolean;
}

(function() {

  class NineNineNinePlus {

    public removal_class: string;
    public photo_galleries: object;
    public _photo_items: HTMLCollectionOf<Element>;
    public observer_config: object;
    public lang: string;
    public localstorage_worker: LocalStorageHidden;
    public db_worker: WebSQLWorker;
    public locale: Locale;
    public resellers: Resellers;

    constructor() {
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
      this.localstorage_worker = new LocalStorageHidden();
      this.db_worker = new WebSQLWorker();
      this.locale = new Locale(this.lang);
      this.resellers = new Resellers();

      this.locale.setVocabulary('ru', dictionary_ru);
      this.locale.setVocabulary('ro', dictionary_ro);

      //this.db_worker.delete_all();

      this.window_load(); // start stuff
    }

    _removeItem(el: HTMLElement): void {
      el.classList.add(this.removal_class);
    }
    _remove_marked_elements(): void {
      let remove_el: HTMLCollectionOf<Element> = document.getElementsByClassName(this.removal_class);
      while (remove_el[0]) { remove_el[0].parentNode.removeChild(remove_el[0]); }
    }
    _get_id(el: HTMLElement): string {
      return el.getElementsByTagName('a')[0].getAttribute('href').split('/')[2];
    }

    _fade_out(el: HTMLElement) {
      el.style.opacity = '1';
      let last: number = +new Date();
      const tick = function(): void {
        const opacity_int: number = parseFloat(el.style.opacity);
        const date: number = (new Date()).valueOf();
        el.style.opacity = (opacity_int - (date - last) / 400).toString();
        last = +new Date();

        if (+el.style.opacity > 0) {
          (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
        } else {
          el.style.display = 'none';
        }
      };
      tick();
    }

    _capitalize_string(string: string): string {
      let s: string = string.toLowerCase();
      if (!s.length) return s;

      return s[0].toUpperCase()  + s.slice(1).replace(/\ [a-zA-Z0-9_ĂăÂâÎîȘșȚț]/g, l => l.toUpperCase()).trim();
    }

    _get_street_name(name: string): string {
      const words_sep: string[] = ['strada', 'str', 'ул', 'улица'];
      const name_split : string[] = name.split(' ').filter( _ => words_sep.indexOf(_) < 0);
      let out: string = name_split.join(' ').replace('str.', '').replace('ул.', '');
      const n: number = out.search(/[A-Za-z]\.[A-Za-z]/);
      if (n != -1) out = out.slice(0, n + 2) + ' ' + out.slice(n + 2);

      if (out.indexOf(',') != -1) return this._capitalize_string(out.split(',')[0]);
      
      const num: number = out.search(/\d+/);
      if (num != -1) return this._capitalize_string(out.slice(0, num));

      return this._capitalize_string(out);
    }

    _generate_name(el: HTMLElement): string {
      let name: string[] = [];
      const lang: string = el.getElementsByTagName('h1')[0].getElementsByTagName('a')[0].href.split('999.md/')[1].slice(0, 2);
      const address: NodeListOf<HTMLElement> = el.getElementsByClassName('adPage__content__region')[0].getElementsByTagName('dd');
      const features_col: HTMLElement = <HTMLElement> el.getElementsByClassName('adPage__content__features__col')[0];
      const comodities: NodeListOf<HTMLElement> = features_col.getElementsByClassName('adPage__content__features__key') as NodeListOf<HTMLElement>;
      const properties: NodeListOf<HTMLElement> = features_col.getElementsByClassName('adPage__content__features__value') as NodeListOf<HTMLElement>;

      if (address[2]) {
        if (address[2].innerText.indexOf('Кишинёв') != -1 || address[2].innerText.indexOf('Chișinău') != -1) {
          // Chishinau
          if (address.length > 3) name.push( address[3].innerText.slice(2) );
          if (address.length > 4) name.push( this._get_street_name(address[4].innerText.slice(2)) );
        } else {
          // Other city
          name.push( address[2].innerText.slice(2) );
          if (address.length > 3) { name.push( address[3].innerText.slice(2) ); }
          if (address.length > 4) name.push( this._get_street_name(address[4].innerText.slice(2)) );
        }
      }

      for (let i: number = comodities.length - 1; i > 0; i--) {
        switch (comodities[i].innerText) {
          case 'состояние квартиры':
          case 'starea apartamentului':
            name[1] = properties[i].innerText.trim();
            break;

          case 'кол. комнат':
          case 'numărul de camere':
            const room_numb: RegExpMatchArray = properties[i].innerText.match(/\d+/);
            if (room_numb != null) {
              const room_match: number = parseInt(room_numb[0]);
              const room_name: string = (room_match == 1) ? 'room' : (room_match > 4) ? '5rooms' : 'rooms' ;
              name[2] = room_match + ' ' + this.locale.translate(room_name);
            }
            break;

          case 'общая площадь':
          case 'suprafață totală':
            name[3] = properties[i].innerText;
            break;
        }
      }

      return name.filter(val => val).join(', ');
    }

    _get_photos(el: HTMLElement): string[] {
      let photos: string[] = [];
      let photo_items : NodeListOf<Element> = el.getElementsByClassName('adPage__content__photos__item');
      for (let i: number = 0, len: number = photo_items.length; i < len; i++) {
        var src: string = photo_items[i].getElementsByTagName('img')[0].getAttribute('src');
        src = src.replace('/160x120/', '/640x480/');
        photos.push(src);
      }

      return photos;
    }

    _get_credit_info(el: HTMLElement): boolean {
      var text: NodeListOf<Element> = el.getElementsByClassName('adPage__content__description');
      if (text.length) {
        var first_text: HTMLElement = text[0] as HTMLElement;
        var description_text: string = first_text.innerText.toLowerCase();
        var words: string[] = ['rată', 'in rate', 'rata', 'взнос', 'помесячная', 'ежемесечная'];
        for (var i = 0, len = words.length; i < len; i++) {
          if (description_text.indexOf(' ' + words[i] + ' ') != -1) {
            return true;
          }
        }
      }

      return false;
    }


    _parse_response(resp: string): PostResponse {
      var el: HTMLElement = document.createElement('html');
      el.innerHTML = resp;
      
      return {
        'photos' :  this._get_photos(el),
        'title' : this._generate_name(el),
        'credit' : this._get_credit_info(el),
        'is_reseller' : this.resellers.is_reseller(el)
      }
    }

    send_request(url: string, cb: Function): void {
      var self = this;
      var request: XMLHttpRequest = new XMLHttpRequest();
      
      request.open('GET', url, true);
      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          var resp_text : string = request.responseText;
          var resp: PostResponse = self._parse_response(resp_text);
          cb(resp);
        } else {
          cb(false);
        }
      };
      request.onerror = function() {
        cb(false);
      };

      request.send();
    }

    init_parses(id_counter: number, url: string) {
      var self = this;
      function cb (res: any): void {
        if (res == false) return;
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
        self.db_worker.add_url(url, res); // save to DB
      }

      self.db_worker.find_url(url, function(data) {
        if (data == false) {
          self.send_request(url, cb); // get from request
        } else {
          cb(data); // take from DB
        }
      });
    }

    click_listener(): void {
      var self = this;
      function _click_handler(e: Event) : void {
        var target: HTMLElement = <HTMLElement> e.target;
        var item: HTMLElement = <HTMLElement>target.parentNode;
        
        if (target.classList.contains('item-rem')) {
          var id: string = self._get_id(item);
          self.localstorage_worker.add_one_hidden(id);
          item.parentNode.removeChild(item);
        }

        if (target.classList.contains('arrow-left') || target.classList.contains('arrow-right')) {
          e.preventDefault();
          var id: string = target.getAttribute('id_counter');
          var photos: string[] = self.photo_galleries[id];

          if (target.classList.contains('arrow-left')) {
            var last_photo: string = photos.pop();
            photos.unshift(last_photo); // place the last in the beginning;
          } else {
            var first_photo: string = photos.shift();
            photos.push(first_photo); // place the first in the end;
          }
          self.photo_galleries[id] = photos;

          item.getElementsByTagName('img')[0].setAttribute('src', photos[0]);
        }
      }

      var list: HTMLElement = <HTMLElement> document.getElementsByClassName('ads-list-photo')[0];
      if (!list.classList.contains('js-click-processed')) {
        list.addEventListener("click", _click_handler);
        list.classList.add('js-click-processed');
      }
    }

    start_thumbs_cleaner(): void {
      var photoItems: HTMLCollectionOf<Element> = document.getElementsByClassName('ads-list-photo-item');
      this._photo_items = photoItems;
      if (photoItems[0].classList.contains('js-cleaner-process')) {
        return;
      }

      photoItems[0].classList.add('js-cleaner-process');

      var photos: string[] = [];
      var checker = this.localstorage_worker.is_hidden();

      for (var i: number = 0, id_counter: number = 0, len: number = photoItems.length; i < len; i++) {
        var item: Element = photoItems[i];
        if (item == undefined) break;

        if (item.getElementsByClassName('ads-list-photo-item-price').length == 0) {
          this._removeItem(<HTMLElement> item);
          continue;
        }

        var id: string = this._get_id(<HTMLElement> item);
        if (checker(id)) {
          this._removeItem(<HTMLElement> item);
          continue;
        }

        var img: Element = item.getElementsByTagName('img')[0];
        var img_src: string = img.getAttribute('src');
        if (img_src.indexOf('noimage.gif') != -1) {
          this._removeItem(<HTMLElement> item);
          continue;
        }

        if (photos.indexOf(img_src) != -1) {
          this._removeItem(<HTMLElement> item);
          continue;
        }
        
        img.setAttribute('src', img_src.replace('/320x240/', '/640x480/')); // make it large.
        
        item.innerHTML += '<span class="item-rem">' + this.locale.translate('hide') + '</span>';
        item.getElementsByTagName('a')[0].innerHTML += '<span class="arrow-left" id_counter="' + id_counter + '"></span>';
        item.getElementsByTagName('a')[0].innerHTML += '<span class="arrow-right" id_counter="' + id_counter + '"></span>';

        var url: string = 'https://999.md' + item.getElementsByTagName('a')[0].getAttribute('href');
        this.init_parses(id_counter, url);
        
        photos.push(img_src);
        id_counter++;        
      }

      this._remove_marked_elements();
      this.click_listener();
    }

    start_table_cleaner(): void {
      var checker = this.localstorage_worker.is_hidden();
      var table: Element = document.getElementsByClassName('ads-list-table')[0];
      var trs: NodeListOf<HTMLElement> = table.getElementsByTagName('tr');

      for (var i: number = 0, len: number = trs.length; i < len; i++) {
        var tr: HTMLElement = trs[i];

        if (tr.getElementsByClassName('ads-list-table-price')[0].innerHTML.trim().length == 0) {
          this._removeItem(tr);
          continue;
        }

        var id: string = this._get_id(tr);
        if (checker(id)) {
          this._removeItem(tr);
          continue;
        }

        var tooltip_icon: Element = tr.getElementsByClassName('js-tooltip-photo')[0];
        if (tooltip_icon) {
          var tooltip_src : string = tooltip_icon.getAttribute('data-image').replace('/160x120/', '/320x240/');
          tooltip_icon.setAttribute('data-image', tooltip_src);
        }
      }

      this._remove_marked_elements();
    }

    start_cleaners() : void {
      if (window.location.href.indexOf('/real-estate/') == -1) return; // this should only work for real estate.
      if (document.getElementsByClassName('ads-list-table').length) {
        this.start_table_cleaner();
      }

      if (document.getElementsByClassName('ads-list-photo-item').length) {
        this.start_thumbs_cleaner();
      }
    }

    profile_page_extra() {
      var self = this;

      // on user profile page
      var user_header: HTMLCollectionOf<Element> =  document.getElementsByClassName('user-profile-header');
      if (!document.getElementsByClassName('user-profile-header').length) {
        return;
      }

      var btn_click_handler = function(e) {
        var items: HTMLCollectionOf<Element> = document.getElementsByClassName('profile-ads-list-photo-item');
        for (var i = 0, len = items.length; i < len; i++) {
          var item: Element = items[i];
          var id: string = self._get_id(item as HTMLElement);
          self.localstorage_worker.add_one_hidden(id);
          self._fade_out(item as HTMLElement);
        }
      }

      user_header[0].innerHTML += '<span class="ban-items">Hide all from user</span>';

      var ban_btn: Element = user_header[0].getElementsByClassName('ban-items')[0];
      ban_btn.addEventListener("click", btn_click_handler);
    }

    add_links() {
      var nav: HTMLCollectionOf<Element> = document.getElementsByClassName('header_menu_nav');
      if (nav.length) {
        var nav_inner: Element = nav[0].getElementsByTagName('ul')[0];
        nav_inner.innerHTML = '<li><a href="https://999.md/my-hidden">' + this.locale.translate('hidden') + '</a></li>' + 
        '<li><a href="https://999.md/cabinet/user-history">' + this.locale.translate('history') + '</a></li>' + nav_inner.innerHTML;
      }
    }

    show_hidden_page() {

      if (window.location.href != "https://999.md/my-hidden") return;

      var self = this;
      var error: Element = document.getElementsByClassName('error-404-page')[0];
      error.parentNode.removeChild(error);

      var ul: Element = document.createElement('ul');
      ul.setAttribute('class','list-of-hidden');
      document.getElementsByTagName('body')[0].appendChild(ul);

      var hidden: string[] = this.localstorage_worker.get_all_hidden();

      ul.innerHTML = '<span class="unhide-all">unhide all</span>';
      for (var i: number = 0, len: number = hidden.length; i < len; i++) {
        ul.innerHTML += '<li class="hidden-item">ID: ' + hidden[i] + ' <a href="http://999.md/' + self.lang + '/' + hidden[i] + '">link</a>';
        ul.innerHTML += '<span class="unhide" data-id="' + hidden[i] + '">unhide</span>';
      }

      var fadeAllHidden = function(): void {
        var lis: NodeListOf<HTMLElement> = ul.getElementsByTagName('li');
        for (var i: number = 0, len: number = lis.length; i < len; i++) {
          self._fade_out(lis[i]);
        }
      }

      var ul_click_handler = function(e: Event): void {
        var target: Element = e.target as Element;
        if (target.classList.contains('unhide-all')) {
          localStorage.setItem("999_skips", '[]');
          fadeAllHidden();
        } else if (target.classList.contains('unhide')) {
          self.localstorage_worker.remove_from_hidden(target.getAttribute('data-id'));
          self._fade_out(target.parentNode as HTMLElement);
        }
      }

      ul.addEventListener('click', ul_click_handler);

    }

    window_load() {
      const self = this;
      window.addEventListener('load', function() {
        const cookie: any = document.cookie;
        const n: number = cookie.indexOf('simpalsid.lang=');
        if (n != -1) {
          const lang_code: string = cookie.slice(n + 15).slice(0, 2);
          self.lang = lang_code;
          self.locale.language = lang_code;
        }

        self.add_links();
        self.init();

        const body_element: HTMLElement = document.getElementsByTagName('body')[0];

        const observer: MutationObserver = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            if (mutation.attributeName == 'class' && mutation.oldValue.indexOf('loading') != -1) {
              self.init();
            }
          });
        });

        observer.observe(body_element, self.observer_config);
      });
    }

    init() {
      this.start_cleaners();
      this.profile_page_extra();
      this.show_hidden_page();
    }
  }

  /* Init 999 подорожник */
  const helper: NineNineNinePlus = new NineNineNinePlus();

})();