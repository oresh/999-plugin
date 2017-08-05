/**
 * make nonresellers check O(1);
 */

export interface NonResellers {
  [key: string]: boolean
}

export class Resellers {
  public defaults: string[];
  public nonresellers: NonResellers;
  public resellers_len: number;
  public resellers: string[];

  constructor() {
    let self = this;
    self.defaults = [
      'imobil','chirie','gazda','globalprim-const','globalprim','rentapartment',
      'anghilina','goodtime','caseafaceri','dom-solutions','euroval-cons','chirii',
      'apppel','apartamentul-tau','platondumitrash','classapartment','vladasimplu123',
      'casaluminoasa','nighttime','exfactor','acces','abicom','ivan-botanika','imobio'
    ];

    chrome.storage.sync.get({
      resellersList: self.defaults,
      approvedList: []
    }, function(items) {
      self.nonresellers = items.approvedList;
      self.resellers = items.resellersList;
      self.resellers_len = self.resellers.length;
    });
  }

  add_to_local(name): void {
    this.resellers.push(name);
    this.save_to_local();
  }

  remove_from_local(name) : void {
    const id_index: number = this.resellers.indexOf(name);
    if (id_index != -1) {
      this.resellers.splice(id_index, 1);
      this.save_to_local();
    }
  }

  save_to_local(): void {
    localStorage.setItem("999_resellers", JSON.stringify(this.resellers));
  }

  is_reseller(el): boolean {
    let nameElement: HTMLElement = el.getElementsByClassName('adPage__header__stats__owner')[0];
    let name: string = nameElement.getElementsByTagName('dd')[0].innerText.toLowerCase();
    name = name.replace(/\s+/g, ''); // strip spaces

    if (this.nonresellers[name] != undefined) {
      return false; // break if user is approved.
    }
    if (nameElement.classList.contains('is-verified')) {
      return true; // verified user
    }
    if (name.replace(/[0-9]/g,'').length == 0) {
      return true; // all numbers
    }

    for (let i: number = 0; i < this.resellers_len; i++) {
      if (name.indexOf(this.resellers[i]) != -1) {
        return true; // name matches with resellers
      }
    }

    return false;
  }
}
