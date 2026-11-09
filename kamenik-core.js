/* Vinarija Kamenik – zajednička logika (Lenis, GSAP reveal, zavesa, jezik, forme, kucanje čaša) */
(function () {
  if (window.Kamenik) return;
  function bez(x1, y1, x2, y2) {
    var cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    function sx(t) { return ((ax * t + bx) * t + cx) * t; }
    function sy(t) { return ((ay * t + by) * t + cy) * t; }
    return function (x) {
      if (x <= 0) return 0; if (x >= 1) return 1;
      var lo = 0, hi = 1, t = x;
      for (var i = 0; i < 28; i++) { var v = sx(t); if (Math.abs(v - x) < 1e-5) break; if (v < x) lo = t; else hi = t; t = (lo + hi) / 2; }
      return sy(t);
    };
  }
  var K = {
    EO: bez(.23, 1, .32, 1),
    EIO: bez(.77, 0, .175, 1),
    KEY: 'OVDE_KLJUC',
    fine: matchMedia('(hover: hover) and (pointer: fine)').matches,
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    lenis: null,
    _q: [], _ok: false, _seen: {},
    ready: function (cb) { if (K._ok) { try { cb(); } catch (e) { console.warn(e); } } else K._q.push(cb); },
    lang: function () { try { return localStorage.getItem('kamenik-lang') || 'sr'; } catch (e) { return 'sr'; } },
    setLang: function (l) {
      try { localStorage.setItem('kamenik-lang', l); } catch (e) {}
      K.applyLang();
      window.dispatchEvent(new CustomEvent('kamenik:lang', { detail: l }));
    },
    onLang: function (fn) { var h = function (e) { fn(e.detail); }; window.addEventListener('kamenik:lang', h); return function () { window.removeEventListener('kamenik:lang', h); }; },
    applyLang: function () {
      var en = K.lang() === 'en';
      document.documentElement.lang = en ? 'en' : 'sr';
      document.querySelectorAll('[data-en]').forEach(function (el) {
        if (el.dataset.sr === undefined) el.dataset.sr = el.textContent;
        var v = en ? el.dataset.en : el.dataset.sr;
        if (el.textContent !== v) el.textContent = v;
      });
      document.querySelectorAll('[data-en-ph]').forEach(function (el) {
        if (el.dataset.srPh === undefined) el.dataset.srPh = el.getAttribute('placeholder') || '';
        el.setAttribute('placeholder', en ? el.dataset.enPh : el.dataset.srPh);
      });
    },
    lock: function (on) { if (K.lenis) on ? K.lenis.stop() : K.lenis.start(); document.documentElement.style.overflow = on ? 'hidden' : ''; },
    scrollTo: function (t, off) {
      if (typeof t === 'string') t = document.querySelector(t);
      if (!t) return;
      if (K.lenis) K.lenis.scrollTo(t, { offset: off == null ? -10 : off, duration: .8 });
      else window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY + (off == null ? -10 : off), behavior: K.reduced ? 'auto' : 'smooth' });
    },
    fresh: function (sel, root) {
      var set = K._seen[sel] || (K._seen[sel] = new WeakSet());
      return Array.prototype.filter.call((root || document).querySelectorAll(sel), function (el) { if (set.has(el)) return false; set.add(el); return true; });
    },
    scan: function (root) {
      var g = window.gsap, ST = window.ScrollTrigger;
      if (!g || !ST) return;
      var EO = K.EO, EIO = K.EIO;
      if (K.fine) {
        K.fresh('[data-magnetic]', root).forEach(function (w) {
          w.addEventListener('mousemove', function (e) { var r = w.getBoundingClientRect(); g.to(w, { x: (e.clientX - r.left - r.width / 2) * .22, y: (e.clientY - r.top - r.height / 2) * .32, duration: .4, ease: EO }); });
          w.addEventListener('mouseleave', function () { g.to(w, { x: 0, y: 0, duration: .7, ease: EO }); });
        });
        K.fresh('[data-btn]', root).forEach(function (b) {
          var s = b.querySelector('[data-sheen]'), a = b.querySelector('[data-arrow]');
          b.addEventListener('mouseenter', function () { if (s) g.fromTo(s, { xPercent: -120 }, { xPercent: 120, duration: .9, ease: EO }); if (a) g.to(a, { x: 5, duration: .35, ease: EO }); });
          b.addEventListener('mouseleave', function () { if (a) g.to(a, { x: 0, duration: .35, ease: EO }); });
        });
      }
      if (K.reduced) return;
      K.fresh('[data-rv-h]', root).forEach(function (el) {
        g.fromTo(el, { opacity: 0, y: 26, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: EO, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
      });
      K.fresh('[data-rv-img]', root).forEach(function (el) {
        g.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: EIO, scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
        var im = el.querySelector('[data-px]');
        if (im) { g.set(im, { scale: 1.14 }); g.fromTo(im, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }); }
      });
      var cards = K.fresh('[data-rv-card]', root);
      if (cards.length) {
        g.set(cards, { opacity: 0, y: 32 });
        ST.batch(cards, { start: 'top 94%', once: true, onEnter: function (b) { g.to(b, { opacity: 1, y: 0, duration: .9, ease: EO, stagger: .08 }); } });
      }
      K.fresh('[data-count]', root).forEach(function (el) {
        var end = +el.dataset.count, o = { v: 0 };
        el.textContent = '0';
        ST.create({ trigger: el, start: 'top 92%', once: true, onEnter: function () { g.to(o, { v: end, duration: 2.2, ease: EO, onUpdate: function () { el.textContent = Math.round(o.v).toLocaleString('de-DE'); } }); } });
      });
      K.fresh('[data-draw]', root).forEach(function (el) {
        var tr = el.closest('[data-draw-wrap]') || el.parentElement;
        g.fromTo(el, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: tr, start: 'top 65%', end: 'bottom 65%', scrub: true } });
      });
      K.fresh('[data-tl-item]', root).forEach(function (el) {
        var d = el.querySelector('[data-tl-dot]'), c = el.querySelector('[data-tl-card]');
        if (d) g.set(d, { scale: .55, backgroundColor: '#E9E4DA' });
        ST.create({ trigger: el, start: 'top 66%', end: 'max',
          onEnter: function () { if (d) g.to(d, { scale: 1, backgroundColor: '#D9B45B', duration: .3, ease: EO }); if (c) g.to(c, { opacity: 1, duration: .3 }); },
          onLeaveBack: function () { if (d) g.to(d, { scale: .55, backgroundColor: '#E9E4DA', duration: .3, ease: EO }); if (c) g.to(c, { opacity: .45, duration: .3 }); } });
        if (c) g.set(c, { opacity: .45 });
      });
      clearTimeout(K._rt); K._rt = setTimeout(function () { ST.refresh(); }, 200);
    },
    words: function (els, delay) {
      var g = window.gsap; if (!g || K.reduced || !els || !els.length) return;
      g.fromTo(els, { opacity: 0, y: 14, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', stagger: .06, duration: .8, ease: K.EO, delay: delay || 0 });
    },
    send: function (payload) {
      var body = Object.assign({ access_key: K.KEY, from_name: 'Vinarija Kamenik – sajt' }, payload);
      if (K.KEY === 'OVDE_KLJUC') {
        console.info('[Kamenik] Web3Forms demo režim – upišite access_key u kamenik-core.js', body);
        return new Promise(function (r) { setTimeout(function () { r({ success: true, demo: true }); }, 700); });
      }
      return fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) }).then(function (r) { return r.json(); });
    },
    clink: function (root) {
      var g = window.gsap; if (!root) return;
      var L = root.querySelector('[data-glass-l]'), R = root.querySelector('[data-glass-r]'), S = root.querySelector('[data-spark]'), T = root.querySelector('[data-clink-text]');
      if (!g || K.reduced) { [L, R, S, T].forEach(function (e) { if (e) { e.style.opacity = 1; e.style.transform = 'none'; } }); if (S) S.style.opacity = 0; return; }
      var tl = g.timeline();
      tl.fromTo(L, { x: -130, rotation: 8, opacity: 0 }, { x: 0, opacity: 1, duration: .55, ease: K.EO }, 0)
        .fromTo(R, { x: 130, rotation: -8, opacity: 0 }, { x: 0, opacity: 1, duration: .55, ease: K.EO }, 0)
        .to([L, R], { rotation: 0, duration: .5, ease: 'back.out(2.4)' }, .5)
        .fromTo(S, { scale: .4, opacity: 0, rotation: -20 }, { scale: 1.15, opacity: 1, rotation: 0, duration: .3, ease: K.EO }, .58)
        .to(S, { opacity: 0, scale: 1.4, duration: .5, ease: K.EO }, .95)
        .fromTo(T, { opacity: 0, y: 14, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .7, ease: K.EO }, .7);
      return tl;
    },
    param: function (k) { try { return new URLSearchParams(location.search).get(k); } catch (e) { return null; } }
  };
  window.Kamenik = K;

  function makeCurtain() {
    if (K._c) return K._c;
    var c = document.createElement('div');
    c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100vh;z-index:300;pointer-events:none;visibility:hidden;transform:translateY(-120%)';
    c.innerHTML = '<div style="position:absolute;inset:0;background:#4A1626;display:flex;align-items:center;justify-content:center"><span data-cl style="font-family:Bellefair,serif;font-size:clamp(48px,8vw,120px);line-height:1;color:#F6F3EE">Kamenik</span></div><svg viewBox="0 0 1200 80" preserveAspectRatio="none" style="position:absolute;left:0;bottom:-79px;width:100%;height:80px;display:block"><path d="M0 0H1200V30Q1100 80 1000 40T800 40T600 50T400 34T200 52T0 36Z" fill="#4A1626"/></svg>';
    document.body.appendChild(c);
    K._c = c; return c;
  }
  K.curtainTo = function (href, label) {
    try { sessionStorage.setItem('kamenik-curtain', label); } catch (e) {}
    var g = window.gsap;
    if (!g || K.reduced) { location.href = href; return; }
    var c = makeCurtain(), l = c.querySelector('[data-cl]');
    l.textContent = label;
    g.set(c, { visibility: 'visible', pointerEvents: 'auto' });
    g.fromTo(c, { yPercent: -120 }, { yPercent: 0, duration: .25, ease: K.EIO, onComplete: function () { location.href = href; } });
    g.fromTo(l, { opacity: 0, y: 24, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .2, delay: 0, ease: K.EO });
  };
  function curtainIn() {
    var label = null;
    try { label = sessionStorage.getItem('kamenik-curtain'); sessionStorage.removeItem('kamenik-curtain'); } catch (e) {}
    if (!label || K.reduced) return;
    var c = makeCurtain(), g = gsap;
    c.querySelector('[data-cl]').textContent = label;
    g.set(c, { visibility: 'visible', yPercent: 0 });
    g.to(c, { yPercent: -120, duration: .25, delay: 0, ease: K.EIO, onComplete: function () { g.set(c, { visibility: 'hidden' }); } });
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]'); if (!a || e.defaultPrevented) return;
    var href = a.getAttribute('href');
    if (href.charAt(0) === '#') {
      if (href.length < 2) return;
      var t = document.querySelector(href); if (!t) return;
      e.preventDefault(); K.scrollTo(t); return;
    }
    if (a.target === '_blank' || /^(https?:|mailto:|tel:|viber:|whatsapp:)/.test(href) || e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (!/\.html/.test(href)) return;
    var here = location.pathname.split('/').pop(), there = href.split('#')[0].split('?')[0];
    if (there === here && href.indexOf('?') < 0 && href.indexOf('#') > -1) { var h = document.querySelector('#' + href.split('#')[1]); if (h) { e.preventDefault(); K.scrollTo(h); } return; }
    e.preventDefault();
    var label = a.dataset.page || (a.textContent || '').trim().split(/\s{2,}|\n/)[0] || 'Kamenik';
    K.curtainTo(href, label.length > 28 ? 'Kamenik' : label);
  });

  function init() {
    var g = window.gsap, ST = window.ScrollTrigger;
    if (g && ST) {
      g.registerPlugin(ST);
      if (!K.reduced && window.Lenis) {
        K.lenis = new Lenis({ lerp: .1, smoothWheel: true });
        K.lenis.on('scroll', ST.update);
        g.ticker.add(function (t) { K.lenis.raf(t * 1000); });
        g.ticker.lagSmoothing(0);
      }
      curtainIn();
    }
    K._ok = true;
    K._q.splice(0).forEach(function (f) { try { f(); } catch (e) { console.warn(e); } });
    setTimeout(function () { K.scan(); K.applyLang(); }, 250);
    setTimeout(function () { K.scan(); if (window.ScrollTrigger) ScrollTrigger.refresh(); }, 1200);
    window.addEventListener('load', function () { if (window.ScrollTrigger) ScrollTrigger.refresh(); }, { once: true });
  }
  var n = 0;
  (function wait() {
    if ((window.gsap && window.ScrollTrigger && (window.Lenis || n > 40)) || n > 90) return init();
    n++; setTimeout(wait, 50);
  })();

  var q = window.KamenikQ || [];
  window.KamenikQ = { push: function (f) { try { f(K); } catch (e) { console.warn(e); } } };
  q.forEach(function (f) { try { f(K); } catch (e) { console.warn(e); } });
})();
