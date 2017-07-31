// Saves options to chrome.storage
const default_sellers: string[] = [
  'imobil','chirie','gazda','globalprim-const','globalprim','rentapartment',
  'anghilina','goodtime','caseafaceri','dom-solutions','euroval-cons','chirii',
  'apppel','apartamentul-tau','platondumitrash','classapartment','vladasimplu123',
  'casaluminoasa','nighttime','exfactor','acces','abicom','ivan-botanika','imobio'
];

const resellers_el: HTMLTextAreaElement = document.getElementById('resellers') as HTMLTextAreaElement;
const approved_sellers_el: HTMLTextAreaElement = document.getElementById('approved') as HTMLTextAreaElement;
const status_el: HTMLElement = document.getElementById('status');

resellers_el.addEventListener('keyup', save_options);
approved_sellers_el.addEventListener('keyup', save_options);

var timer;

function save_options() {
  let resellers: string = resellers_el.value;
  let approved: string = approved_sellers_el.value;

  chrome.storage.sync.set({
    resellersList: resellers.split('\n'),
    approvedList: approved.split('\n')
  }, function() {

    status_el.textContent = '';
    clearTimeout(timer);
    // Update status to let user know options were saved.
    timer = setTimeout(function() {
      status_el.textContent = 'Options saved.';
    }, 1500);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    resellersList: default_sellers,
    approvedList: ''
  }, function(items) {
    resellers_el.value = items.resellersList.join('\n');
    approved_sellers_el.value = items.approvedList.join('\n');
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
