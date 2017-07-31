"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Resellers = (function () {
    function Resellers() {
        var self = this;
        self.defaults = [
            'imobil', 'chirie', 'gazda', 'globalprim-const', 'globalprim', 'rentapartment',
            'anghilina', 'goodtime', 'caseafaceri', 'dom-solutions', 'euroval-cons', 'chirii',
            'apppel', 'apartamentul-tau', 'platondumitrash', 'classapartment', 'vladasimplu123',
            'casaluminoasa', 'nighttime', 'exfactor', 'acces', 'abicom', 'ivan-botanika', 'imobio'
        ];
        chrome.storage.sync.get({
            resellersList: self.defaults,
            approvedList: []
        }, function (items) {
            self.nonresellers = items.approvedList;
            self.resellers = items.resellersList;
            self.resellers_len = self.resellers.length;
        });
    }
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
        var name = nameElement.getElementsByTagName('dd')[0].innerText.toLowerCase();
        name = name.replace(/\s+/g, '');
        if (this.nonresellers.indexOf(name) != -1) {
            return false;
        }
        if (nameElement.classList.contains('is-verified')) {
            return true;
        }
        if (name.replace(/[0-9]/g, '').length == 0) {
            return true;
        }
        for (var i = 0; i < this.resellers_len; i++) {
            if (name.indexOf(this.resellers[i]) != -1) {
                return true;
            }
        }
        return false;
    };
    return Resellers;
}());
exports.Resellers = Resellers;
