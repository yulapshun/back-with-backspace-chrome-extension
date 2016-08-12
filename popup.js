var disableToggle = document.querySelector('#disable-toggle');
var disabled = false;

function updateDisableToggle() {
  if (disabled) {
    disableToggle.innerHTML = 'Enable';
    disableToggle.className = 'disabled';
    chrome.browserAction.setIcon({path: './icon_disabled.png'});
  } else {
    disableToggle.innerHTML = 'Disable';
    disableToggle.className = 'enabled';
    chrome.browserAction.setIcon({path: './icon.png'});
  }
}

chrome.storage.local.get('disabled', function(data) {
  disabled = data.disabled;
  updateDisableToggle();
});

disableToggle.addEventListener('click', function() {
  disabled = !disabled;
  chrome.storage.local.set({'disabled': disabled}, function() {
    updateDisableToggle();
  });
});
