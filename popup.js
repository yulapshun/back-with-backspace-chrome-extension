var disableToggle = document.querySelector('#disable-toggle');
var excludeBtn = document.querySelector('#exclude-btn');
var excludeSelect = document.querySelector('#exclude-select');
var excludeUrl = document.querySelector('#exclude-url');
var excludedList = document.querySelector('#excluded-list');
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

function updateExcludedList() {
  chrome.storage.local.get('exclude', function(data) {
    excludedList.innerHTML = '';
    var exclude = data.exclude || [];
    exclude.forEach(function(n, i) {
      var excludedUrl = document.createElement('div');
      var removeBtn = document.createElement('span');

      removeBtn.className = 'excluded-remove-btn';
      removeBtn.addEventListener('click', function() {
	exclude.splice(i, 1);
	chrome.storage.local.set({'exclude': exclude}, function() {
	  updateExcludedList();
	});
      });

      excludedUrl.className = 'excluded-url';
      switch (n.method) {
	case 'starts_with':
	  excludedUrl.innerHTML = n.url + '*';
	  break;
	case 'ends_with':
	  excludedUrl.innerHTML = '*' + n.url;
	  break;
	case 'regex':
	  excludedUrl.innerHTML = n.url;
	  break;
      }

      excludedUrl.appendChild(removeBtn);

      excludedList.appendChild(excludedUrl);
    });
  });
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

updateExcludedList();

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
    var excludedObj = {
      method: method,
      url: url
    };
    if (Array.isArray(data.exclude)) {
      data.exclude.push(excludedObj);
    } else {
      data.exclude = [excludedObj];
    }
    chrome.storage.local.set({'exclude': data.exclude}, function() {
      updateExcludedList();
    });
  });
});
