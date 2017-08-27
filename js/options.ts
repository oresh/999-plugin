/*
 * @TODO
 * make options page select as tags https://sean.is/poppin/tags/
*/

import { Taggle } from './libs/taggle';

export interface NonResellers {
  [key: string]: boolean
}

// Saves options to chrome.storage
const default_sellers: string[] = [
  'imobil','chirie','gazda','globalprim-const','globalprim','rentapartment',
  'anghilina','goodtime','caseafaceri','dom-solutions','euroval-cons','chirii',
  'apppel','apartamentul-tau','platondumitrash','classapartment','vladasimplu123',
  'casaluminoasa','nighttime','exfactor','acces','abicom','ivan-botanika','imobio'
];

const status_el: HTMLElement = document.getElementById('status');

let timer;

let resellers_taggle;
let approved_taggle;

function approved_to_obj(approved): NonResellers {
  let approved_obj: NonResellers = {};
  approved.forEach(function(el) {
    approved_obj[el] = true;
  });
  return approved_obj;
}

function obj_to_approved(obj): string[] {
  let props = Object.getOwnPropertyNames(obj);
  return props;
}

function save_options(): void {
  
  let resellers = resellers_taggle.getTags().values;
  let approved = approved_taggle.getTags().values;

  chrome.storage.sync.set({
    resellersList: resellers,
    approvedList: approved_to_obj(approved)
  }, function() {

    clearTimeout(timer);
    status_el.textContent = 'Options saved.';
    // Update status to let user know options were saved.
    timer = setTimeout(function() {
      status_el.textContent = '';
    }, 1000);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options(): void {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    resellersList: default_sellers,
    approvedList: []
  }, function(items) {

    resellers_taggle = new Taggle('resellers_taggle', {
      tags: items.resellersList || default_sellers,
      onTagAdd: save_options,
      onTagRemove: save_options
    });
    var approved = obj_to_approved(items.approvedList);
    if (obj_to_approved(items.approvedList).length) {
      approved_taggle = new Taggle('approved_taggle', {
        tags: obj_to_approved(items.approvedList),
        onTagAdd: save_options,
        onTagRemove: save_options
      });
    } else {
      approved_taggle = new Taggle('approved_taggle', {
        onTagAdd: save_options,
        onTagRemove: save_options
      });
    }

  });
}

document.addEventListener('DOMContentLoaded', restore_options);
