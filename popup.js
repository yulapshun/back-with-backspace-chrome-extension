var disableToggle = document.querySelector('#disable-toggle');
var excludeBtn = document.querySelector('#exclude-btn');
var excludeSelect = document.querySelector('#exclude-select');
var excludeUrl = document.querySelector('#exclude-url');
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
  disabled = !!data.disabled;
  updateDisableToggle();
});

chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
  var url = tabs[0].url;
  var parser = document.createElement('a');
  parser.href = url;
  excludeUrl.value = parser.protocol + '//' + parser.hostname + '/';
});

disableToggle.addEventListener('click', function() {
  disabled = !disabled;
  chrome.storage.local.set({'disabled': disabled}, function() {
    updateDisableToggle();
  });
});

excludeBtn.addEventListener('click', function() {
  var method = excludeSelect.value;
  var url = excludeUrl.value;

  if (method === 'regex') {
    try {
      new RegExp(url);
    } catch (e) {
      if (e.name === 'SyntaxError') {
	console.log('invalid-regex');
	return;
      }
    }
  }

  chrome.storage.local.get('exclude', function(data) {
    console.log(data);
    if (Array.isArray(data.exclude)) {
      data.exclude.push({
	method: method,
	url: url
      });
    } else {
      data.exclude = [{
	method: method,
	url: url
      }];
    }
    chrome.storage.local.set({'exclude': data.exclude});
  });
});
