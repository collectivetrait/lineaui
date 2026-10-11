(function() {
  try {
    var t = localStorage.getItem("ln:theme");
    if (t === "light" || t === "dark") {
      document.documentElement.dataset.theme = t;
    }
  } catch(e) {}
})();
