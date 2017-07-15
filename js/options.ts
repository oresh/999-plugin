// Saves options to chrome.storage
function save_options() {
  var color_el = document.getElementById('color') as HTMLInputElement;
  var links_el = document.getElementById('like') as HTMLInputElement;
  var color = color_el.value;
  var likesColor = links_el.checked;

  chrome.storage.sync.set({
    favoriteColor: color,
    likesColor: likesColor
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    favoriteColor: 'red',
    likesColor: true
  }, function(items) {
    var color_el = document.getElementById('color') as HTMLInputElement;
    var links_el = document.getElementById('like') as HTMLInputElement;
    color_el.value = items.favoriteColor;
    links_el.checked = items.likesColor;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);