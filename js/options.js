function save_options() {
    var color_el = document.getElementById('color');
    var links_el = document.getElementById('like');
    var color = color_el.value;
    var likesColor = links_el.checked;
    chrome.storage.sync.set({
        favoriteColor: color,
        likesColor: likesColor
    }, function () {
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}
function restore_options() {
    chrome.storage.sync.get({
        favoriteColor: 'red',
        likesColor: true
    }, function (items) {
        var color_el = document.getElementById('color');
        var links_el = document.getElementById('like');
        color_el.value = items.favoriteColor;
        links_el.checked = items.likesColor;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
