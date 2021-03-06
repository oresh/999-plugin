/**
 * @TODO list:
 *
 * add "approved seller" button on profile page
 * don't remove ads, but add .adv class to them
 * better naming convention
 * add checkbox in filter "hide with too low price"
 * add checkbox hide resellerspf
 * get rid of typecasting where possible
 */

import { WebSQLWorker } from './libs/websql';
import { LocalStorageHidden, SkipIDs } from './libs/local_hidden';
import { Locale } from './libs/locale';
import { ResponseParser } from './libs/response_parser';

(function() {

  class NineNineNinePlus {
    public photo_galleries: object;
    public _photo_items: HTMLCollectionOf<Element>;
    public observer_config: object;
    public lang: string;
    public storage: LocalStorageHidden;
    public db: WebSQLWorker;
    public locale: Locale;
    public parser: ResponseParser;

    constructor() {
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
      this.storage = new LocalStorageHidden();
      this.db = new WebSQLWorker();
      this.locale = new Locale(this.lang);
      this.parser = new ResponseParser(this.locale);

      //this.db.delete_all();

      this.on_window_loaded(); // start stuff
    }

    _mark_for_removal(el: HTMLElement | Element): void {
      el.classList.add('marked-for-removal');
    }

    _remove_marked(): void {
      let remove_el: HTMLCollectionOf<Element> = document.getElementsByClassName('marked-for-removal');
      while (remove_el[0])
        remove_el[0].parentNode.removeChild(remove_el[0]);
    }

    _get_item_id(el: HTMLElement | Element): string {
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

    parse(id_counter: number, url: string) {
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
        self.db.add_url(url, res); // save to DB
      }

      self.db.find_url(url, function(data) {
        if (data == false) {
          self.parser.send_request(url, cb); // get from request
        } else {
          cb(data); // take from DB
        }
      });
    }

    handle_click_events(): void {
      var self = this;
      function _click_handler(e: Event) : void {
        var target: HTMLElement = <HTMLElement> e.target;
        var item: HTMLElement = <HTMLElement>target.parentNode;
        
        if (target.classList.contains('item-rem')) {
          var id: string = self._get_item_id(item);
          self.storage.add_one_hidden(id);
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

    filter_thumbs_list_items(): void {
      var photoItems: HTMLCollectionOf<Element> = document.getElementsByClassName('ads-list-photo-item');
      this._photo_items = photoItems;
      if (photoItems[0].classList.contains('js-cleaner-process')) {
        return;
      }

      photoItems[0].classList.add('js-cleaner-process');

      var photos: string[] = [];

      for (var i: number = 0, id_counter: number = 0, len: number = photoItems.length; i < len; i++) {
        var item: Element = photoItems[i];
        if (item == undefined) break;

        if (item.getElementsByClassName('ads-list-photo-item-price').length == 0) {
          this._mark_for_removal(item);
          continue;
        }

        var href: string = item.getElementsByTagName('a')[0].getAttribute('href');
        if (href.indexOf('/booster/') === 0) {
          this._mark_for_removal(item);
          continue;
        }

        var id: string = this._get_item_id(item);
        if (this.storage.is_hidden(id)) {
          this._mark_for_removal(item);
          continue;
        }

        // @TODO replace with regexp
        var img: Element = item.getElementsByTagName('img')[0];
        var img_src: string = img.getAttribute('src');
        if (img_src.indexOf('noimage.gif') != -1) {
          this._mark_for_removal(item);
          continue;
        }

        // @TODO replace with O(1)
        if (photos.indexOf(img_src) != -1) {
          this._mark_for_removal(item);
          continue;
        }
        
        img.setAttribute('src', img_src.replace('/320x240/', '/640x480/')); // make it large.
        
        item.innerHTML += '<span class="item-rem">' + this.locale.translate('hide') + '</span>';
        item.getElementsByTagName('a')[0].innerHTML += '<span class="arrow-left" id_counter="' + id_counter + '"></span>';
        item.getElementsByTagName('a')[0].innerHTML += '<span class="arrow-right" id_counter="' + id_counter + '"></span>';

        var url: string = 'https://999.md' + href;
        this.parse(id_counter, url);
        
        photos.push(img_src);
        id_counter++;        
      }

      this._remove_marked();
      this.handle_click_events();
    }

    filter_table_list_items(): void {
      var table: Element = document.getElementsByClassName('ads-list-table')[0];
      var trs: NodeListOf<HTMLElement> = table.getElementsByTagName('tr');

      for (var i: number = 0, len: number = trs.length; i < len; i++) {
        var tr: HTMLElement = trs[i];

        if (tr.getElementsByClassName('ads-list-table-price')[0].innerHTML.trim().length == 0) {
          this._mark_for_removal(tr);
          continue;
        }

        var id: string = this._get_item_id(tr);
        if (this.storage.is_hidden(id)) {
          this._mark_for_removal(tr);
          continue;
        }

        var tooltip_icon: Element = tr.getElementsByClassName('js-tooltip-photo')[0];
        if (tooltip_icon) {
          var tooltip_src : string = tooltip_icon.getAttribute('data-image').replace('/160x120/', '/320x240/');
          tooltip_icon.setAttribute('data-image', tooltip_src);
        }
      }

      this._remove_marked();
    }

    filter_lists() : void {
      if (window.location.href.indexOf('/real-estate/') == -1) return; // this should only work for real estate.
      if (document.getElementsByClassName('ads-list-table').length) {
        this.filter_table_list_items();
      }

      if (document.getElementsByClassName('ads-list-photo-item').length) {
        this.filter_thumbs_list_items();
      }
    }

    profile_page() {
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
          var id: string = self._get_item_id(item);
          self.storage.add_one_hidden(id);
          self._fade_out(item as HTMLElement);
        }
      }

      user_header[0].innerHTML += '<span class="ban-items">Hide all from user</span>';

      var ban_btn: Element = user_header[0].getElementsByClassName('ban-items')[0];
      ban_btn.addEventListener("click", btn_click_handler);
    }

    add_links_to_menu() {
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

      var hidden: SkipIDs = this.storage.get_all_hidden();

      ul.innerHTML = '<span class="unhide-all">unhide all</span>';
      var props: string[] = Object.getOwnPropertyNames(hidden);
      for (var i: number = 0, len: number = props.length; i < len; i++) {
        var item: string = props[i];
        var item_str: string = '<li class="hidden-item">ID: ' + item + ' <a href="http://999.md/' + self.lang + '/' + item + '">link</a>';
        item_str += '<span class="unhide" data-id="' + item + '">unhide</span></li>'
        ul.innerHTML += item_str;
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
          self.storage.remove_all_hidden();
          fadeAllHidden();
        } else if (target.classList.contains('unhide')) {
          self.storage.remove_from_hidden(target.getAttribute('data-id'));
          self._fade_out(target.parentNode as HTMLElement);
        }
      }

      ul.addEventListener('click', ul_click_handler);

    }

    on_window_loaded() {
      const self = this;
      window.addEventListener('load', function() {
        const cookie: any = document.cookie;
        const n: number = cookie.indexOf('simpalsid.lang=');
        if (n != -1) {
          const lang_code: string = cookie.slice(n + 15).slice(0, 2);
          self.lang = lang_code;
          self.locale.language = lang_code;
        }

        self.add_links_to_menu();
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
      this.filter_lists();
      this.profile_page();
      this.show_hidden_page();
    }
  }


  /* Init 999 подорожник */
  const helper: NineNineNinePlus = new NineNineNinePlus();

})();