"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LocalStorageHidden = (function () {
    function LocalStorageHidden() {
        this.storage_name = "999_skips_obj";
        this.all_hidden = this.get_all_hidden();
    }
    LocalStorageHidden.prototype.get_all_hidden = function () {
        return JSON.parse(localStorage.getItem(this.storage_name)) || {};
    };
    LocalStorageHidden.prototype.save_all_hidden = function (ids) {
        this.all_hidden = ids;
        localStorage.setItem(this.storage_name, JSON.stringify(ids));
    };
    LocalStorageHidden.prototype.add_one_hidden = function (id) {
        var hidden = this.get_all_hidden();
        hidden[id] = true;
        this.save_all_hidden(hidden);
        return id;
    };
    LocalStorageHidden.prototype.remove_from_hidden = function (id) {
        var hidden = this.all_hidden;
        delete (hidden[id]);
        this.save_all_hidden(hidden);
        return hidden;
    };
    LocalStorageHidden.prototype.remove_all_hidden = function () {
        localStorage.setItem(this.storage_name, '{}');
    };
    LocalStorageHidden.prototype.is_hidden = function (id) {
        return this.all_hidden[id] != undefined;
    };
    return LocalStorageHidden;
}());
exports.LocalStorageHidden = LocalStorageHidden;
