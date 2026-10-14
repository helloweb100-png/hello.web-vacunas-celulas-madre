/* ==========================================================================
   INGECELL · Medicina regenerativa
   script.js — interacciones, animaciones y efectos de scroll
   Dependencias (CDN): GSAP + ScrollTrigger, Lenis. Si no cargan, la página
   sigue siendo 100 % funcional (degradación elegante).
   ========================================================================== */
(() => {
  'use strict';

  /* ------------------------------------------------------------------
     0. UTILIDADES
  ------------------------------------------------------------------ */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const root = document.documentElement;
  const WA_NUMBER = '5216181013521'; // +52 1 618 101 3521
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  let lenis = null;
  // Equipos muy limitados arrancan directamente en modo ligero; el resto se mide en vivo (ver goLite)
  // Pruebas: ?lite=1 fuerza el modo ligero y ?lite=0 lo desactiva por completo
  const liteParam = new URLSearchParams(location.search).get('lite');
  let lite = liteParam === '1' || (liteParam !== '0' && ((navigator.hardwareConcurrency || 8) <= 2 || (navigator.deviceMemory || 8) <= 2));

  /* ------------------------------------------------------------------
     1. WHATSAPP · enlaces con mensaje contextual (CTA)
  ------------------------------------------------------------------ */
  function initWhatsAppLinks() {
    $$('[data-wa]').forEach((a) => {
      a.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(a.dataset.wa)}`;
    });
    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------------------
     2. RUEDA INTERACTIVA · nuevas tecnologías en medicina regenerativa
        Se construye desde la lista (<ol id="techList">) para que el
        contenido siga siendo indexable y accesible.
  ------------------------------------------------------------------ */
  function initWheel() {
    const svg = $('#wheelSvg');
    const wheel = $('#wheel');
    const items = $$('#techList .tech');
    const counter = $('#wheelCount');
    if (!svg || !items.length) return;

    const NS = 'http://www.w3.org/2000/svg';
    const C = 300, R = 290, r = 106;
    const polar = (rad, deg) => {
      const a = (deg * Math.PI) / 180;
      return [C + rad * Math.cos(a), C + rad * Math.sin(a)];
    };
    const f = (n) => n.toFixed(2);
    const blades = [];
    let current = 0;
    let userTouched = false;

    items.forEach((li, i) => {
      const c = -90 + i * 45;
      const [x1, y1] = polar(R, c - 22.5);
      const [x2, y2] = polar(R, c + 22.5);
      const [x3, y3] = polar(r, c + 45);
      const [x4, y4] = polar(r, c);
      const d = `M${f(x1)} ${f(y1)}A${R} ${R} 0 0 1 ${f(x2)} ${f(y2)}L${f(x3)} ${f(y3)}A${r} ${r} 0 0 0 ${f(x4)} ${f(y4)}Z`;

      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'wblade');
      g.setAttribute('tabindex', '0');
      g.setAttribute('role', 'button');
      g.setAttribute('aria-label', $('.tech__name', li).textContent.trim());
      const mid = ((c + 11) * Math.PI) / 180;
      g.style.setProperty('--tx', `${(Math.cos(mid) * 16).toFixed(1)}px`);
      g.style.setProperty('--ty', `${(Math.sin(mid) * 16).toFixed(1)}px`);

      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', li.dataset.c);
      g.appendChild(path);

      const [lx, ly] = polar(196, c + 11);
      const ink = li.dataset.ink || '#fff';

      const use = document.createElementNS(NS, 'use');
      use.setAttribute('href', `#${li.dataset.icon}`);
      use.setAttribute('x', f(lx - 15));
      use.setAttribute('y', f(ly - 40));
      use.setAttribute('width', '30');
      use.setAttribute('height', '30');
      use.style.color = ink;
      use.style.pointerEvents = 'none';
      g.appendChild(use);

      const text = document.createElementNS(NS, 'text');
      text.setAttribute('class', 'wlabel');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', ink);
      (li.dataset.lines || '').split('|').forEach((line, k) => {
        const t = document.createElementNS(NS, 'tspan');
        t.setAttribute('x', f(lx));
        t.setAttribute('y', f(ly + 8 + k * 16));
        t.textContent = line;
        text.appendChild(t);
      });
      g.appendChild(text);

      svg.appendChild(g);
      blades.push(g);

      g.addEventListener('mouseenter', () => activate(i, true));
      g.addEventListener('click', () => activate(i, true));
      g.addEventListener('focus', () => activate(i, true));
      g.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(i, true); }
      });
      $('.tech__btn', li).addEventListener('click', () => activate(i, true));
    });

    function activate(i, fromUser) {
      if (fromUser) userTouched = true;
      current = i;
      wheel.classList.add('has-active');
      blades.forEach((b, k) => b.classList.toggle('is-active', k === i));
      items.forEach((li, k) => {
        const open = k === i;
        li.classList.toggle('is-open', open);
        $('.tech__btn', li).setAttribute('aria-expanded', String(open));
      });
      if (counter) counter.textContent = `${String(i + 1).padStart(2, '0')} / 08`;
      const nameEl = $('#wheelName');
      if (nameEl) nameEl.textContent = (items[i].dataset.lines || '').replace('|', ' ');
    }
    activate(0, false);

    // Rotación automática mientras la rueda esté visible y nadie interactúe
    let timer = null;
    const io = new IntersectionObserver(([entry]) => {
      clearInterval(timer);
      if (entry.isIntersecting && !reduced && !lite) {
        timer = setInterval(() => { if (!userTouched && !lite) activate((current + 1) % items.length, false); }, 3600);
      }
    }, { threshold: 0.4 });
    io.observe(wheel);
  }

  /* ------------------------------------------------------------------
     3. TABS · áreas de aplicación
  ------------------------------------------------------------------ */
  function initTabs() {
    const wrap = $('#tabs');
    if (!wrap) return;
    const tabs = $$('[role="tab"]', wrap);
    const panels = $$('[role="tabpanel"]', wrap);

    function select(tab, focus) {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      let shown = null;
      panels.forEach((p) => {
        const on = p.id === tab.getAttribute('aria-controls');
        p.hidden = !on;
        if (on) shown = p;
      });
      if (focus) tab.focus();
      if (shown && hasGSAP && !reduced) {
        gsap.fromTo($$('li', shown), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .55, stagger: .045, ease: 'power3.out', clearProps: 'opacity,transform' });
      }
      const list = tab.parentElement;
      if (list.scrollWidth > list.clientWidth) {
        list.scrollTo({ left: tab.offsetLeft - 24, behavior: 'smooth' });
      }
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab, false));
      tab.addEventListener('keydown', (e) => {
        const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
        if (e.key in keys) {
          e.preventDefault();
          select(tabs[(i + keys[e.key] + tabs.length) % tabs.length], true);
        } else if (e.key === 'Home') { e.preventDefault(); select(tabs[0], true); }
        else if (e.key === 'End') { e.preventDefault(); select(tabs[tabs.length - 1], true); }
      });
    });
  }

  /* ------------------------------------------------------------------
     4. ACORDEÓN · preguntas frecuentes
  ------------------------------------------------------------------ */
  function initAccordion() {
    const items = $$('#acc .acc__item');
    items.forEach((item) => {
      const btn = $('.acc__btn', item);
      btn.addEventListener('click', () => {
        const willOpen = !item.classList.contains('is-open');
        items.forEach((it) => {
          it.classList.remove('is-open');
          $('.acc__btn', it).setAttribute('aria-expanded', 'false');
        });
        if (willOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
        if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 650);
      });
    });
  }

  /* ------------------------------------------------------------------
     5. COMPARADOR ANTES / DESPUÉS
  ------------------------------------------------------------------ */
  function initCompare() {
    $$('[data-compare]').forEach((fig) => {
      const stage = $('.compare__stage', fig);
      const range = $('.compare__range', fig);
      const set = (v) => stage.style.setProperty('--pos', `${v}%`);
      range.addEventListener('input', () => set(range.value));
      set(range.value);

      // Pista visual de interactividad al entrar en pantalla
      if (hasGSAP && !reduced) {
        const o = { v: 50 };
        const upd = () => { range.value = o.v; set(o.v); };
        ScrollTrigger.create({
          trigger: fig, start: 'top 75%', once: true,
          onEnter: () => {
            gsap.timeline({ delay: .5 })
              .to(o, { v: 14, duration: .9, ease: 'power2.inOut', onUpdate: upd })
              .to(o, { v: 86, duration: 1.3, ease: 'power2.inOut', onUpdate: upd })
              .to(o, { v: 50, duration: .9, ease: 'power2.inOut', onUpdate: upd });
          },
        });
      }
    });
  }

  /* ------------------------------------------------------------------
     6. FORMULARIO → WHATSAPP
  ------------------------------------------------------------------ */
  function initForm() {
    const form = $('#contactForm');
    if (!form) return;
    const status = $('#formStatus');
    const fields = {
      name: { input: $('#f-name'), err: $('#e-name'), msg: 'Escribe tu nombre para poder dirigirnos a ti.' },
      phone: { input: $('#f-phone'), err: $('#e-phone'), msg: 'Ingresa un número de WhatsApp válido (mínimo 8 dígitos).' },
    };
    const valid = {
      name: (v) => v.trim().length >= 2,
      phone: (v) => v.replace(/\D/g, '').length >= 8,
    };
    const check = (key) => {
      const { input, err, msg } = fields[key];
      const ok = valid[key](input.value);
      input.closest('.field').classList.toggle('is-invalid', !ok);
      input.setAttribute('aria-invalid', String(!ok));
      err.textContent = ok ? '' : msg;
      return ok;
    };
    Object.keys(fields).forEach((k) => {
      fields[k].input.addEventListener('blur', () => check(k));
      fields[k].input.addEventListener('input', () => { if (fields[k].input.closest('.field').classList.contains('is-invalid')) check(k); });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const okName = check('name');
      const okPhone = check('phone');
      if (!okName || !okPhone) {
        status.textContent = 'Revisa los campos marcados para continuar.';
        (okName ? fields.phone : fields.name).input.focus();
        return;
      }
      const name = fields.name.input.value.trim();
      const phone = fields.phone.input.value.trim();
      const interest = $('#f-int').value;
      const msg = $('#f-msg').value.trim();
      const text =
        `Hola, soy ${name}. Me interesa: ${interest}. ` +
        `Mi WhatsApp es ${phone}.` +
        (msg ? ` Mi caso: ${msg}.` : '') +
        ' Quiero mi valoración.';
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
      status.textContent = '¡Gracias! Abrimos WhatsApp para continuar tu conversación.';
      form.reset();
    });
  }

  /* ------------------------------------------------------------------
     7. MENÚ MÓVIL + ANCLAS
  ------------------------------------------------------------------ */
  function initMenu() {
    const burger = $('#burger');
    const menu = $('#menu');
    if (!burger || !menu) return;

    const setOpen = (open) => {
      menu.classList.toggle('is-open', open);
      menu.setAttribute('aria-hidden', String(!open));
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      root.classList.toggle('menu-open', open);
      if (lenis) (open ? lenis.stop() : lenis.start());
      else root.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', () => setOpen(!menu.classList.contains('is-open')));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('is-open')) setOpen(false); });

    // Anclas internas con scroll suave (compatible con Lenis)
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const hash = a.getAttribute('href');
      if (hash.length < 2) return;
      const target = $(hash);
      if (!target) return;
      e.preventDefault();
      const wasOpen = menu.classList.contains('is-open');
      if (wasOpen) setOpen(false);
      const go = () => {
        if (lenis) lenis.scrollTo(hash === '#inicio' ? 0 : target, { offset: -70, duration: 1.8 });
        else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      };
      wasOpen ? setTimeout(go, 120) : go();
    });
  }

  /* ==================================================================
     A PARTIR DE AQUÍ: módulos que requieren GSAP + ScrollTrigger
  ================================================================== */

  /* ------------------------------------------------------------------
     8. SCROLL SUAVE (Lenis) ligado a ScrollTrigger
  ------------------------------------------------------------------ */
  let lenisTick = null;
  let heroApi = null;

  function initLenis() {
    if (reduced || lite || !window.Lenis) return;
    lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    lenisTick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(lenisTick);
    gsap.ticker.lagSmoothing(0);
    lenis.stop(); // se reactiva al terminar el preloader
  }

  /* ------------------------------------------------------------------
     8b. RENDIMIENTO · modo ligero automático
     Si el equipo no sostiene una fluidez aceptable, se apagan las
     animaciones decorativas continuas y el scroll vuelve a ser nativo.
  ------------------------------------------------------------------ */
  function goLite() {
    if (root.classList.contains('lite')) return;
    lite = true;
    root.classList.add('lite');
    if (lenis) {
      gsap.ticker.remove(lenisTick);
      lenis.destroy();
      lenis = null;
    }
    if (heroApi) heroApi.setLite(true);
    ScrollTrigger.update();
  }

  function initPerfGovernor() {
    if (lite || reduced || liteParam === '0') return;
    let last = 0, sum = 0, n = 0, bad = 0;
    const tick = (t) => {
      if (lite) return;
      requestAnimationFrame(tick);
      const dt = t - last;
      last = t;
      if (!dt || dt > 250 || document.hidden) return; // ignora saltos (pestaña en segundo plano)
      sum += dt; n++;
      if (n < 50) return;
      bad = sum / n > 30 ? bad + 1 : 0; // promedio > 30 ms ≈ menos de 33 fps
      sum = 0; n = 0;
      if (bad >= 3) goLite();
    };
    requestAnimationFrame((t) => { last = t; requestAnimationFrame(tick); });
  }

  /* Pausa las animaciones CSS infinitas de las secciones que no se ven */
  function initOffscreenPause() {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.target.classList.toggle('is-off', !e.isIntersecting));
    }, { rootMargin: '80px 0px' });
    $$('main > section, .footer').forEach((el) => io.observe(el));
  }

  /* Construye todas las interacciones de un solo golpe, con la página ya maquetada.
     Primero lo que modifica el DOM y después lo que mide posiciones (menos relayouts). */
  function buildPage() {
    [
      initMenu, initWheel, initTabs, initAccordion, initForm,
      initManifesto, initMarquee, initCounters,
      initCompare, initExpand, initStack, initScience, initVial, initTimeline, initParallax,
      initHeader, initProgress, initDots, initCursor, initMagnetic,
      initReveals, initOffscreenPause,
    ].forEach((task) => {
      try { task(); } catch (err) {
        console.error('[INGECELL] Error de inicialización:', err);
        root.classList.add('reduced'); // modo seguro: todo el contenido visible y estático
      }
    });
  }

  /* ------------------------------------------------------------------
     9. PRELOADER · el iris se arma aspa por aspa y se abre en zoom
        Sólo anima transform/opacity (sin filtros ni escalados gigantes).
  ------------------------------------------------------------------ */
  function loadFonts() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    const sample = 'Aaáéíóúñ¿¡0123';
    return Promise.all([
      '700 1em "Bricolage Grotesque"', '500 1em "Bricolage Grotesque"', 'italic 400 1em "Instrument Serif"',
      '500 1em "JetBrains Mono"', '500 1em Manrope', '700 1em Manrope',
    ].map((f) => document.fonts.load(f, sample).catch(() => null)));
  }

  function runPreloader(build) {
    return new Promise((resolve) => {
      const pre = $('#preloader');
      if (!pre || reduced) {
        if (pre) pre.remove();
        root.classList.remove('is-loading', 'pre-hold');
        build();
        if (lenis) lenis.start();
        resolve();
        return;
      }

      const count = $('#preCount');
      const ring = $('#preRing');
      const state = { p: 0 };
      let lastInt = -1;

      const loaded = new Promise((res) => {
        if (document.readyState === 'complete') res();
        else window.addEventListener('load', res, { once: true });
      });
      const timeout = new Promise((res) => setTimeout(res, 4500));
      // Las fuentes se descargan en paralelo a la animación (la página en espera no las pediría sola)
      const assets = Promise.race([Promise.all([loaded, loadFonts()]), timeout]);

      // Red de seguridad: pase lo que pase, el telón nunca se queda pegado
      const watchdog = setTimeout(() => {
        root.classList.remove('is-loading', 'pre-hold');
        pre.remove();
        if (lenis) lenis.start();
      }, 14000);

      const intro = gsap.timeline();
      intro
        .from('#preMark .bw', { opacity: 0, scale: .15, rotation: -140, svgOrigin: '50 50', duration: .9, stagger: .07, ease: 'back.out(1.5)' }, 0)
        .from('#preMark .core', { scale: 0, svgOrigin: '50 50', duration: .55, ease: 'back.out(2)' }, .65)
        .to('#preMark', { rotation: 360, duration: 1.9, ease: 'power2.inOut' }, 0)
        .from('.preloader__meta > *', { opacity: 0, y: 14, duration: .6, stagger: .1, ease: 'power3.out' }, .3)
        .to(state, {
          p: 1, duration: 1.9, ease: 'power1.inOut',
          onUpdate() {
            const v = Math.round(state.p * 100);
            if (v === lastInt) return; // sólo toca el DOM cuando cambia el número
            lastInt = v;
            count.textContent = String(v).padStart(3, '0');
            ring.style.strokeDashoffset = String(465 * (1 - v / 100));
          },
        }, 0);

      const introDone = new Promise((res) => intro.eventCallback('onComplete', res));

      Promise.all([introDone, assets]).then(() => {
        try {
          // Con el telón aún cubriendo todo: se maqueta la página UNA vez y se construyen las interacciones
          root.classList.remove('pre-hold');
          build();
          ScrollTrigger.refresh();
        } catch (err) {
          console.error('[INGECELL] Error al construir la página:', err);
          root.classList.add('reduced');
        }
        const out = gsap.timeline({
          onComplete() {
            clearTimeout(watchdog);
            pre.remove();
            root.classList.remove('is-loading');
            if (lenis) lenis.start();
          },
        });
        out
          .to('.preloader__meta', { opacity: 0, y: 16, duration: .35, ease: 'power2.in' }, 0)
          .to('.preloader__ring', { opacity: 0, duration: .25 }, 0)
          .to('.preloader__stage', { scale: 7, duration: .8, ease: 'power3.in' }, .1)
          .to(pre, { opacity: 0, duration: .45, ease: 'power1.inOut' }, .4)
          .add(resolve, .4);
      });
    });
  }

  /* ------------------------------------------------------------------
     10. HERO · entrada + canvas (doble hélice de ADN + células)
  ------------------------------------------------------------------ */
  function heroIntro() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    const clean = (el) => { el.removeAttribute('data-hero'); gsap.set(el, { clearProps: 'opacity,transform' }); };
    const pill = $('.hero .pill');
    const rest = $$('.hero [data-hero]').filter((el) => el !== pill);
    tl.to(pill, { opacity: 1, y: 0, duration: .9, onComplete: () => clean(pill) }, 0)
      .to('.hero .line__in', { y: 0, duration: 1.3, stagger: .12, ease: 'expo.out' }, .05)
      .to(rest, { opacity: 1, y: 0, duration: 1, stagger: .09, onComplete() { rest.forEach(clean); } }, .5)
      .from('.hcard', { opacity: 0, y: 30, duration: 1.2, stagger: .14, ease: 'power3.out', clearProps: 'opacity,transform' }, .7)
      .from('.hero__scroll', { opacity: 0, duration: 1 }, 1.3);

    // Parallax de salida del hero (se omite en modo ligero)
    if (!reduced && !lite) {
      gsap.to('.hero__copy', { yPercent: -10, opacity: .15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    }
  }

  function initHeroCanvas() {
    const cv = $('#heroCanvas');
    const ctx = cv && cv.getContext('2d');
    if (!ctx) return;

    const RGB = [[48, 183, 152], [200, 154, 52], [192, 96, 2], [187, 25, 40], [101, 21, 48], [0, 54, 92], [14, 135, 192], [60, 161, 179]];
    const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

    // Sprites pre-renderizados: cada frame sólo hace drawImage (mucho más barato que trazar arcos)
    const sprite = (c, glow) => {
      const size = 64, m = size / 2, s = document.createElement('canvas');
      s.width = s.height = size;
      const g = s.getContext('2d');
      if (glow) {
        const gr = g.createRadialGradient(m, m, 0, m, m, m);
        gr.addColorStop(0, rgba(c, .3)); gr.addColorStop(.4, rgba(c, .12)); gr.addColorStop(1, rgba(c, 0));
        g.fillStyle = gr; g.fillRect(0, 0, size, size);
        const r = size * .2;
        g.beginPath(); g.arc(m, m, r, 0, 6.283); g.fillStyle = rgba(c, 1); g.fill();
        g.beginPath(); g.arc(m - r * .3, m - r * .3, r * .35, 0, 6.283); g.fillStyle = 'rgba(255,255,255,.75)'; g.fill();
      } else {
        const r = m - 2;
        g.beginPath(); g.arc(m, m, r, 0, 6.283); g.fillStyle = rgba(c, .1); g.fill();
        g.lineWidth = 1.4; g.strokeStyle = rgba(c, .5); g.stroke();
        g.beginPath(); g.arc(m - r * .25, m - r * .25, r * .35, 0, 6.283); g.fillStyle = rgba(c, .28); g.fill();
      }
      return s;
    };
    const CELL = RGB.map((c) => sprite(c, false));
    const NODE = RGB.map((c) => sprite(c, true));
    const NAVY = 'rgb(0,54,92)', BLUE = 'rgb(14,135,192)';
    const BUCKETS = [
      { lo: -1.01, hi: -.5, w: 1.7, a: .22 }, { lo: -.5, hi: 0, w: 2.6, a: .45 },
      { lo: 0, hi: .5, w: 3.6, a: .72 }, { lo: .5, hi: 1.01, w: 4.6, a: .92 },
    ];

    const L = {};
    const mouse = { x: 0, y: 0, sx: 0, sy: 0, px: -9999, py: -9999 };
    let W = 1, H = 1, dpr = 1, particles = [], visible = true, raf = 0, frame = 0, liteMode = lite;
    let AX, AY, AZ, BX, BY, EF, RUNG;
    const t0 = performance.now();

    const makeParticle = () => ({
      x: rand(0, W), y: rand(0, H), r: rand(3, 15), vx: rand(-.15, .15), vy: rand(-.12, .12),
      c: (Math.random() * 8) | 0, a: rand(.5, 1), ph: rand(0, 6.28),
    });

    function resize() {
      const r = cv.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, liteMode ? 1 : 1.5);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      L.desk = W >= 1024;
      if (L.desk) {
        L.cx = W * .77; L.cy = H * .5; L.len = H * 1.1; L.R = Math.min(W * .07, H * .15); L.ang = -Math.PI / 2 + .32;
      } else {
        L.cx = W * .5; L.cy = H - Math.min(H * .115, 105); L.len = W * 1.35; L.R = Math.min(H * .055, W * .085); L.ang = -.1;
      }
      L.M = (L.desk ? 24 : 18) - (liteMode ? 6 : 0);
      const M = L.M;
      AX = new Float32Array(M); AY = new Float32Array(M); AZ = new Float32Array(M);
      BX = new Float32Array(M); BY = new Float32Array(M); EF = new Float32Array(M);
      RUNG = [];
      for (let i = 0; i < M; i++) {
        const t = i / (M - 1);
        EF[i] = Math.min(1, Math.min(t, 1 - t) * 6);
        RUNG.push(rgba(RGB[i % 8], .3 * EF[i]));
      }
      const base = W < 700 ? 18 : W < 1100 ? 28 : 40;
      particles = Array.from({ length: liteMode ? Math.round(base * .55) : base }, makeParticle);
      if (reduced) draw(t0 + 2500);
    }

    function drawParticles(time) {
      const maxD = L.desk ? 120 : 90, md2 = maxD * maxD, near = md2 * .3;
      for (const p of particles) {
        p.x += p.vx + Math.sin(time * .4 + p.ph) * .12;
        p.y += p.vy + Math.cos(time * .35 + p.ph) * .1;
        const dx = p.x - mouse.px, dy = p.y - mouse.py, d2 = dx * dx + dy * dy;
        if (d2 < 14000) { const d = Math.sqrt(d2) || 1; const f = (1 - d / 118) * 1.4; p.x += (dx / d) * f; p.y += (dy / d) * f; }
        if (p.x < -30) p.x = W + 30; else if (p.x > W + 30) p.x = -30;
        if (p.y < -30) p.y = H + 30; else if (p.y > H + 30) p.y = -30;
      }
      // Líneas de conexión en dos trazos (cerca / lejos) en vez de uno por par
      const pNear = new Path2D(), pFar = new Path2D();
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j], dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
          if (d < md2) { const path = d < near ? pNear : pFar; path.moveTo(a.x, a.y); path.lineTo(b.x, b.y); }
        }
      }
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(14,135,192,.07)'; ctx.stroke(pFar);
      ctx.strokeStyle = 'rgba(14,135,192,.15)'; ctx.stroke(pNear);
      for (const p of particles) {
        const d = p.r * 2 * (1 + Math.sin(time * 1.2 + p.ph) * .06);
        ctx.globalAlpha = p.a;
        ctx.drawImage(CELL[p.c], p.x - d / 2, p.y - d / 2, d, d);
      }
      ctx.globalAlpha = 1;
    }

    function strands(lo, hi) {
      const M = L.M;
      for (const bk of BUCKETS) {
        if (bk.hi <= lo || bk.lo >= hi) continue;
        ctx.lineWidth = bk.w; ctx.globalAlpha = bk.a;
        for (let s = 0; s < 2; s++) {
          const X = s ? BX : AX, Y = s ? BY : AY, sg = s ? -1 : 1;
          ctx.beginPath();
          let pen = false;
          for (let i = 0; i < M - 1; i++) {
            const zz = sg * (AZ[i] + AZ[i + 1]) / 2;
            if (zz >= bk.lo && zz < bk.hi) {
              if (!pen) { ctx.moveTo(X[i], Y[i]); pen = true; }
              ctx.lineTo(X[i + 1], Y[i + 1]);
            } else pen = false;
          }
          ctx.strokeStyle = s ? BLUE : NAVY; ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }

    function nodes(front) {
      const M = L.M, k = L.desk ? 1 : .8;
      for (let s = 0; s < 2; s++) {
        const X = s ? BX : AX, Y = s ? BY : AY, sg = s ? -1 : 1;
        for (let i = 0; i < M; i++) {
          const z = sg * AZ[i];
          if ((z >= 0) !== front) continue;
          const f = (z + 1) / 2, size = (2.6 + f * 4.4) * k * 5;
          ctx.globalAlpha = (.55 + .45 * f) * EF[i];
          ctx.drawImage(NODE[(i + (s ? 3 : 0)) % 8], X[i] - size / 2, Y[i] - size / 2, size, size);
        }
      }
      ctx.globalAlpha = 1;
    }

    function drawHelix(time) {
      const { cx, cy, len, R, ang, M } = L;
      const ux = Math.cos(ang), uy = Math.sin(ang), vx = -uy, vy = ux;
      const ox = mouse.sx * (L.desk ? 26 : 10), oy = mouse.sy * (L.desk ? 18 : 6);
      const pitch = .46 * 30 / M;
      for (let i = 0; i < M; i++) {
        const s = (i / (M - 1) - .5) * len, ph = i * pitch + time * .75;
        const c = Math.cos(ph), bx = cx + ux * s + ox, by = cy + uy * s + oy;
        AX[i] = bx + vx * R * c; AY[i] = by + vy * R * c; AZ[i] = Math.sin(ph);
        BX[i] = bx - vx * R * c; BY[i] = by - vy * R * c;
      }
      // Profundidad: primero lo que queda atrás, luego los peldaños, luego lo de adelante
      strands(-2, 0); nodes(false);
      ctx.lineWidth = 1.6;
      for (let i = 0; i < M; i++) {
        ctx.beginPath(); ctx.moveTo(AX[i], AY[i]); ctx.lineTo(BX[i], BY[i]);
        ctx.strokeStyle = RUNG[i]; ctx.stroke();
      }
      strands(0, 2); nodes(true);
    }

    function draw(now) {
      const time = (now - t0) / 1000;
      mouse.sx += (mouse.x - mouse.sx) * .05;
      mouse.sy += (mouse.y - mouse.sy) * .05;
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = 'round';
      drawParticles(time);
      drawHelix(time);
    }

    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      if (liteMode && (frame++ & 1)) return; // 30 fps en modo ligero
      draw(now);
    }
    const start = () => { if (!raf && !reduced) raf = requestAnimationFrame(loop); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };

    resize();
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
    heroApi = { setLite(v) { liteMode = v; resize(); } };
    if (reduced) return;

    window.addEventListener('pointermove', (e) => {
      const r = cv.getBoundingClientRect();
      mouse.px = e.clientX - r.left; mouse.py = e.clientY - r.top;
      mouse.x = (mouse.px / W - .5) * 2; mouse.y = (mouse.py / H - .5) * 2;
    }, { passive: true });
    document.addEventListener('pointerleave', () => { mouse.px = mouse.py = -9999; });
    // El bucle sólo corre mientras el hero está en pantalla
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }).observe(cv.parentElement);
    start();
  }

  /* ------------------------------------------------------------------
     11. REVEALS · entrada al hacer scroll
  ------------------------------------------------------------------ */
  function initReveals() {
    $$('[data-reveal]').forEach((el) => {
      gsap.to(el, {
        opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onComplete() { el.removeAttribute('data-reveal'); gsap.set(el, { clearProps: 'opacity,transform' }); },
      });
    });
    $$('[data-stagger]').forEach((parent) => {
      const kids = Array.from(parent.children);
      gsap.to(kids, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .09,
        scrollTrigger: { trigger: parent, start: 'top 88%', once: true },
        onComplete() { parent.removeAttribute('data-stagger'); gsap.set(kids, { clearProps: 'opacity,transform' }); },
      });
    });
  }

  /* ------------------------------------------------------------------
     12. MARQUEE · velocidad ligada al scroll
  ------------------------------------------------------------------ */
  function initMarquee() {
    const rows = $$('.marquee__row');
    if (!rows.length) return;
    const state = rows.map((row) => {
      row.appendChild(row.firstElementChild.cloneNode(true));
      return { row, dir: parseFloat(row.dataset.dir) || -1, x: 0, w: 0 };
    });
    const measure = () => state.forEach((s) => {
      s.w = s.row.firstElementChild.getBoundingClientRect().width;
      if (s.dir > 0 && s.x === 0) s.x = -s.w * .5;
    });
    measure();
    window.addEventListener('resize', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

    if (reduced) return;
    let vel = 0, target = 0, visible = true;
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => { target = Math.abs(self.getVelocity()); } });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe($('.marquee'));

    gsap.ticker.add((time, delta) => {
      if (!visible) return;
      target *= .9;
      vel += (target - vel) * .12;
      const sp = (46 + Math.min(vel * .07, 280)) * (delta / 1000);
      state.forEach((s) => {
        if (!s.w) return;
        s.x += s.dir * sp;
        if (s.dir < 0 && s.x <= -s.w) s.x += s.w;
        if (s.dir > 0 && s.x >= 0) s.x -= s.w;
        s.row.style.transform = `translate3d(${s.x.toFixed(2)}px,0,0)`;
      });
    });
  }

  /* ------------------------------------------------------------------
     13. MANIFIESTO · las palabras se iluminan con el scroll
  ------------------------------------------------------------------ */
  function initManifesto() {
    const el = $('#manifestoText');
    if (!el) return;
    const wrapWords = (node) => {
      Array.from(node.childNodes).forEach((ch) => {
        if (ch.nodeType === 3) {
          const frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach((tok) => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
            const s = document.createElement('span');
            s.className = 'w'; s.textContent = tok; frag.appendChild(s);
          });
          node.replaceChild(frag, ch);
        } else if (ch.nodeType === 1) wrapWords(ch);
      });
    };
    wrapWords(el);
    if (reduced) { $$('.w', el).forEach((w) => { w.style.opacity = 1; }); return; }
    gsap.fromTo($$('.w', el), { opacity: .14 }, {
      opacity: 1, ease: 'none', stagger: .12,
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 48%', scrub: .6 },
    });
  }

  /* ------------------------------------------------------------------
     14. IMAGEN QUE SE ABRE A PANTALLA COMPLETA (sticky + scrub)
  ------------------------------------------------------------------ */
  function initExpand() {
    const sec = $('#expand');
    if (!sec || reduced) return;
    const media = $('#expandMedia');
    const img = $('img', media);
    const shade = $('.expand__shade', sec);
    const intro = $('.expand__intro', sec);
    const content = $('#expandContent');
    const big = $('#bigCount');
    const mm = gsap.matchMedia();

    mm.add({ desk: '(min-width: 900px)', mob: '(max-width: 899px)' }, (ctx) => {
      const from = ctx.conditions.desk ? 'inset(56% 30% 8% 30% round 30px)' : 'inset(58% 14% 7% 14% round 26px)';
      const o = { v: 0 };
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: sec, start: 'top top', end: 'bottom bottom', scrub: .7,
          onUpdate: (self) => content.classList.toggle('is-on', self.progress > .82),
        },
      })
        .fromTo(media, { clipPath: from }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: .7 }, 0)
        .fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1 }, 0)
        .to(intro, { opacity: 0, yPercent: -14, duration: .28 }, .12)
        .to(shade, { opacity: 1, duration: .3 }, .45)
        .fromTo(content, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: .28 }, .72)
        .fromTo(o, { v: 0 }, {
          v: 15000000, duration: .28,
          onUpdate() { big.textContent = Math.round(o.v).toLocaleString('es-MX'); },
        }, .72);
    });
  }

  /* ------------------------------------------------------------------
     15. TARJETAS APILADAS · tratamientos
  ------------------------------------------------------------------ */
  function initStack() {
    const cards = $$('[data-stack]');
    if (!cards.length || reduced) return;
    gsap.matchMedia().add('(min-width: 1000px) and (min-height: 760px)', () => {
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        gsap.to(card, {
          scale: .94, ease: 'none',
          scrollTrigger: { trigger: next, start: 'top 80%', end: 'top 22%', scrub: true },
        });
      });
    });
    // Parallax suave de la foto de la terapia A
    const img = $('.tcard--a .tcard__media > img');
    if (img) {
      gsap.fromTo(img, { yPercent: -6, scale: 1.14 }, {
        yPercent: 6, scale: 1.14, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }
  }

  /* ------------------------------------------------------------------
     16. CIENCIA DE LA PIEL · pasos sincronizados con la imagen
  ------------------------------------------------------------------ */
  function initScience() {
    const steps = $$('#steps .step');
    const callouts = $$('.callout');
    if (!steps.length) return;
    const setStep = (n) => {
      steps.forEach((s) => s.classList.toggle('is-active', +s.dataset.step === n));
      callouts.forEach((c) => c.classList.toggle('is-on', +c.dataset.step <= n));
    };
    setStep(1);
    steps.forEach((step) => {
      ScrollTrigger.create({
        trigger: step, start: 'top 62%', end: 'bottom 62%',
        onToggle: (self) => { if (self.isActive) setStep(+step.dataset.step); },
      });
    });
  }

  /* ------------------------------------------------------------------
     17. VIAL 3D · inclinación con el cursor + flotación
  ------------------------------------------------------------------ */
  function initVial() {
    const stage = $('#vialStage');
    const img = $('.vial-stage__img');
    if (!stage || !img) return;
    const startIdle = () => { if (!reduced) gsap.to(img, { y: -14, duration: 3.2, yoyo: true, repeat: -1, ease: 'sine.inOut' }); };
    if (reduced) return;
    gsap.from(img, {
      y: 140, opacity: 0, rotation: -8, duration: 1.5, ease: 'power4.out',
      scrollTrigger: { trigger: stage, start: 'top 80%', once: true }, onComplete: startIdle,
    });
    gsap.from('.vtag', { opacity: 0, scale: .6, duration: 1, stagger: .18, ease: 'back.out(2)', scrollTrigger: { trigger: stage, start: 'top 70%', once: true } });
    if (!finePointer) return;
    stage.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      gsap.to(img, { rotationY: x * 28, rotationX: -y * 22, transformPerspective: 900, duration: .8, ease: 'power3.out' });
    });
    stage.addEventListener('pointerleave', () => gsap.to(img, { rotationY: 0, rotationX: 0, duration: 1.2, ease: 'elastic.out(1,.6)' }));
  }

  /* ------------------------------------------------------------------
     18. LÍNEA DE TIEMPO · riel que se llena con el scroll
  ------------------------------------------------------------------ */
  function initTimeline() {
    const tl = $('#tl');
    const fill = $('#tlFill');
    if (!tl || !fill) return;
    const items = $$('.tl__item', tl);
    const mark = (p) => items.forEach((it, i) => it.classList.toggle('is-on', p > (i / items.length) * .9 + .03));
    if (reduced) { items.forEach((it) => it.classList.add('is-on')); return; }
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', () => {
      gsap.set(fill, { scaleY: 1, scaleX: 0 });
      gsap.to(fill, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: tl, start: 'top 78%', end: 'top 30%', scrub: .5, onUpdate: (s) => mark(s.progress) } });
    });
    mm.add('(max-width: 899px)', () => {
      gsap.set(fill, { scaleX: 1, scaleY: 0 });
      gsap.to(fill, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: tl, start: 'top 72%', end: 'bottom 62%', scrub: .5, onUpdate: (s) => mark(s.progress) } });
    });
  }

  /* ------------------------------------------------------------------
     19. CONTADORES
  ------------------------------------------------------------------ */
  function initCounters() {
    $$('[data-count]').forEach((el) => {
      if (el.id === 'bigCount') return; // lo controla la sección "expand"
      const target = parseFloat(el.dataset.count);
      if (reduced) { el.textContent = target.toLocaleString('es-MX'); return; }
      const o = { v: 0 };
      el.textContent = '0';
      ScrollTrigger.create({
        trigger: el, start: 'top 94%', once: true,
        onEnter: () => gsap.to(o, {
          v: target, duration: 2.2, ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString('es-MX'); },
        }),
      });
    });
  }

  /* ------------------------------------------------------------------
     20. PARALLAX DE DECORADOS
  ------------------------------------------------------------------ */
  function initParallax() {
    if (reduced) return;
    $$('[data-speed]').forEach((el) => {
      gsap.to(el, {
        y: parseFloat(el.dataset.speed), ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  }

  /* ------------------------------------------------------------------
     21. CHROME DE LA PÁGINA: header, progreso, dots, WhatsApp, cursor
  ------------------------------------------------------------------ */
  function initHeader() {
    const header = $('#header');
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => {
        const y = self.scroll();
        header.classList.toggle('is-solid', y > 40);
        if (root.classList.contains('menu-open')) return;
        if (y > 500 && self.direction === 1) header.classList.add('is-hidden');
        else if (self.direction === -1 || y <= 500) header.classList.remove('is-hidden');
      },
    });
  }

  function initProgress() {
    gsap.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });
  }

  function initDots() {
    const wrap = $('#dots');
    const dots = $$('#dots a');
    if (!wrap) return;
    const dark = new Set(['composicion', 'contacto']);
    dots.forEach((a) => {
      const id = a.getAttribute('href').slice(1);
      const sec = document.getElementById(id);
      if (!sec) return;
      ScrollTrigger.create({
        trigger: sec, start: 'top 55%', end: 'bottom 55%',
        onToggle: (self) => {
          if (!self.isActive) return;
          dots.forEach((d) => d.classList.toggle('is-active', d === a));
          wrap.classList.toggle('on-dark', dark.has(id));
        },
      });
    });
  }

  function initWhatsAppFloat() {
    const w = $('#waFloat');
    if (!w) return;
    setTimeout(() => w.classList.add('is-in'), 500);
    const tip = () => { w.classList.add('show-tip'); setTimeout(() => w.classList.remove('show-tip'), 5200); };
    setTimeout(tip, 7000);
    setTimeout(tip, 50000);
  }

  function initCursor() {
    const c = $('#cursor');
    if (!c || !finePointer || reduced) return;
    const xTo = gsap.quickTo(c, 'x', { duration: .45, ease: 'power3' });
    const yTo = gsap.quickTo(c, 'y', { duration: .45, ease: 'power3' });
    window.addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); c.style.opacity = 1; }, { passive: true });
    document.addEventListener('pointerleave', () => { c.style.opacity = 0; });
    document.addEventListener('pointerover', (e) => {
      c.classList.toggle('is-link', !!e.target.closest('a, button, [role="tab"], .wblade, .compare__range, input, select, textarea, summary'));
    });
    window.addEventListener('pointerdown', () => c.classList.add('is-down'));
    window.addEventListener('pointerup', () => c.classList.remove('is-down'));
  }

  function initMagnetic() {
    if (!finePointer || reduced) return;
    $$('[data-magnetic]').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: .5, ease: 'power3' });
      const yTo = gsap.quickTo(el, 'y', { duration: .5, ease: 'power3' });
      el.addEventListener('pointermove', (e) => {
        if (lite) return;
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * .28);
        yTo((e.clientY - r.top - r.height / 2) * .4 - 3);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ------------------------------------------------------------------
     22. ARRANQUE
  ------------------------------------------------------------------ */
  function fallback() {
    // Sin GSAP: la página funciona igual, sólo sin las animaciones avanzadas
    root.classList.remove('js', 'is-loading', 'pre-hold');
    const pre = $('#preloader');
    if (pre) pre.remove();
    initMenu(); initWheel(); initTabs(); initAccordion(); initCompare(); initForm();
    const header = $('#header');
    window.addEventListener('scroll', () => header.classList.toggle('is-solid', window.scrollY > 40), { passive: true });
    $$('[data-count]').forEach((el) => { el.textContent = Number(el.dataset.count).toLocaleString('es-MX'); });
    const w = $('#waFloat');
    if (w) w.classList.add('is-in');
  }

  function boot() {
    window.__ingeReady = true;
    initWhatsAppLinks();
    if (!hasGSAP) { fallback(); return; }

    try {
      gsap.registerPlugin(ScrollTrigger);
      // Los recálculos automáticos de 'load'/'DOMContentLoaded' se omiten: el refresh se hace una vez, tras el preloader
      ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true, autoRefreshEvents: 'visibilitychange,resize' });
      root.classList.add('js');
      if (reduced) root.classList.add('reduced');

      if (lite) root.classList.add('lite');
      initLenis();

      // El preloader arranca de inmediato; la página se construye al llegar al 100 % (ver runPreloader)
      runPreloader(buildPage).then(() => {
        heroIntro();
        initHeroCanvas();   // el canvas sólo empieza a dibujar cuando el telón ya se está abriendo
        initWhatsAppFloat();
        initPerfGovernor();
      });
    } catch (err) {
      // Cualquier error inesperado nunca debe dejar la página bloqueada
      console.error('[INGECELL] Error de inicialización:', err);
      fallback();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
