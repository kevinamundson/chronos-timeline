window.addEventListener('DOMContentLoaded', function () {
  var ui = new PagefindUI({ element: '#search', showSubResults: true, showImages: false, resetStyles: false });
  var q = new URLSearchParams(location.search).get('q');
  if (q) { ui.triggerSearch(q); var h = document.getElementById('q'); if (h) h.value = q; }
});
