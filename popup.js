var disableDisplay = document.querySelector('#disable-display');
var disableToggle = document.querySelector('#disable-toggle');
var excludeBtn = document.querySelector('#exclude-btn');
var excludeSelect = document.querySelector('#exclude-select');
var excludeUrl = document.querySelector('#exclude-url');
var excludedUrlDivider = document.querySelector('#excluded-url-divider');
var excludedUrlHeading = document.querySelector('#excluded-url-heading');
var excludedList = document.querySelector('#excluded-list');
var disabled = false;

function updateDisableToggle() {
  if (disabled) {
    disableDisplay.innerHTML = 'disabled';
    disableToggle.innerHTML = 'Enable';
    disableToggle.className = 'disabled';
  } else {
    disableDisplay.innerHTML = 'enabled';
    disableToggle.innerHTML = 'Disable';
    disableToggle.className = 'enabled';
  }
}

function updateExcludedList() {
  chrome.storage.local.get('exclude', function(data) {
    excludedList.innerHTML = '';
    var exclude = data.exclude || [];
    if (exclude.length === 0) {
      excludedUrlDivider.className += ' hidden';
      excludedUrlHeading.className += ' hidden';
    } else {
      excludedUrlDivider.className = excludedUrlDivider.className.replace(' hidden', '');
      excludedUrlHeading.className = excludedUrlHeading.className.replace(' hidden', '');
    }
    exclude.forEach(function(n, i) {
      var excludedUrl = document.createElement('div');
      var label = document.createElement('span');
      var removeBtn = document.createElement('span');

      label.className = 'excluded-label';

      removeBtn.className = 'excluded-remove-btn';
      removeBtn.addEventListener('click', function() {
	exclude.splice(i, 1);
	chrome.storage.local.set({'exclude': exclude}, function() {
	  updateExcludedList();
	  updateContent();
	});
      });

      excludedUrl.className = 'excluded-url';
      switch (n.method) {
	case 'starts_with':
	  label.innerHTML = 'Starts with';
	  excludedUrl.innerHTML = n.url;
	  break;
	case 'ends_with':
	  label.innerHTML = 'Ends with';
	  excludedUrl.innerHTML = n.url;
	  break;
	case 'regex':
	  label.innerHTML = 'RegExp';
	  excludedUrl.innerHTML = n.url;
	  break;
      }

      excludedUrl.insertBefore(label, excludedUrl.firstChild);
      excludedUrl.appendChild(removeBtn);

      excludedList.appendChild(excludedUrl);
    });
  });
}

function updateContent() {
  chrome.runtime.sendMessage({type: 'toggle'});
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
    updateContent();
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
      updateContent();
    });
  });
});
