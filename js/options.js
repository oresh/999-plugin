var default_sellers = [
    'imobil', 'chirie', 'gazda', 'globalprim-const', 'globalprim', 'rentapartment',
    'anghilina', 'goodtime', 'caseafaceri', 'dom-solutions', 'euroval-cons', 'chirii',
    'apppel', 'apartamentul-tau', 'platondumitrash', 'classapartment', 'vladasimplu123',
    'casaluminoasa', 'nighttime', 'exfactor', 'acces', 'abicom', 'ivan-botanika', 'imobio'
];
var resellers_el = document.getElementById('resellers');
var approved_sellers_el = document.getElementById('approved');
var status_el = document.getElementById('status');
resellers_el.addEventListener('keyup', save_options);
approved_sellers_el.addEventListener('keyup', save_options);
var timer;
function save_options() {
    var resellers = resellers_el.value;
    var approved = approved_sellers_el.value;
    chrome.storage.sync.set({
        resellersList: resellers.split('\n'),
        approvedList: approved.split('\n')
    }, function () {
        status_el.textContent = '';
        clearTimeout(timer);
        timer = setTimeout(function () {
            status_el.textContent = 'Options saved.';
        }, 1500);
    });
}
function restore_options() {
    chrome.storage.sync.get({
        resellersList: default_sellers,
        approvedList: ''
    }, function (items) {
        resellers_el.value = items.resellersList.join('\n');
        approved_sellers_el.value = items.approvedList.join('\n');
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
