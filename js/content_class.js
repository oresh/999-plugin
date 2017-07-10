(function() {

  class Locale {
    constructor(lang) {
      if (!lang) lang = 'ru';
      this.lang = lang;
      this.words = {};
      this.words['ru'] = this.get_ru_words();
      this.words['ro'] = this.get_ro_words();
    }

    set_lang(lang) {
      this.lang = lang;
    }

    get_ru_words() {
      return {
        'hidden' : 'спрятанное',
        'hide' : 'спрятать',
        'room' : 'комната',
        'rooms' : 'комнаты',
        '5rooms' : 'комнат',
        'history' : 'история',
        'agency' : 'агентство'
      }
    }

    get_ro_words() {
      return {
        'hidden' : 'ascuns',
        'hide' : 'ascunde',
        'room' : 'camera',
        'rooms' : 'camere',
        '5rooms' : 'camere',
        'history' : 'istoria',
        'agency' : 'agentie'
      }
    }

    t(str) {
      return this.words[this.lang][str] || str;
    }
  }

  class Resellers {
    constructor() {
      // all "imobil" matches and 
      this.defaults = [
        'imobil','globalprim-const','globalprim','rentapartment',
        'anghilina','goodtime','caseafaceri','dom-solutions','euroval-cons',
        'apppel','apartamentul-tau','platondumitrash','classapartment',
        'casaluminoasa','nighttime','exfactor','acces'
      ];
      this.nonresellers = this.get_nonresellers_from_local();
      this.resellers = this.get_resellers_from_local();
      this.resellers_len = this.resellers.length;
    }

    get_resellers_from_local() {
      return JSON.parse(localStorage.getItem("999_resellers")) || this.defaults;
    }

    get_nonresellers_from_local() {
      return JSON.parse(localStorage.getItem("999_nonresellers")) || [];
    }

    add_to_local(name) {
      this.resellers.push(name);
      this.save_to_local();
    }

    remove_from_local(name) {
      var id_index = this.resellers.indexOf(name);
      if (id_index != -1) {
        this.resellers.splice(id_index, 1);
        this.save_to_local();
      }
    }

    save_to_local(resellers) {
      localStorage.setItem("999_resellers", JSON.stringify(this.resellers));
    }

    is_reseller(el) {
      var name = el.getElementsByClassName('adPage__header__stats__owner')[0].getElementsByTagName('dd')[0].innerText.toLowerCase();
      if ()
      if (name.replace(/[0-9]/g,'').length == 0) return true; // all numbers

      for (var i = 0; i < this.resellers_len; i++) {
        if (name.indexOf(this.resellers[i]) != -1) return true;
      }

      return false;
    }
  }

  class LocalStorageHidden {
    get_all_hidden() {
      return JSON.parse(localStorage.getItem("999_skips")) || [];
    }

    save_all_hidden(ids) {
      return localStorage.setItem("999_skips", JSON.stringify(ids));
    }

    add_one_hidden(id) {
      var hidden = this.get_all_hidden();
      hidden.push(id);
      this.save_all_hidden(hidden);
      return id;
    }

    remove_from_hidden(id) {
      var hidden = this.get_all_hidden();
      var id_index = hidden.indexOf(id);
      if (id_index != -1) {
        hidden.splice(id_index, 1);
        this.save_all_hidden(hidden);
        return hidden;
      }
    }

    is_hidden() {
      var hidden = this.get_all_hidden();
      return function(id) {
        return hidden.indexOf(id) != -1;
      }
    }
  }

  class WebSQLWorker {
    constructor() {
      var db = openDatabase('mydb', '1.0', '999 local cache', 2 * 1024 * 1024);
      db.transaction(function (tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS pages (url unique, data)');
      });

      this.db = db;
    }

    find_url(url, cb) {
      this.db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM pages WHERE url = ?', [url], function (tx, results) {
          if (results.rows.length) {
            cb(JSON.parse(results.rows.item(0).data));
          } else {
            return cb(false);
          }
        });
      });
    }

    delete_url(url) {
      db.transaction(function (tx) {
        tx.executeSql('DELETE FROM pages WHERE url = ?', [url]);
      });
    }

    add_url(url, data) {
      this.db.transaction(function (tx) {
        tx.executeSql('INSERT INTO pages (url, data) VALUES (?, ?)', [url, JSON.stringify(data)]);
      });
    }
  }

  class NineNineNinePlus {

    constructor() {
      this.removal_class = 'marked-for-removal';
      this.photo_galleries = {};
      this._photo_items = null;
      this.observer_config = {
        attributes: true,
        attributeOldValue: true,
        childList: false,
        characterData: false,
        subtree: false,
        characterDataOldValue: false
      };

      this._removeItem = function(el) {
        return el.classList.add(this.removal_class);
      }
      this._remove_marked_elements = function() {
        var remove_el = document.getElementsByClassName(this.removal_class);
        while (remove_el[0]) { remove_el[0].parentNode.removeChild(remove_el[0]); }
      }
      this._get_id = function(el) {
        return el.getElementsByTagName('a')[0].getAttribute('href').split('/')[2];
      }

      this.localstorage_worker = new LocalStorageHidden();
      this.db_worker = new WebSQLWorker();
      this.lang = "ru";
      this.locale = new Locale(this.lang);
      this.resellers = new Resellers();

      this.window_load(); // start stuff
    }

    _fade_out(el) {
      el.style.opacity = 1;
      var last = +new Date();
      var tick = function() {
        el.style.opacity = el.style.opacity - (new Date() - last) / 400;
        last = +new Date();

        if (+el.style.opacity > 0) {
          (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
        } else {
          el.style.display = 'none';
        }
      };
      tick();
    }

    _capitalize_first_letter(string) {
      var s = string.toLowerCase();
      if (!s.length) return s;

      return s[0].toUpperCase()  + s.slice(1).replace(/\ [a-zA-Z0-9_ĂăÂâÎîȘșȚț]/g, l => l.toUpperCase()).trim();
    }

    _get_street_name(name) {
      var words_sep = ['strada', 'str', 'ул', 'улица'];
      var name_split = name.split(' ').filter( _ => words_sep.indexOf(_) < 0);
      var out = name_split.join(' ').replace('str.', '').replace('ул.', '');
      var n = out.search(/[A-Za-z]\.[A-Za-z]/);
      if (n != -1) out = out.slice(0, n + 2) + ' ' + out.slice(n + 2);

      if (out.indexOf(',') != -1) return this._capitalize_first_letter(out.split(',')[0]);
      
      var num = out.search(/\d+/);
      if (num != -1) return this._capitalize_first_letter(out.slice(0, num));

      return this._capitalize_first_letter(out);
    }

    _generate_name(el) {
      var address = el.getElementsByClassName('adPage__content__region')[0].getElementsByTagName('dd');
      var lang = el.getElementsByTagName('h1')[0].getElementsByTagName('a')[0].href.split('999.md/')[1].slice(0, 2);
      var features_col = el.getElementsByClassName('adPage__content__features__col')[0];
      var comodities = features_col.getElementsByClassName('adPage__content__features__key');
      var properties = features_col.getElementsByClassName('adPage__content__features__value');
      var name = [];

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
              room_numb = room_numb[0];
              var room_name = (room_numb == 1) ? 'room' : (room_numb > 4) ? '5rooms' : 'rooms' ;
              name[2] = room_numb + ' ' + this.locale.t(room_name);
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

    _get_photos(el) {
      var photos = [];
      var photo_items = el.getElementsByClassName('adPage__content__photos__item');
      for (var i = 0, len = photo_items.length; i < len; i++) {
        var src = photo_items[i].getElementsByTagName('img')[0].getAttribute('src');
        src = src.replace('/160x120/', '/640x480/');
        photos.push(src);
      }

      return photos;
    }

    _get_credit_info(el) {
      var text = el.getElementsByClassName('adPage__content__description');
      if (text.length) {
        text = text[0].innerText.toLowerCase();
        var words = ['rată', 'in rate', 'rata', 'взнос', 'помесячная', 'ежемесечная'];
        for (var i = 0, len = words.length; i < len; i++) {
          if (text.indexOf(' ' + words[i] + ' ') != -1) {
            return true;
          }
        }
      }

      return false;
    }

    _parse_response(resp) {
      var response = {}
      var el = document.createElement('html');
      el.innerHTML = resp;
      
      response['photos'] = this._get_photos(el);
      response['title'] = this._generate_name(el);
      response['credit'] = this._get_credit_info(el);
      response['is_reseller'] = this.resellers.is_reseller(el);

      return response;
    }

    send_request(url, cb) {
      var self = this;
      var request = new XMLHttpRequest();
      
      request.open('GET', url, true);
      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          var resp = request.responseText;
          resp = self._parse_response(resp);
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

    init_parses(id_counter, url) {
      var self = this;
      var cb = function(res) {
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
          self._photo_items[id_counter].getElementsByClassName('ads-list-photo-item-price')[0].innerHTML += '<span class="from-reseller">' + self.locale.t('agency') + '</span>';
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

    click_listener() {
      var self = this;
      var _click_handler = function(e) {
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
            photos.unshift(last_photo); // place the last in the beginning;
          } else {
            var first_photo = photos.shift();
            photos.push(first_photo); // place the first in the end;
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
    }

    start_thumbs_cleaner() {
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
        if (item == undefined) break;

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
        
        img.setAttribute('src', img_src.replace('/320x240/', '/640x480/')); // make it large.
        
        item.innerHTML += '<span class="item-rem">' + this.locale.t('hide') + '</span>';
        item.getElementsByTagName('a')[0].innerHTML += '<span class="arrow-left" id_counter="' + id_counter + '"></span>';
        item.getElementsByTagName('a')[0].innerHTML += '<span class="arrow-right" id_counter="' + id_counter + '"></span>';

        var url = 'https://999.md' + item.getElementsByTagName('a')[0].getAttribute('href');
        this.init_parses(id_counter, url);
        
        photos.push(img_src);
        id_counter++;        
      }

      this._remove_marked_elements();
      this.click_listener();
    }

    start_table_cleaner() {
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
    }

    start_cleaners() {
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
      var user_header = document.getElementsByClassName('user-profile-header');
      if (!document.getElementsByClassName('user-profile-header').length) {
        return;  
      }

      var btn_click_handler = function(e) {
        var items = document.getElementsByClassName('profile-ads-list-photo-item');
        for (var i = 0, len = items.length; i < len; i++) {
          var item = items[i];
          var id = self._get_id(item);
          self.localstorage_worker.add_one_hidden(id);
          self._fade_out(item);
        }
      }

      user_header[0].innerHTML += '<span class="ban-items">Hide all from user</span>';

      var ban_btn = user_header[0].getElementsByClassName('ban-items')[0];
      ban_btn.addEventListener("click", btn_click_handler);
    }

    add_links() {
      var nav = document.getElementsByClassName('header_menu_nav');
      if (nav.length) {
        nav = nav[0].getElementsByTagName('ul')[0];
        nav.innerHTML = '<li><a href="https://999.md/my-hidden">' + this.locale.t('hidden') + '</a></li>' + 
        '<li><a href="https://999.md/cabinet/user-history">' + this.locale.t('history') + '</a></li>' + nav.innerHTML;
      }
    }

    show_hidden_page() {

      if (window.location.href != "https://999.md/my-hidden") return;

      var self = this;
      var error = document.getElementsByClassName('error-404-page')[0];
      error.parentNode.removeChild(error);

      var ul = document.createElement('ul');
      ul.setAttribute('class','list-of-hidden');
      document.getElementsByTagName('body')[0].appendChild(ul);

      var hidden = this.localstorage_worker.get_all_hidden();

      ul.innerHTML = '<span class="unhide-all">unhide all</span>';
      for (var i = 0, len = hidden.length; i < len; i++) {
        ul.innerHTML += '<li class="hidden-item">ID: ' + hidden[i] + ' <a href="http://999.md/' + self.lang + '/' + hidden[i] + '">link</a>';
        ul.innerHTML += '<span class="unhide" data-id="' + hidden[i] + '">unhide</span>';
      }

      var fadeAllHidden = function() {
        var lis = ul.getElementsByTagName('li');
        for (var i = 0, len = lis.length; i < len; i++) {
          self._fade_out(lis[i]);
        }
      }

      var ul_click_handler = function(e) {
        var target = e.target;
        if (target.classList.contains('unhide-all')) {
          localStorage.setItem("999_skips", []);
          fadeAllHidden();
        } else if (target.classList.contains('unhide')) {
          self.localstorage_worker.remove_from_hidden(target.getAttribute('data-id'));
          self._fade_out(target.parentNode);
        }
      }

      ul.addEventListener('click', ul_click_handler);

    }

    window_load() {
      var self = this;
      window.addEventListener('load', function() {
        var cookie = document.cookie;
        var n = cookie.indexOf('simpalsid.lang=');
        if (n != -1) {
          var lang = cookie.slice(n + 15).slice(0, 2);
          self.lang = lang;
          self.locale.set_lang(lang);
        }

        self.add_links();
        self.init();

        var body_element = document.getElementsByTagName('body')[0];

        var observer = new MutationObserver(function(mutations) {
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
  var helper = new NineNineNinePlus();

})();