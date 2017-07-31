import { Resellers } from './reseller';
import { Locale } from './locale';

export interface PostResponse {
  photos: string[];
  title: string;
  credit: boolean;
  is_reseller: boolean;
}

export class ResponseParser {
  public resellers: Resellers;
  public locale: Locale;

  constructor(locale) {
    this.resellers = new Resellers();
    this.locale = locale;
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
}