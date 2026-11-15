(function () {
  document.body.classList.remove('no-js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Theme toggle
  var btn = document.getElementById('themeToggle');
  btn.addEventListener('click', function () {
    var root = document.documentElement;
    var current = root.getAttribute('data-theme');
    var isDark = current ? current === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    var next = isDark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // Reading progress
  var bar = document.getElementById('progress');
  var ticking = false;
  function updateProgress() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? h.scrollTop / max : 0) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  updateProgress();

  // Reveal once
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    reveals.forEach(function (el) { ro.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // Statement: words light up one by one
  document.querySelectorAll('[data-words]').forEach(function (p) {
    var words = p.textContent.trim().split(/\s+/);
    p.textContent = '';
    words.forEach(function (w, i) {
      var s = document.createElement('span');
      s.className = 'w';
      s.textContent = w;
      p.appendChild(s);
      if (i < words.length - 1) p.appendChild(document.createTextNode(' '));
    });
    if (reduce || !('IntersectionObserver' in window)) {
      p.querySelectorAll('.w').forEach(function (s) { s.classList.add('on'); });
      return;
    }
    var wo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('on'); wo.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -35% 0px' });
    p.querySelectorAll('.w').forEach(function (s) { wo.observe(s); });
  });

  // TOC highlight
  var links = Array.prototype.slice.call(document.querySelectorAll('.toc-side .toc a'));
  var map = {};
  links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && map[e.target.id]) {
          links.forEach(function (a) { a.classList.remove('active'); a.removeAttribute('aria-current'); });
          map[e.target.id].classList.add('active');
          map[e.target.id].setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) so.observe(el); });
  }

  // Inline TOC closes after navigation on mobile
  document.querySelectorAll('.toc-inline a').forEach(function (a) {
    a.addEventListener('click', function () { a.closest('details').removeAttribute('open'); });
  });

  // Contact e-mail is assembled here so that simple address harvesters do not see it in the HTML
  document.querySelectorAll('[data-mail]').forEach(function (el) {
    var parts = el.getAttribute('data-mail').split('|');
    var addr = parts[0] + '@' + parts[1];
    el.setAttribute('href', 'mailto:' + addr);
    if (el.hasAttribute('data-mail-text')) el.textContent = addr;
  });

  // Copy citation
  var copyBtn = document.getElementById('copyCite');
  var status = document.getElementById('copyStatus');
  copyBtn.addEventListener('click', function () {
    var text = document.getElementById('citeText').textContent;
    function done(ok) { var ru = document.documentElement.lang === 'ru'; status.textContent = ok ? (ru ? 'Скопировано' : 'Copied') : (ru ? 'Не удалось скопировать. Выделите текст вручную.' : 'Copy failed. Select the text manually.'); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
    } else { done(false); }
  });
})();
