/* Paper → navy when entering the star map, navy → paper when leaving.
   Skipped entirely when the visitor prefers reduced motion. */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var layer = document.getElementById("nightfall");
  if (!layer) return;
  var canvas = layer.querySelector("canvas");
  var DURATION = 1050;

  function paint() {
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = window.innerWidth;
    var h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    var n = Math.max(28, Math.round((w * h) / 14000));
    for (var i = 0; i < n; i++) {
      var x = Math.random() * w;
      var y = Math.random() * h;
      var r = Math.random() * 1.35 + 0.25;
      ctx.fillStyle = "rgba(220, 179, 76," + (0.4 + Math.random() * 0.6) + ")";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function go(href, mode) {
    if (reduce) {
      window.location.href = href;
      return;
    }
    try {
      paint();
      layer.classList.remove("is-night", "is-dawn", "is-paper");
      layer.classList.add("is-active");
      if (mode === "dawn") layer.classList.add("is-dawn");
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          layer.classList.add(mode === "dawn" ? "is-paper" : "is-night");
        });
      });
      window.setTimeout(function () {
        window.location.href = href;
      }, DURATION);
    } catch (err) {
      window.location.href = href;
    }
  }

  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-nightfall], [data-dawn]");
    if (!el) return;
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    go(el.href, el.hasAttribute("data-dawn") ? "dawn" : "night");
  });
})();
