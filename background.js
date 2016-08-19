function sendUpdate(tab, disabled) {
  console.log(tab.url);
  console.log(disabled);
  chrome.tabs.sendMessage(tab.id, {type: 'toggle', disabled: disabled});
}

function updateDisabled(tab) {
  chrome.storage.local.get(['disabled', 'exclude'], function(data) {
    var disabled = !!data.disabled;
    var exclude = data.exclude;
    if (!disabled && Array.isArray(exclude)) {
      exclude.forEach(function (n) {
	var match = false;
	switch (n.method) {
	  case 'starts_with':
	    match = tab.url.startsWith(n.url);
	    break;
	  case 'ends_with':
	    match = tab.url.endsWith(n.url);
	    break;
	  case 'regex':
	    var regex = new RegExp(n.url);
	    match = regex.test(tab.url);
	    break;
	}
	if (match) {
	  disabled = true;
	}
      });
    }
    if (disabled) {
      chrome.browserAction.setIcon({path: './icon_disabled.png'});
    } else {
      chrome.browserAction.setIcon({path: './icon.png'});
    }
    sendUpdate(tab, disabled);
  });
}

chrome.storage.local.get(['disabled'], function(data) {
  if (!!data.disabled) {
    chrome.browserAction.setIcon({path: './icon_disabled.png'});
  } else {
    chrome.browserAction.setIcon({path: './icon.png'});
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'toggle') {
    chrome.tabs.getSelected(function(tab) {
      updateDisabled(tab);
    });
  }
});

chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
  if (info.status === 'loading' && tab.url) {
    updateDisabled(tab);
  }
});

chrome.tabs.onActivated.addListener(function(info) {
  chrome.tabs.getSelected(function(tab) {
    if (tab.url) {
      updateDisabled(tab);
    }
  });
});
