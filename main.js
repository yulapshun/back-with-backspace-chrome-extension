(function() {

  var disable = true;

  chrome.storage.local.get(['disabled', 'exclude'], function(data) {
    disabled = !!data.disabled;
    var exclude = data.exclude;
    if (Array.isArray(exclude)) {
      exclude.forEach(function (n) {
	var match = false;
	switch (n.method) {
	  case 'starts_with':
	    match = n.url.startsWith(window.location.href);
	    break;
	  case 'ends_with':
	    match = n.url.sWith(window.location.href);
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
})();
