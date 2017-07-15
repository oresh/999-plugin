export class Resellers {
  public defaults: string[];
  public nonresellers: string[];
  public resellers_len: number;
  public resellers: string[];

  constructor() {
    this.defaults = [
      'imobil','chirie','gazda','globalprim-const','globalprim','rentapartment',
      'anghilina','goodtime','caseafaceri','dom-solutions','euroval-cons','chirii',
      'apppel','apartamentul-tau','platondumitrash','classapartment','vladasimplu123',
      'casaluminoasa','nighttime','exfactor','acces','abicom','ivan-botanika','imobio'
    ];
    this.nonresellers = this.get_nonresellers_from_local();
    this.resellers = this.get_resellers_from_local();
    this.resellers_len = this.resellers.length;
  }

  get_resellers_from_local(): string[] {
    return JSON.parse(localStorage.getItem("999_resellers")) || this.defaults;
  }

  get_nonresellers_from_local(): string[] {
    return JSON.parse(localStorage.getItem("999_nonresellers")) || [];
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
    //if ()
    let nameElement: HTMLElement = el.getElementsByClassName('adPage__header__stats__owner')[0];
    if (nameElement.classList.contains('is-verified')) {
      console.log(nameElement.getElementsByTagName('dd')[0].innerText.toLowerCase(), ' is verified');
      return true;
    }
    let name: string = nameElement.getElementsByTagName('dd')[0].innerText.toLowerCase();
    console.log('name:' , name);
    if (name.replace(/[0-9]/g,'').length == 0) {
      console.log('is reseller');
      return true; // all numbers
    }

    for (let i: number = 0; i < this.resellers_len; i++) {
      if (name.indexOf(this.resellers[i]) != -1) {
        console.log('is reseller');
        return true;
      }
    }

    console.log('is NOT reseller');
    return false;
  }
}
