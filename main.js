window.addEventListener('keydown', function(e) {
  if (e.keyCode === 8) {
    var focus = document.querySelectorAll(':focus');
    if (focus && focus.length > 0) {
      history.back();
    } 
  }
});
