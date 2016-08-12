window.addEventListener('keydown', function(e) {
  if (e.keyCode === 8) {
    var focus = document.querySelectorAll(':focus');
    var focused = focus && (focus.length > 0);
    chrome.storage.local.get('disabled', function(data) {
      disabled = data.disabled;
      if (!!focused || disabled) {
	return;
      }
      history.back();
    });
  }
});
