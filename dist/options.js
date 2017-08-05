"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var taggle_1 = require("./libs/taggle");
var default_sellers = [
    'imobil', 'chirie', 'gazda', 'globalprim-const', 'globalprim', 'rentapartment',
    'anghilina', 'goodtime', 'caseafaceri', 'dom-solutions', 'euroval-cons', 'chirii',
    'apppel', 'apartamentul-tau', 'platondumitrash', 'classapartment', 'vladasimplu123',
    'casaluminoasa', 'nighttime', 'exfactor', 'acces', 'abicom', 'ivan-botanika', 'imobio'
];
var status_el = document.getElementById('status');
var timer;
var resellers_taggle;
var approved_taggle;
function approved_to_obj(approved) {
    var approved_obj = {};
    approved.forEach(function (el) {
        approved_obj[el] = true;
    });
    return approved_obj;
}
function obj_to_approved(obj) {
    var props = Object.getOwnPropertyNames(obj);
    return props;
}
function save_options() {
    var resellers = resellers_taggle.getTags().values;
    var approved = approved_taggle.getTags().values;
    chrome.storage.sync.set({
        resellersList: resellers,
        approvedList: approved_to_obj(approved)
    }, function () {
        clearTimeout(timer);
        status_el.textContent = 'Options saved.';
        timer = setTimeout(function () {
            status_el.textContent = '';
        }, 1000);
    });
}
function restore_options() {
    chrome.storage.sync.get({
        resellersList: default_sellers,
        approvedList: []
    }, function (items) {
        resellers_taggle = new taggle_1.Taggle('resellers_taggle', {
            tags: items.resellersList || [],
            onTagAdd: save_options,
            onTagRemove: save_options
        });
        var approved = obj_to_approved(items.approvedList);
        if (obj_to_approved(items.approvedList).length) {
            approved_taggle = new taggle_1.Taggle('approved_taggle', {
                tags: obj_to_approved(items.approvedList),
                onTagAdd: save_options,
                onTagRemove: save_options
            });
        }
        else {
            approved_taggle = new taggle_1.Taggle('approved_taggle', {
                onTagAdd: save_options,
                onTagRemove: save_options
            });
        }
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
