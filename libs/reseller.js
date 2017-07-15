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
