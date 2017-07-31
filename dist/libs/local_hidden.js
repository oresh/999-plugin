"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LocalStorageHidden = (function () {
    function LocalStorageHidden() {
        this.storage_name = "999_skips";
    }
    LocalStorageHidden.prototype.get_all_hidden = function () {
        return JSON.parse(localStorage.getItem(this.storage_name)) || [];
    };
    LocalStorageHidden.prototype.save_all_hidden = function (ids) {
        localStorage.setItem(this.storage_name, JSON.stringify(ids));
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
