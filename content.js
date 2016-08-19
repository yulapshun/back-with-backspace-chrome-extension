(function() {

  var disabled = true;

  function updateDisabled() {
    chrome.storage.local.get(['disabled', 'exclude'], function(data) {
      disabled = !!data.disabled;
      var exclude = data.exclude;
      if (!disabled && Array.isArray(exclude)) {
	exclude.forEach(function (n) {
	  var match = false;
	  switch (n.method) {
	    case 'starts_with':
	      match = window.location.href.startsWith(n.url);
	      break;
	    case 'ends_with':
	      match = window.location.href.endsWith(n.url);
	      break;
	    case 'regex':
	      var regex = new RegExp(n.url);
	      match = regex.test(window.location.href);
	      break;
	  }
	  if (match) {
	    disabled = true;
	  }
	});
      }
    });
  }

  updateDisabled();

  window.addEventListener('keydown', function(e) {
    if (e.keyCode === 8) {
      var focus = document.querySelectorAll(':focus');
      var focused = focus && (focus.length > 0);
      chrome.storage.local.get('disabled', function(data) {
	if (!!focused || disabled) {
	  return;
	}
	history.back();
      });
    }
  });

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type == 'toggle') {
      disabled = !!request.disabled;
    }
  });
})();
