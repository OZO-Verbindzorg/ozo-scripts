// OZOverbindzorg — main.js
// Alle maatwerkcode van ozoverbindzorg.nl in één bestand (vervangt Slater-project 9398).
// - Elk onderdeel start alleen als zijn element op de pagina staat.
// - Bibliotheken die maar op een paar pagina's nodig zijn (Swiper, Finsweet, Vimeo) laden alleen daar.
// - GSAP, ScrollTrigger en Observer komen van Webflow zelf (Site settings → GSAP).
(function () {
  'use strict';

  // ---------- Hulpfuncties ----------

  const LIBS = {
    lenis: 'https://cdn.jsdelivr.net/npm/lenis@1.1.1/dist/lenis.min.js',
    swiper: 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js',
    fsAccordion: 'https://cdn.jsdelivr.net/npm/@finsweet/attributes-accordion@1/accordion.js',
    fsNumbercount: 'https://cdn.jsdelivr.net/npm/@finsweet/attributes-numbercount@1/numbercount.js',
    fsFormsubmit: 'https://cdn.jsdelivr.net/npm/@finsweet/attributes-formsubmit@1/formsubmit.js',
    splitText: 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/SplitText.min.js',
    draggable: 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/Draggable.min.js',
    inertia: 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/InertiaPlugin.min.js'
  };

  // Laadt een extern script één keer; geeft een Promise terug
  const loadedScripts = {};

  function loadScript(src) {
    if (!loadedScripts[src]) {
      loadedScripts[src] = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    return loadedScripts[src];
  }

  // ---------- Hele site ----------

  // Smooth scroll, gekoppeld aan ScrollTrigger
  function initLenis() {
    if (!window.gsap || !window.ScrollTrigger) return;
    loadScript(LIBS.lenis).then(() => {
      const lenis = new Lenis({
        lerp: 0.1,
        wheelMultiplier: 1,
        gestureOrientation: 'vertical',
        normalizeWheel: false,
        smoothTouch: false
      });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
      window.lenis = lenis;
    });
  }

  // Huidig jaar in de footer: [copyright="year"]
  function initCopyrightYear() {
    const year = String(new Date().getFullYear());
    document.querySelectorAll('[copyright="year"]').forEach((el) => {
      el.textContent = year;
    });
  }

  // Finsweet Attributes, alleen op pagina's die ze gebruiken
  function initFinsweet() {
    if (document.querySelector('[fs-accordion-element]')) loadScript(LIBS.fsAccordion);
    if (document.querySelector('[fs-numbercount-element]')) loadScript(LIBS.fsNumbercount);
    if (document.querySelector('[fs-formsubmit-element]')) loadScript(LIBS.fsFormsubmit);
  }

  // Freshchat (helpdesk-chat): pas laden bij de eerste interactie (scrollen, muis, toets, aanraking).
  // Scheelt een zwaar script en cookies van derden bij het openen van elke pagina.
  const FRESHCHAT = {
    token: '89de7861-1a35-4cd5-92d4-c65af78e3c63',
    host: 'https://ozoverbindzorg-help.freshchat.com'
  };

  function initFreshchat() {
    const events = ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'scroll', 'wheel'];
    let started = false;
    function start() {
      if (started) return;
      started = true;
      events.forEach((type) => window.removeEventListener(type, start));
      loadScript(FRESHCHAT.host + '/js/widget.js').then(() => {
        if (window.fcWidget) window.fcWidget.init(FRESHCHAT);
      });
    }
    events.forEach((type) => window.addEventListener(type, start, { passive: true }));
  }

  // ---------- Oude site (pagina's die nog niet vernieuwd zijn) ----------

  // Floating labels: label krijgt .float zolang het veld focus of een waarde heeft
  // (zelfde gedrag als CodeCrumbs floating-form-labels 0.1.1)
  function initFloatLabels() {
    document.querySelectorAll('.form_input').forEach((input) => {
      const label = input.previousElementSibling;
      if (!label) return;
      input.addEventListener('focus', () => label.classList.add('float'));
      input.addEventListener('blur', () => {
        if (!input.value) label.classList.remove('float');
      });
    });
  }

  // Sliders (Swiper). Swiper wordt alleen geladen als er een slider op de pagina staat.
  const SLIDERS = {
    '#examples': {
      slidesPerView: 'auto',
      speed: 400,
      spaceBetween: 12,
      grabCursor: true,
      keyboard: { enabled: true },
      navigation: { nextEl: '.swiper-next', prevEl: '.swiper-prev' }
    },
    '#logos': {
      slidesPerView: 'auto',
      centeredSlides: true,
      loop: true,
      speed: 4000,
      spaceBetween: 28,
      simulateTouch: false,
      allowTouchMove: false,
      autoplay: { delay: 0, disableOnInteraction: false, pauseOnMouseEnter: false },
      keyboard: { enabled: false }
    },
    '#reviews': {
      slidesPerView: 3,
      speed: 400,
      spaceBetween: 28,
      keyboard: { enabled: false },
      breakpoints: {
        320: { slidesPerView: 1.1, centeredSlides: false },
        992: { allowTouchMove: false }
      }
    },
    '#team': {
      slidesPerView: 'auto',
      speed: 400,
      spaceBetween: 24,
      grabCursor: true,
      keyboard: { enabled: true },
      navigation: { nextEl: '.swiper-next', prevEl: '.swiper-prev' }
    }
    // '#vacatures' (/werken-bij) was in Slater alleen gekoppeld aan vacature-detailpagina's, waar hij
    // niet staat, en is dus nooit actief geweest. Aanzetten = deze config terugzetten:
    // '#vacatures': {
    //   slidesPerView: 'auto',
    //   speed: 400,
    //   spaceBetween: 24,
    //   grabCursor: true,
    //   keyboard: { enabled: true },
    //   navigation: { nextEl: '.swiper-next', prevEl: '.swiper-prev' }
    // }
  };

  function initSliders() {
    const present = Object.keys(SLIDERS).filter((selector) => document.querySelector(selector));
    if (!present.length) return;
    loadScript(LIBS.swiper).then(() => {
      // slideRole 'listitem': de Webflow-lijst (role="list") houdt geldige lijst-items (toegankelijkheid)
      present.forEach((selector) => new Swiper(selector, { a11y: { slideRole: 'listitem' }, ...SLIDERS[selector] }));
    });
  }

  // Video's met eigen knoppen: #play-<id> en #pause-<id> bij <video id="<id>">.
  // De explainer-video (#explainer-video) gebruikt #play-video en #pause-video.
  function initVideoButtons() {
    const videos = [...document.querySelectorAll('video[id]')];
    if (!videos.length) return;

    const isExplainer = (video) => video.id === 'explainer-video';
    const button = (kind, video) =>
      document.getElementById(`${kind}-${video.id}`) ||
      (isExplainer(video) ? document.getElementById(`${kind}-video`) : null);

    // Pauzeren, dempen en (behalve de explainer) terug naar het begin
    function stop(video) {
      video.pause();
      video.muted = true;
      if (!isExplainer(video)) video.currentTime = 0;
    }

    // Stoppen + de eigen pauzeknop "klikken", zodat de Webflow-interactie (icoon) meekomt
    function reset(video) {
      stop(video);
      const pauseButton = document.getElementById(`pause-${video.id}`);
      if (pauseButton) pauseButton.click();
    }

    // Een gepauzeerde video hoeft niet te downloaden: bron weghalen tot er op play wordt geklikt.
    // Alleen bij video's met een poster of die niet zichtbaar zijn, zodat er in beeld niets verandert.
    function unload(video) {
      const sources = video.querySelectorAll('source[src]');
      if (!sources.length) return;
      if (!video.getAttribute('poster') && video.getClientRects().length) return;
      sources.forEach((source) => {
        source.dataset.src = source.getAttribute('src');
        source.removeAttribute('src');
      });
      video.removeAttribute('autoplay');
      video.preload = 'none';
      video.load();
    }

    function ensureLoaded(video) {
      const pending = video.querySelectorAll('source[data-src]');
      if (!pending.length) return;
      pending.forEach((source) => {
        source.setAttribute('src', source.dataset.src);
        source.removeAttribute('data-src');
      });
      video.load();
    }

    videos.forEach(reset);
    videos.forEach(unload);

    videos.forEach((video) => {
      const playButton = button('play', video);
      const pauseButton = button('pause', video);
      if (playButton) {
        playButton.addEventListener('click', () => {
          videos.forEach((other) => {
            if (other !== video) reset(other);
          });
          ensureLoaded(video);
          video.muted = false;
          video.play();
        });
      }
      if (pauseButton) pauseButton.addEventListener('click', () => stop(video));
    });
  }

  // Webflow-lightboxen krijgen aria-label="open lightbox", ook als de link zichtbare tekst heeft.
  // Dan wijkt de voorgelezen naam af van wat je ziet: label weghalen zodat de tekst telt.
  function initLightboxLabels() {
    if (!document.querySelector('.w-lightbox')) return;
    const fix = () => {
      document.querySelectorAll('.w-lightbox[aria-label="open lightbox"]').forEach((link) => {
        if (link.textContent.trim()) link.removeAttribute('aria-label');
      });
    };
    fix();
    window.Webflow = window.Webflow || [];
    window.Webflow.push(fix);
  }

  // Zoekpagina: zoekterm uit de URL tonen en het zoekveld vooraf invullen
  function initSearchTerm() {
    if (!document.querySelector('[data-search-term], [data-search-term-wrap]')) return;
    const query = new URLSearchParams(window.location.search).get('query');
    if (!query) {
      document.querySelectorAll('[data-search-term-wrap]').forEach((el) => {
        el.style.display = 'none';
      });
      return;
    }
    document.querySelectorAll('[data-search-term]').forEach((el) => {
      el.textContent = query;
    });
    document.querySelectorAll('.w-input[type="search"], input[name="query"]').forEach((el) => {
      if (!el.value) el.value = query;
    });
  }

  // ---------- Nieuwe site ----------

  // Menu verbergen bij naar beneden scrollen, terug bij omhoog scrollen (desktop én mobiel).
  // De afstand wordt gemeten op het moment zelf (geen vaste -150px), en het menu verdwijnt nooit
  // als het mobiele menu, een dropdown of de zoekbalk open is, of als je bovenaan de pagina staat.
  function initNavScroll() {
    const navMenu = document.querySelector('#NAVMENU');
    if (!navMenu || !window.gsap) return;
    const root = document.documentElement;
    const threshold = 12; // zoveel px in één richting scrollen voordat het menu reageert
    const topZone = 80; // bovenaan de pagina altijd zichtbaar
    let lastY = window.scrollY;
    let travel = 0;
    let hidden = false;

    const isBusy = () =>
      navMenu.getAttribute('data-menu-open') === 'true' ||
      root.getAttribute('data-search-state') === 'open' ||
      !!navMenu.querySelector('[aria-expanded="true"]');

    // Let op: een transform op #NAVMENU maakt het menu zelf het kader voor het (fixed) mobiele
    // menu en de zoekbalk erin, waardoor die worden afgekapt. Daarom de transform helemaal
    // weghalen zodra het menu terug is, en meteen als het menu, een dropdown of zoeken opengaat.
    function clearShift() {
      gsap.killTweensOf(navMenu);
      gsap.set(navMenu, { clearProps: 'transform' });
    }

    function setHidden(hide) {
      if (hide === hidden) return;
      hidden = hide;
      if (!hide) {
        gsap.to(navMenu, {
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          overwrite: true,
          onComplete: clearShift
        });
        return;
      }
      // Gemeten zonder de huidige verschuiving, ook als de vorige animatie nog loopt
      const distance = navMenu.getBoundingClientRect().bottom - gsap.getProperty(navMenu, 'y') + 10;
      gsap.to(navMenu, { y: -distance, duration: 0.45, ease: 'power2.in', overwrite: true });
    }

    function onScroll() {
      const y = Math.max(window.scrollY, 0);
      const delta = y - lastY;
      lastY = y;
      if (isBusy()) {
        travel = 0;
        showIfBusy();
        return;
      }
      if (y < topZone) {
        travel = 0;
        setHidden(false);
        return;
      }
      if (!delta) return;
      // Andere richting: opnieuw tellen
      if (delta > 0 !== travel > 0) travel = 0;
      travel += delta;
      if (travel > threshold) setHidden(true);
      else if (travel < -threshold) setHidden(false);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // Gaat het menu, een dropdown of zoeken open terwijl de balk weg is: meteen terughalen
    const showIfBusy = () => {
      if (!isBusy()) return;
      hidden = false;
      clearShift(); // direct, zonder animatie: anders is het menu tijdens het terugschuiven afgekapt
    };
    new MutationObserver(showIfBusy).observe(navMenu, {
      attributes: true,
      subtree: true,
      attributeFilter: ['data-menu-open', 'aria-expanded']
    });
    new MutationObserver(showIfBusy).observe(root, { attributes: true, attributeFilter: ['data-search-state'] });
  }


  function initMegaNavDirectionalHover() {
    const DUR = {
      bgMorph: 0.4,
      contentIn: 0.3,
      contentOut: 0.2,
      stagger: 0.25,
      backdropIn: 0.3,
      backdropOut: 0.2,
      openScale: 0.35,
      closeScale: 0.25,
    };
    const HOVER_ENTER = 120;
    const HOVER_LEAVE = 150;
    // DOM references
    const menuWrap = document.querySelector("[data-menu-wrap]");
    const navList = document.querySelector("[data-nav-list]");
    const dropWrapper = document.querySelector("[data-dropdown-wrapper]");
    const dropContainer = document.querySelector("[data-dropdown-container]");
    const dropBg = document.querySelector("[data-dropdown-bg]");
    const backdrop = document.querySelector("[data-menu-backdrop]");
    const toggles = [...document.querySelectorAll("[data-dropdown-toggle]")];
    const panels = [...document.querySelectorAll("[data-nav-content]")];
    const burger = document.querySelector("[data-burger-toggle]");
    const backBtn = document.querySelector("[data-mobile-back]");
    const logo = document.querySelector("[data-menu-logo]");
    const [lineTop, lineMid, lineBot] = ["top", "mid", "bot"].map(
      (id) => document.querySelector(`[data-burger-line='${id}']`)
    );
    // Alleen op pagina's met het nieuwe menu
    if (!menuWrap || !navList || !dropWrapper || !dropContainer || !backdrop || !burger || !backBtn) return;
    // Logo-link zonder tekst: naam voor schermlezers
    if (logo && !logo.textContent.trim() && !logo.getAttribute("aria-label")) logo.setAttribute("aria-label", "OZO home");
    // State
    const state = {
      isOpen: false,
      activePanel: null,
      activePanelIndex: -1,
      isMobile: window.innerWidth <= 991,
      mobileMenuOpen: false,
      mobilePanelActive: null,
      hoverTimer: null,
      leaveTimer: null,
      tl: null,
      mobileTl: null,
      mobilePanelTl: null,
    };
    // Helpers
    const getPanel = (name) => document.querySelector(`[data-nav-content="${name}"]`);
    const getToggle = (name) => document.querySelector(`[data-dropdown-toggle="${name}"]`);
    const getFade = (el) => el.querySelectorAll("[data-menu-fade]");
    const getNavItems = () => navList.querySelectorAll("[data-nav-list-item]");
    const getIndex = (name) => toggles.indexOf(getToggle(name));
    const stagger = (n) => (n <= 1 ? 0 : { amount: DUR.stagger });
    const ICON_SEL = ".mega-nav__bar-link-icon.is--dropdown";
    const getIcon = (name) => getToggle(name)?.querySelector(ICON_SEL);

    function spinIcon(tl, name, open, at = 0) {
      const icon = getIcon(name);
      if (!icon) return;
      tl.to(icon, {
        rotate: open ? 180 : 0,
        duration: open ? DUR.openScale : DUR.closeScale,
        ease: open ? "power3.out" : "power2.in",
        overwrite: "auto",
      }, at);
    }

    function clearTimers() {
      clearTimeout(state.hoverTimer);
      clearTimeout(state.leaveTimer);
      state.hoverTimer = state.leaveTimer = null;
    }

    function killTl(key) {
      if (state[key]) {
        state[key].kill();
        state[key] = null;
      }
    }

    function killDropdown() {
      killTl("tl");
      gsap.killTweensOf(dropContainer);
      gsap.killTweensOf(backdrop);
      panels.forEach((p) => {
        gsap.killTweensOf(p);
        gsap.killTweensOf(getFade(p));
      });
    }

    function killMobile() {
      killTl("mobileTl");
      gsap.killTweensOf([navList, lineTop, lineMid, lineBot]);
    }

    function killMobilePanel() {
      killTl("mobilePanelTl");
      gsap.killTweensOf(getNavItems());
      gsap.killTweensOf([backBtn, logo]);
      panels.forEach((p) => {
        gsap.killTweensOf(p);
        gsap.killTweensOf(getFade(p));
      });
    }

    function resetToggles() {
      toggles.forEach((t) => t.setAttribute("aria-expanded", "false"));
    }

    function resetDesktop() {
      panels.forEach((p) => {
        gsap.set(p, {
          visibility: "hidden",
          opacity: 0,
          pointerEvents: "none",
          x: 0,
          y: 0,
          xPercent: 0
        });
        gsap.set(getFade(p), { autoAlpha: 0, x: 0, y: 0, xPercent: 0 });
      });
      gsap.set(dropContainer, { height: 0, clearProps: "transform" });
      gsap.set(backdrop, { autoAlpha: 0 });
      menuWrap.setAttribute("data-menu-open", "false");
      resetToggles();
    }

    function setupMobile() {
      panels.forEach((p) => {
        gsap.set(p, { autoAlpha: 0, xPercent: 0, visibility: "visible", pointerEvents: "none" });
        gsap.set(getFade(p), { xPercent: 20, autoAlpha: 0 });
      });
      gsap.set(getNavItems(), { xPercent: 0, y: 0, autoAlpha: 1 });
      gsap.set(navList, { autoAlpha: 0, x: 0 });
      gsap.set(backBtn, { autoAlpha: 0 });
      gsap.set(logo, { autoAlpha: 1 });
      gsap.set(dropContainer, { clearProps: "height" });
      gsap.set(backdrop, { autoAlpha: 0 });
    }

    function measurePanel(name) {
      const el = getPanel(name);
      if (!el) return 0;
      const s = el.style;
      const prev = [s.visibility, s.opacity, s.pointerEvents];
      Object.assign(s, { visibility: "visible", opacity: "0", pointerEvents: "none" });
      const h = el.getBoundingClientRect().height;
      [s.visibility, s.opacity, s.pointerEvents] = prev;
      return h;
    }
    // DESKTOP — open dropdown (first open)
    function openDropdown(panelName) {
      if (state.isOpen && state.activePanel === panelName) return;
      if (state.isOpen) return switchPanel(state.activePanel, panelName);
      const height = measurePanel(panelName);
      if (!height) return;
      killDropdown();
      resetDesktop();
      const el = getPanel(panelName);
      const fade = getFade(el);
      const toggle = getToggle(panelName);
      state.isOpen = true;
      state.activePanel = panelName;
      state.activePanelIndex = getIndex(panelName);
      menuWrap.setAttribute("data-menu-open", "true");
      if (toggle) toggle.setAttribute("aria-expanded", "true");
      gsap.set(dropContainer, { height: 0 });
      const tl = gsap.timeline();
      state.tl = tl;
      tl.to(backdrop, { autoAlpha: 1, duration: DUR.backdropIn, ease: "power2.out" }, 0);
      tl.to(dropContainer, { height, duration: DUR.openScale, ease: "power3.out" }, 0);
      tl.set(el, { visibility: "visible", opacity: 1, pointerEvents: "auto" }, 0.05);
      if (fade.length) {
        tl.fromTo(fade, { autoAlpha: 0, y: 8 }, {
            autoAlpha: 1,
            y: 0,
            duration: DUR.contentIn,
            stagger: stagger(fade.length),
            ease: "power3.out"
          },
          0.1
        );
      }
    }
    // DESKTOP — close dropdown
    function closeDropdown() {
      if (!state.isOpen) return;
      const el = getPanel(state.activePanel);
      const fade = el ? getFade(el) : [];
      killDropdown();
      const tl = gsap.timeline({
        onComplete() {
          state.isOpen = false;
          state.activePanel = null;
          state.activePanelIndex = -1;
          state.tl = null;
          resetDesktop();
        },
      });
      state.tl = tl;
      if (fade.length) tl.to(fade, {
        autoAlpha: 0,
        y: -4,
        duration: DUR.contentOut * 0.7,
        ease: "power2.in"
      }, 0);
      tl.to(dropContainer, { height: 0, duration: DUR.closeScale, ease: "power2.in" }, 0.05);
      tl.to(backdrop, { autoAlpha: 0, duration: DUR.backdropOut, ease: "power2.out" }, 0);
      if (el) tl.set(el, { visibility: "hidden", opacity: 0, pointerEvents: "none" });
    }
    // DESKTOP — switch panel (directional)
    function switchPanel(fromName, toName) {
      const dir = getIndex(toName) > getIndex(fromName) ? 1 : -1;
      const fromEl = getPanel(fromName),
        toEl = getPanel(toName);
      if (!fromEl || !toEl) return;
      const fromFade = getFade(fromEl),
        toFade = getFade(toEl);
      const toHeight = measurePanel(toName);
      if (!toHeight) return;
      killDropdown();
      // Reset all panels, then restore fromEl as visible
      panels.forEach((p) => {
        gsap.set(p, { visibility: "hidden", opacity: 0, pointerEvents: "none", xPercent: 0 });
        gsap.set(getFade(p), { autoAlpha: 0, x: 0, y: 0 });
      });
      gsap.set(fromEl, { visibility: "visible", opacity: 1, pointerEvents: "auto", x: 0 });
      if (fromFade.length) gsap.set(fromFade, { autoAlpha: 1, x: 0, y: 0 });
      gsap.set(backdrop, { autoAlpha: 1 });
      const toToggle = getToggle(toName);
      state.activePanel = toName;
      state.activePanelIndex = getIndex(toName);
      resetToggles();
      if (toToggle) toToggle.setAttribute("aria-expanded", "true");
      const xOut = dir * -30,
        xIn = dir * 30;
      const tl = gsap.timeline();
      state.tl = tl;
      if (fromFade.length) tl.to(fromFade, {
        autoAlpha: 0,
        x: xOut,
        duration: DUR.contentOut,
        ease: "power2.in"
      }, 0);
      tl.set(fromEl, { visibility: "hidden", opacity: 0, pointerEvents: "none", xPercent: 0 }, DUR
        .contentOut);
      if (fromFade.length) tl.set(fromFade, { x: 0 }, DUR.contentOut);
      tl.to(dropContainer, { height: toHeight, duration: DUR.bgMorph, ease: "power3.out" }, 0.05);
      tl.set(toEl, { visibility: "visible", opacity: 1, pointerEvents: "auto", xPercent: 0 }, DUR
        .contentOut * 0.5);
      if (toFade.length) {
        tl.fromTo(toFade, { autoAlpha: 0, x: xIn }, {
            autoAlpha: 1,
            x: 0,
            duration: DUR.contentIn,
            stagger: stagger(toFade.length),
            ease: "power3.out"
          },
          DUR.contentOut * 0.6
        );
      }
    }
    // DESKTOP — hover intent
    function handleToggleEnter(e) {
      if (state.isMobile) return;
      const name = e.currentTarget.getAttribute("data-dropdown-toggle");
      if (!name) return;
      clearTimeout(state.leaveTimer);
      state.leaveTimer = null;
      clearTimeout(state.hoverTimer);
      state.hoverTimer = setTimeout(() => openDropdown(name), state.isOpen ? 0 : HOVER_ENTER);
    }

    function handleToggleLeave() {
      if (state.isMobile) return;
      clearTimeout(state.hoverTimer);
      state.hoverTimer = null;
      state.leaveTimer = setTimeout(closeDropdown, HOVER_LEAVE);
    }

    function handleWrapperEnter() {
      if (state.isMobile) return;
      clearTimeout(state.leaveTimer);
      state.leaveTimer = null;
    }

    function handleWrapperLeave() {
      if (state.isMobile) return;
      state.leaveTimer = setTimeout(closeDropdown, HOVER_LEAVE);
    }
    // DESKTOP — close behaviors
    function handleEscape(e) {
      if (e.key !== "Escape") return;
      if (state.isMobile) {
        state.mobilePanelActive ? closeMobilePanel() : state.mobileMenuOpen && closeMobileMenu();
        return;
      }
      if (state.isOpen) {
        const t = getToggle(state.activePanel);
        closeDropdown();
        if (t) t.focus();
      }
    }

    function handleDocClick(e) {
      if (state.isMobile || !state.isOpen) return;
      if (!e.target.closest("[data-menu-wrap]")) closeDropdown();
    }
    // DESKTOP — keyboard navigation
    function focusFirstLink(panelName) {
      setTimeout(() => {
        const el = getPanel(panelName);
        if (!el) return;
        const link = el.querySelector("a");
        if (!link) return;
        gsap.set(link, { visibility: "visible" });
        link.focus();
      }, 80);
    }

    function handleKeydownOnToggle(e) {
      if (state.isMobile) return;
      const name = e.currentTarget.getAttribute("data-dropdown-toggle");
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (state.isOpen && state.activePanel === name) closeDropdown();
        else {
          openDropdown(name);
          focusFirstLink(name);
        }
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!state.isOpen || state.activePanel !== name) openDropdown(name);
        focusFirstLink(name);
      }
      if (e.key === "Tab" && !e.shiftKey && state.isOpen && state.activePanel === name) {
        e.preventDefault();
        const link = getPanel(name)?.querySelector("a");
        if (link) link.focus();
      }
    }

    function handleKeydownInPanel(e) {
      if (state.isMobile || !state.isOpen) return;
      const el = getPanel(state.activePanel);
      if (!el) return;
      const links = [...el.querySelectorAll("a")];
      const idx = links.indexOf(document.activeElement);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        links[(idx + 1) % links.length].focus();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (idx <= 0) { const t = getToggle(state.activePanel); if (t) t.focus(); }
        else links[idx - 1].focus();
      }
      if (e.key === "Tab" && !e.shiftKey && idx === links.length - 1) {
        e.preventDefault();
        const curIdx = toggles.indexOf(getToggle(state.activePanel));
        const next = curIdx < toggles.length - 1 ? toggles[curIdx + 1] : null;
        closeDropdown();
        if (next) next.focus();
      }
      if (e.key === "Tab" && e.shiftKey && idx === 0) {
        e.preventDefault();
        const t = getToggle(state.activePanel);
        if (t) t.focus();
      }
    }
    // MOBILE — burger animation
    function animateBurger(toX) {
      const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
      if (toX) {
        tl.to(lineTop, { y: "0.3125em", duration: 0.15 }, 0);
        tl.to(lineBot, { y: "-0.3125em", duration: 0.15 }, 0);
        tl.to(lineMid, { autoAlpha: 0, duration: 0.1 }, 0.1);
        tl.to(lineTop, { rotation: 45, duration: 0.2 }, 0.15);
        tl.to(lineBot, { rotation: -45, duration: 0.2 }, 0.15);
      } else {
        tl.to(lineTop, { rotation: 0, duration: 0.2 }, 0);
        tl.to(lineBot, { rotation: 0, duration: 0.2 }, 0);
        tl.to(lineTop, { y: 0, duration: 0.15 }, 0.15);
        tl.to(lineBot, { y: 0, duration: 0.15 }, 0.15);
        tl.to(lineMid, { autoAlpha: 1, duration: 0.1 }, 0.15);
      }
      return tl;
    }
    // MOBILE — open/close menu
    function openMobileMenu() {
      killMobile();
      state.mobileMenuOpen = true;
      menuWrap.setAttribute("data-menu-open", "true");
      burger.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      const items = getNavItems();
      const tl = gsap.timeline();
      state.mobileTl = tl;
      tl.add(animateBurger(true), 0);
      tl.to(navList, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, 0);
      if (items.length) {
        tl.fromTo(items, { autoAlpha: 0, y: 12 }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.3,
            stagger: 0.04,
            ease: "power3.out"
          },
          0.15
        );
      }
    }

    function closeMobileMenu() {
      const hadPanel = state.mobilePanelActive;
      const panelEl = hadPanel ? getPanel(hadPanel) : null;
      killMobile();
      killMobilePanel();
      menuWrap.setAttribute("data-menu-open", "false");
      state.mobileMenuOpen = false;
      state.mobilePanelActive = null;
      burger.setAttribute("aria-expanded", "false");
      const tl = gsap.timeline({
        onComplete() {
          document.body.style.overflow = "";
          state.mobileTl = null;
          setupMobile();
        },
      });
      state.mobileTl = tl;
      tl.add(animateBurger(false), 0);
      // If a panel was open, fade it out with the close — no snap reset
      if (hadPanel && panelEl) {
        tl.to(panelEl, { autoAlpha: 0, duration: 0.3, ease: "power2.inOut" }, 0.05);
        tl.to(backBtn, { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, 0.05);
      }
      // Fade out the nav list container
      tl.to(navList, { autoAlpha: 0, duration: 0.3, ease: "power2.inOut" }, 0.05);
    }
    // MOBILE — slide-over panels 
    function openMobilePanel(panelName) {
      const el = getPanel(panelName);
      if (!el) return;
      killMobilePanel();
      state.mobilePanelActive = panelName;
      const navItems = getNavItems();
      const panelFade = getFade(el);
      const tl = gsap.timeline();
      state.mobilePanelTl = tl;
      // Fade out each nav item to the left
      if (navItems.length) {
        tl.to(navItems, {
          xPercent: -10,
          autoAlpha: 0,
          duration: 0.35,
          stagger: 0.03,
          ease: "power2.in",
        }, 0);
      }
      // Logo → back button swap
      tl.to(logo, { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, 0);
      tl.to(backBtn, { autoAlpha: 1, duration: 0.25, ease: "power2.inOut" }, 0.15);
      // Show panel container, then fade in its items from the right
      tl.set(el, { autoAlpha: 1, xPercent: 0, pointerEvents: "auto" }, 0.2);
      if (panelFade.length) {
        tl.fromTo(panelFade, { xPercent: 8, autoAlpha: 0 }, {
            xPercent: 0,
            autoAlpha: 1,
            duration: 0.3,
            stagger: stagger(panelFade.length),
            ease: "power3.out"
          },
          0.25
        );
      }
    }

    function closeMobilePanel() {
      if (!state.mobilePanelActive) return;
      const el = getPanel(state.mobilePanelActive);
      if (!el) return;
      killMobilePanel();
      const navItems = getNavItems();
      const panelFade = getFade(el);
      const tl = gsap.timeline({
        onComplete() {
          state.mobilePanelActive = null;
          state.mobilePanelTl = null;
        },
      });
      state.mobilePanelTl = tl;
      // Fade out panel items to the right
      if (panelFade.length) {
        tl.to(el, {
          xPercent: 20,
          autoAlpha: 0,
          duration: 0.3,
          stagger: 0.02,
          ease: "power2.in",
        }, 0);
      }
      // Hide panel
      tl.set(el, { autoAlpha: 0, pointerEvents: "none" }, 0.25);
      // Back → logo swap
      tl.to(backBtn, { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, 0);
      tl.to(logo, { autoAlpha: 1, duration: 0.25, ease: "power2.out" }, 0.15);
      // Fade nav items back in from center
      if (navItems.length) {
        tl.fromTo(navItems, { xPercent: -20, autoAlpha: 0 }, {
            xPercent: 0,
            autoAlpha: 1,
            duration: 0.35,
            stagger: 0.03,
            ease: "power3.out"
          },
          0.25
        );
      }
    }

    function handleToggleClick(e) {
      if (!state.isMobile || !state.mobileMenuOpen) return;
      const name = e.currentTarget.getAttribute("data-dropdown-toggle");
      if (name) {
        e.preventDefault();
        openMobilePanel(name);
      }
    }
    // RESIZE
    let resizeTimer = null;
    let lastWidth = window.innerWidth;

    function handleResize() {
      const w = window.innerWidth;
      if (w === lastWidth) return;
      lastWidth = w;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const was = state.isMobile;
        state.isMobile = window.innerWidth <= 991;
        if (was && !state.isMobile) {
          killMobile();
          killMobilePanel();
          gsap.set(navList, { clearProps: "all" });
          gsap.set(getNavItems(), { clearProps: "all" });
          gsap.set(backBtn, { autoAlpha: 0 });
          gsap.set(logo, { clearProps: "all" });
          gsap.set([lineTop, lineMid, lineBot], { rotation: 0, y: 0, autoAlpha: 1 });
          panels.forEach((p) => {
            gsap.set(p, { clearProps: "all" });
            gsap.set(getFade(p), { clearProps: "all" });
          });
          burger.setAttribute("aria-expanded", "false");
          state.mobileMenuOpen = false;
          state.mobilePanelActive = null;
          document.body.style.overflow = "";
          resetDesktop();
        }
        if (!was && state.isMobile) {
          killDropdown();
          state.isOpen = false;
          state.activePanel = null;
          state.activePanelIndex = -1;
          clearTimers();
          menuWrap.setAttribute("data-menu-open", "false");
          resetToggles();
          setupMobile();
        }
      }, 150);
    }
    // EVENT BINDING
    toggles.forEach((btn) => {
      btn.addEventListener("mouseenter", handleToggleEnter);
      btn.addEventListener("mouseleave", handleToggleLeave);
      btn.addEventListener("keydown", handleKeydownOnToggle);
      btn.addEventListener("click", handleToggleClick);
    });
    dropWrapper.addEventListener("mouseenter", handleWrapperEnter);
    dropWrapper.addEventListener("mouseleave", handleWrapperLeave);
    panels.forEach((p) => p.addEventListener("keydown", handleKeydownInPanel));
    backdrop.addEventListener("click", closeDropdown);
    document.addEventListener("keydown", handleEscape);
    document.addEventListener("click", handleDocClick);
    burger.addEventListener("click", () => state.mobileMenuOpen ? closeMobileMenu() :
      openMobileMenu());
    backBtn.addEventListener("click", closeMobilePanel);
    window.addEventListener("resize", handleResize);
    // INIT
    state.isMobile ? setupMobile() : resetDesktop();
  }

  // Menufoto's alvast ophalen en uitpakken, zodat het menu de eerste keer ook soepel openklapt
  function initMegaNavImages() {
    const imgs = [...document.querySelectorAll('[data-nav-content] img')];
    if (!imgs.length) return;
    // Na het laden van de pagina, als de browser tijd heeft
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
    const warm = () => idle(() => imgs.forEach((img) => {
      img.loading = 'eager';
      if (img.decode) img.decode().catch(() => {});
    }));
    if (document.readyState === 'complete') warm();
    else window.addEventListener('load', warm, { once: true });
  }

  // Search toggle
  function initSearchToggle() {
    const r = document.documentElement,
      w = document.querySelector("[data-menu-wrap]"),
      t = document.querySelector("[data-search-toggle]"),
      p = document.querySelector("[data-search-panel]");
    if (!t || !p) return;
    const i = p.querySelector(".w-input"),
      isOpen = () => r.getAttribute("data-search-state") === "open",
      navOpen = () => w && w.getAttribute("data-menu-open") === "true";
    t.setAttribute("aria-expanded", "false");
    // Toggle is een div: knop-rol + toetsenbord, anders is aria-expanded niet toegestaan
    if (t.tagName !== "BUTTON") {
      t.setAttribute("role", "button");
      if (!t.hasAttribute("tabindex")) t.setAttribute("tabindex", "0");
      t.addEventListener("keydown", e => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        isOpen() ? close(0) : open();
      });
    }

    function open() {
      if (navOpen()) document.dispatchEvent(new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true
      }));
      r.setAttribute("data-search-state", "open");
      t.setAttribute("aria-expanded", "true");
      if (i) setTimeout(() => i.focus(), 120);
    }

    function close(f) {
      r.removeAttribute("data-search-state");
      t.setAttribute("aria-expanded", "false");
      if (f) t.focus();
    }
    document.addEventListener("click", e => {
      const node = e.target.nodeType === 1 ? e.target : e.target.parentElement;
      if (!node) return;
      if (node.closest("[data-search-toggle]")) {
        e.preventDefault();
        isOpen() ? close(0) : open();
        return;
      }
      if (!isOpen()) return;
      if (node === p) { close(0); return; }
      if (!node.closest("[data-search-panel]")) close(0);
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && isOpen()) close(1); });
  }

  // Form interactions
  function initAdvancedFormValidation() {
    const forms = document.querySelectorAll('[data-form-validate]');
    forms.forEach((formContainer) => {
      const form = formContainer.querySelector('form');
      if (!form) return;
      const validateFields = form.querySelectorAll('[data-validate]');
      // Webflow-forms gebruiken [data-submit] + input[type=submit].
      // Custom forms (zoals Laposta) hebben die niet: dan alleen veldvalidatie + form.__validate.
      const dataSubmit = form.querySelector('[data-submit]');
      const realSubmitInput = dataSubmit ? dataSubmit.querySelector('input[type="submit"]') :
        null;
      // Disable select options with invalid values on page load
      validateFields.forEach(function (fieldGroup) {
        const select = fieldGroup.querySelector('select');
        if (select) {
          const options = select.querySelectorAll('option');
          options.forEach(function (option) {
            if (
              option.value === '' ||
              option.value === 'disabled' ||
              option.value === 'null' ||
              option.value === 'false'
            ) {
              option.setAttribute('disabled', 'disabled');
            }
          });
        }
      });

      function validateAndStartLiveValidationForAll() {
        let allValid = true;
        let firstInvalidField = null;
        validateFields.forEach(function (fieldGroup) {
          const input = fieldGroup.querySelector('input, textarea, select');
          const radioCheckGroup = fieldGroup.querySelector('[data-radiocheck-group]');
          if (!input && !radioCheckGroup) return;
          if (input) input.__validationStarted = true;
          if (radioCheckGroup) {
            radioCheckGroup.__validationStarted = true;
            const inputs = radioCheckGroup.querySelectorAll(
              'input[type="radio"], input[type="checkbox"]');
            inputs.forEach(function (input) {
              input.__validationStarted = true;
            });
          }
          updateFieldStatus(fieldGroup);
          if (!isValid(fieldGroup)) {
            allValid = false;
            if (!firstInvalidField) {
              firstInvalidField = input || radioCheckGroup.querySelector('input');
            }
          }
        });
        if (!allValid && firstInvalidField) {
          firstInvalidField.focus();
        }
        return allValid;
      }

      function isValid(fieldGroup) {
        const radioCheckGroup = fieldGroup.querySelector('[data-radiocheck-group]');
        if (radioCheckGroup) {
          const inputs = radioCheckGroup.querySelectorAll(
            'input[type="radio"], input[type="checkbox"]');
          const checkedInputs = radioCheckGroup.querySelectorAll('input:checked');
          const min = parseInt(radioCheckGroup.getAttribute('min')) || 1;
          const max = parseInt(radioCheckGroup.getAttribute('max')) || inputs.length;
          const checkedCount = checkedInputs.length;
          if (inputs[0].type === 'radio') {
            return checkedCount >= 1;
          } else {
            if (inputs.length === 1) {
              return inputs[0].checked;
            } else {
              return checkedCount >= min && checkedCount <= max;
            }
          }
        } else {
          const input = fieldGroup.querySelector('input, textarea, select');
          if (!input) return false;
          let valid = true;
          const min = parseInt(input.getAttribute('min')) || 0;
          const max = parseInt(input.getAttribute('max')) || Infinity;
          const value = input.value.trim();
          const length = value.length;
          if (input.tagName.toLowerCase() === 'select') {
            if (
              value === '' ||
              value === 'disabled' ||
              value === 'null' ||
              value === 'false'
            ) {
              valid = false;
            }
          } else if (input.type === 'email') {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            valid = emailPattern.test(value);
          } else {
            if (input.hasAttribute('min') && length < min) valid = false;
            if (input.hasAttribute('max') && length > max) valid = false;
          }
          return valid;
        }
      }

      function updateFieldStatus(fieldGroup) {
        const radioCheckGroup = fieldGroup.querySelector('[data-radiocheck-group]');
        if (radioCheckGroup) {
          const inputs = radioCheckGroup.querySelectorAll(
            'input[type="radio"], input[type="checkbox"]');
          const checkedInputs = radioCheckGroup.querySelectorAll('input:checked');
          if (checkedInputs.length > 0) {
            fieldGroup.classList.add('is--filled');
          } else {
            fieldGroup.classList.remove('is--filled');
          }
          const valid = isValid(fieldGroup);
          if (valid) {
            fieldGroup.classList.add('is--success');
            fieldGroup.classList.remove('is--error');
          } else {
            fieldGroup.classList.remove('is--success');
            const anyInputValidationStarted = Array.from(inputs).some(input => input
              .__validationStarted);
            if (anyInputValidationStarted) {
              fieldGroup.classList.add('is--error');
            } else {
              fieldGroup.classList.remove('is--error');
            }
          }
        } else {
          const input = fieldGroup.querySelector('input, textarea, select');
          if (!input) return;
          const value = input.value.trim();
          if (value) {
            fieldGroup.classList.add('is--filled');
          } else {
            fieldGroup.classList.remove('is--filled');
          }
          const valid = isValid(fieldGroup);
          if (valid) {
            fieldGroup.classList.add('is--success');
            fieldGroup.classList.remove('is--error');
          } else {
            fieldGroup.classList.remove('is--success');
            if (input.__validationStarted) {
              fieldGroup.classList.add('is--error');
            } else {
              fieldGroup.classList.remove('is--error');
            }
          }
        }
      }
      validateFields.forEach(function (fieldGroup) {
        const input = fieldGroup.querySelector('input, textarea, select');
        const radioCheckGroup = fieldGroup.querySelector('[data-radiocheck-group]');
        if (radioCheckGroup) {
          const inputs = radioCheckGroup.querySelectorAll(
            'input[type="radio"], input[type="checkbox"]');
          inputs.forEach(function (input) {
            input.__validationStarted = false;
            input.addEventListener('change', function () {
              requestAnimationFrame(function () {
                if (!input.__validationStarted) {
                  const checkedCount = radioCheckGroup.querySelectorAll(
                    'input:checked').length;
                  const min = parseInt(radioCheckGroup.getAttribute('min')) || 1;
                  if (checkedCount >= min) {
                    input.__validationStarted = true;
                  }
                }
                if (input.__validationStarted) {
                  updateFieldStatus(fieldGroup);
                }
              });
            });
            input.addEventListener('blur', function () {
              input.__validationStarted = true;
              updateFieldStatus(fieldGroup);
            });
          });
        } else if (input) {
          input.__validationStarted = false;
          if (input.tagName.toLowerCase() === 'select') {
            input.addEventListener('change', function () {
              input.__validationStarted = true;
              updateFieldStatus(fieldGroup);
            });
          } else {
            input.addEventListener('input', function () {
              const value = input.value.trim();
              const length = value.length;
              const min = parseInt(input.getAttribute('min')) || 0;
              const max = parseInt(input.getAttribute('max')) || Infinity;
              if (!input.__validationStarted) {
                if (input.type === 'email') {
                  if (isValid(fieldGroup)) input.__validationStarted = true;
                } else {
                  if (
                    (input.hasAttribute('min') && length >= min) ||
                    (input.hasAttribute('max') && length <= max)
                  ) {
                    input.__validationStarted = true;
                  }
                }
              }
              if (input.__validationStarted) {
                updateFieldStatus(fieldGroup);
              }
            });
            input.addEventListener('blur', function () {
              input.__validationStarted = true;
              updateFieldStatus(fieldGroup);
            });
          }
        }
      });

      // Validator beschikbaar maken voor custom submit handlers (Laposta)
      form.__validate = validateAndStartLiveValidationForAll;

      // Alleen Webflow-forms: submit via [data-submit] + echte input[type=submit]
      if (!dataSubmit || !realSubmitInput) return;
      dataSubmit.addEventListener('click', function () {
        if (validateAndStartLiveValidationForAll()) {
          form.requestSubmit(realSubmitInput);
        }
      });
      form.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && event.target.tagName !== 'TEXTAREA') {
          event.preventDefault();
          if (validateAndStartLiveValidationForAll()) {
            form.requestSubmit(realSubmitInput);
          }
        }
      });
    });
  }

  // Vimeo background video
  function initVimeoBackground() {
    // Officiële Vimeo Player SDK via jsDelivr (vaste versie): zelfde API, maar geen cookies van player.vimeo.com
    const VIMEO_SDK = "https://cdn.jsdelivr.net/npm/@vimeo/player@2.30.4/dist/player.min.js";

    // Load Vimeo Player SDK if it isn't on the page yet
    function loadVimeoSDK(callback) {
      if (window.Vimeo && window.Vimeo.Player) {
        callback();
        return;
      }
      const existing = document.querySelector(`script[src="${VIMEO_SDK}"]`);
      if (existing) {
        existing.addEventListener("load", callback, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = VIMEO_SDK;
      script.onload = callback;
      document.head.appendChild(script);
    }

    function initVimeoBGVideo() {
      // Select all elements that have [data-vimeo-bg-init]
      const vimeoPlayers = document.querySelectorAll("[data-vimeo-bg-init]");
      if (!vimeoPlayers.length) return;

      vimeoPlayers.forEach(function (vimeoElement, index) {
        // Prevent double init
        if (vimeoElement.hasAttribute("data-vimeo-ready")) return;
        vimeoElement.setAttribute("data-vimeo-ready", "true");

        // Add Vimeo URL ID to the iframe [src]
        const vimeoVideoID = vimeoElement.getAttribute("data-vimeo-video-id");
        if (!vimeoVideoID) return;
        const iframe = vimeoElement.querySelector("iframe");
        if (!iframe) return;
        // dnt=1: Vimeo zet geen tracking-cookies
        const vimeoVideoURL =
          `https://player.vimeo.com/video/${vimeoVideoID}?api=1&background=1&autoplay=0&loop=1&muted=1&dnt=1`;
        iframe.setAttribute("src", vimeoVideoURL);
        // Decoratieve achtergrondvideo: titel voor de iframe, maar niet voorlezen of focussen
        iframe.setAttribute("title", "Achtergrondvideo");
        iframe.setAttribute("aria-hidden", "true");
        iframe.setAttribute("tabindex", "-1");

        // Assign an ID to each element
        const videoIndexID = "vimeo-bg-index-" + index;
        vimeoElement.setAttribute("id", videoIndexID);

        const player = new Vimeo.Player(videoIndexID);

        // Formaat: de video vult de container via CSS (Site settings → Head, ".vimeo-bg"),
        // niet meer via meten in JavaScript. Meten na het laden liet de hero verspringen (layout shift).

        // Loaded
        player.on("play", function () {
          vimeoElement.setAttribute("data-vimeo-loaded", "true");
        });

        // Paused
        player.on("pause", function () {
          vimeoElement.setAttribute("data-vimeo-playing", "false");
        });

        // Play / pause
        function vimeoPlayerPlay() {
          vimeoElement.setAttribute("data-vimeo-activated", "true");
          vimeoElement.setAttribute("data-vimeo-playing", "true");
          player.play();
        }

        function vimeoPlayerPause() {
          player.pause();
        }

        // Scroll-based autoplay: alleen iets doen als de zichtbaarheid verandert, hooguit één keer
        // per frame. Eerder ging bij elke scroll-tik een play() naar de iframe, wat op mobiel haperde.
        let fixedHost = null;
        for (let el = vimeoElement; el && el !== document.body; el = el.parentElement) {
          if (getComputedStyle(el).position === "fixed") {
            fixedHost = el;
            break;
          }
        }
        let wasInView = null;
        let checkQueued = false;

        function isInView() {
          // Een vaste hero staat altijd 'in beeld'; hij is weg zodra je er een schermhoogte voorbij bent
          if (fixedHost) return window.scrollY < window.innerHeight;
          const rect = vimeoElement.getBoundingClientRect();
          return rect.top < window.innerHeight && rect.bottom > 0;
        }

        function checkVisibility() {
          checkQueued = false;
          const inView = isInView();
          if (inView === wasInView) return;
          wasInView = inView;
          inView ? vimeoPlayerPlay() : vimeoPlayerPause();
        }

        function queueVisibilityCheck() {
          if (checkQueued) return;
          checkQueued = true;
          requestAnimationFrame(checkVisibility);
        }

        // Autoplay
        if (vimeoElement.getAttribute("data-vimeo-autoplay") === "false") {
          player.pause();
        } else if (vimeoElement.getAttribute("data-vimeo-paused-by-user") === "false") {
          checkVisibility();
          window.addEventListener("scroll", queueVisibilityCheck, { passive: true });
        }

        // Click: Play
        const playBtn = vimeoElement.querySelector('[data-vimeo-control="play"]');
        if (playBtn) {
          playBtn.addEventListener("click", vimeoPlayerPlay);
        }

        // Click: Pause
        const pauseBtn = vimeoElement.querySelector('[data-vimeo-control="pause"]');
        if (pauseBtn) {
          pauseBtn.addEventListener("click", function () {
            vimeoPlayerPause();
            // If paused by user => kill the scroll-based autoplay
            if (vimeoElement.getAttribute("data-vimeo-autoplay") === "true") {
              vimeoElement.setAttribute("data-vimeo-paused-by-user", "true");
              window.removeEventListener("scroll", queueVisibilityCheck);
            }
          });
        }
      });
    }

    if (document.querySelector("[data-vimeo-bg-init]")) {
      loadVimeoSDK(initVimeoBGVideo);
    }
  }

  // Hero wave: subtiele, organisch bewegende golf
  function initHeroWave() {
    const waves = document.querySelectorAll("[data-hero-wave]");
    if (!waves.length) return;

    const W = 1440; // viewBox breedte
    const H = 120; // viewBox hoogte

    // Basisvorm van de bovenrand (y vanaf boven): links hoog, midden laag, rechts iets hoger
    const BASE = [20, 55, 95, 70, 40];

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Vloeiende curve door alle punten (Catmull-Rom naar cubic bezier)
    function buildPath(points) {
      let d = `M${points[0][0]},${points[0][1]}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i - 1] || points[i];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] || p2;
        const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
        const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
        const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
        const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
        d +=
          ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0]},${p2[1].toFixed(1)}`;
      }
      d += ` L${W},${H} L0,${H} Z`;
      return d;
    }

    waves.forEach(wave => {
      const path = wave.querySelector("[data-wave-path]");
      if (!path) return;

      const amp = parseFloat(wave.getAttribute("data-wave-amp")) ||
        10; // uitslag in viewBox-units
      const speed = parseFloat(wave.getAttribute("data-wave-speed")) ||
        0.35; // lager = rustiger
      const step = W / (BASE.length - 1);

      // Elk punt krijgt een eigen fase en snelheid, zodat het nooit synchroon beweegt
      const phases = BASE.map((_, i) => i * 1.7);
      const rates = BASE.map((_, i) => 1 + (i % 2 ? 0.23 : -0.17));

      function render(time) {
        const points = BASE.map((y, i) => [
          Math.round(i * step),
          y + Math.sin(time * speed * rates[i] + phases[i]) * amp
        ]);
        path.setAttribute("d", buildPath(points));
      }

      // Statische vorm bij reduced motion
      render(0);
      if (reduceMotion) return;

      let running = false;
      const start = performance.now();

      function tick() {
        if (!running) return;
        render((performance.now() - start) / 1000);
        requestAnimationFrame(tick);
      }

      // Alleen animeren als de golf in beeld is
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !running) {
            running = true;
            requestAnimationFrame(tick);
          } else if (!entry.isIntersecting) {
            running = false;
          }
        });
      });
      observer.observe(wave);
    });
  }

  // Bewegende blobs (zoals de golven): [data-blob-morph="hero-bg|hero-photo|video"] krijgt een
  // gladde vorm als clip-path die langzaam meebeweegt. Vormen: straal per hoek (h) uit de
  // Figma-vormen, geschaald naar het element (aff). data-blob-amp (uitslag, standaard 0.04) en
  // data-blob-speed (standaard 0.5) regelen de beweging. In de Designer en zonder JS toont de
  // mask uit Webflow dezelfde vorm stil; dit script zet die mask uit zodra het overneemt.
  const BLOB_SHAPES = {
    'hero-bg': {
      h: [0.5773, 0.0303, -0.0186, 0.0836, 0.0265, -0.0074, -0.0645, -0.008, 0.0031, 0.0022, -0.0185, -0.0045, -0.0009],
      aff: [0.6827, 0.4928, 0.9458, 0.4703]
    },
    'hero-photo': {
      h: [0.5047, 0.0025, 0.0029, 0.0375, -0.0534, -0.0571, 0.0058, 0.0022, 0.0028, -0.0084, 0.0114, 0.0028, -0.0001],
      aff: [0.85, 0.5546, 0.9409, 0.5245]
    },
    'video': {
      h: [0.4675, 0.0041, -0.0275, 0.0039, -0.0599, -0.0273, 0.0461, 0.0076, -0.0006, 0.0111, 0.0064, -0.0002, -0.0034],
      aff: [0.9427, 0.5317, 0.9672, 0.5806]
    }
  };

  function initBlobMorph() {
    const blobs = document.querySelectorAll('[data-blob-morph]');
    if (!blobs.length) return;

    const STEPS = 72; // punten rond de omtrek
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Vloeiende gesloten vorm: kwadratische bochten via de middens tussen de punten
    function smoothClosedPath(pts) {
      const f = (v) => v.toFixed(1);
      const n = pts.length;
      let mx = (pts[n - 1][0] + pts[0][0]) / 2;
      let my = (pts[n - 1][1] + pts[0][1]) / 2;
      let d = `M${f(mx)},${f(my)}`;
      for (let i = 0; i < n; i++) {
        const next = pts[(i + 1) % n];
        mx = (pts[i][0] + next[0]) / 2;
        my = (pts[i][1] + next[1]) / 2;
        d += `Q${f(pts[i][0])},${f(pts[i][1])} ${f(mx)},${f(my)}`;
      }
      return d + 'Z';
    }

    const mobile = window.matchMedia('(max-width: 767px)');

    blobs.forEach((el) => {
      // Optioneel een andere vorm op mobiel: data-blob-morph-mobile="hero-bg"
      const pick = () => {
        const mobileKey = el.getAttribute('data-blob-morph-mobile');
        const key = mobileKey && mobile.matches && BLOB_SHAPES[mobileKey] ? mobileKey :
          el.getAttribute('data-blob-morph');
        return BLOB_SHAPES[key];
      };
      if (!pick()) return;

      const amp = parseFloat(el.getAttribute('data-blob-amp')) || 0.04;
      const speed = parseFloat(el.getAttribute('data-blob-speed')) || 0.5;
      let ax, bx, ay, by, h, harmonics;
      const useShape = () => {
        const shape = pick();
        [ax, bx, ay, by] = shape.aff;
        h = shape.h;
        harmonics = (h.length - 1) / 2;
      };
      useShape();
      const seed = Math.random() * 100; // elke blob beweegt anders
      let width = el.offsetWidth;
      let height = el.offsetHeight;
      let lastTime = 0;

      function render(time) {
        lastTime = time;
        const t = time * speed + seed;
        const pts = [];
        for (let n = 0; n < STEPS; n++) {
          const a = (n / STEPS) * Math.PI * 2;
          let r = h[0];
          for (let k = 1; k <= harmonics; k++) {
            r += h[2 * k - 1] * Math.cos(k * a) + h[2 * k] * Math.sin(k * a);
          }
          // Zachte golven die rond de vorm lopen (2, 3 en 4 bulten)
          r += h[0] * amp * (
            Math.sin(2 * a + t * 0.9) * 0.6 +
            Math.sin(3 * a - t * 0.7 + 1.3) * 0.3 +
            Math.sin(4 * a + t * 0.5 + 2.1) * 0.15
          );
          pts.push([(ax * r * Math.cos(a) + bx) * width, (ay * r * Math.sin(a) + by) * height]);
        }
        el.style.clipPath = `path('${smoothClosedPath(pts)}')`;
      }

      // De script-vorm vervangt de stilstaande mask uit Webflow
      el.style.webkitMaskImage = 'none';
      el.style.maskImage = 'none';
      render(0);

      new ResizeObserver(() => {
        width = el.offsetWidth;
        height = el.offsetHeight;
        render(lastTime);
      }).observe(el);
      mobile.addEventListener('change', () => {
        useShape();
        render(lastTime);
      });

      if (reduceMotion) return;

      let running = false;
      const start = performance.now();

      function tick() {
        if (!running) return;
        render((performance.now() - start) / 1000);
        requestAnimationFrame(tick);
      }

      // Alleen animeren als de blob in beeld is
      new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !running) {
            running = true;
            requestAnimationFrame(tick);
          } else if (!entry.isIntersecting) {
            running = false;
          }
        });
      }).observe(el);
    });
  }

  function initNumberOdometer() {
    if (!document.querySelector('[data-odometer-group]')) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const initFlag = 'data-odometer-initialized'
    const activeTweens = new WeakMap()

    // Configuration
    const defaults = {
      duration: 1,
      ease: 'power3.out',
      elementStagger: 0.1,
      digitStagger: 0.04,
      revealDuration: 0.5,
      revealEase: 'power2.out',
      triggerStart: 'top 80%',
      staggerOrder: 'left',
      digitCycles: 2
    }

    // Scroll-triggered groups
    document.querySelectorAll('[data-odometer-group]').forEach(group => {
      if (group.hasAttribute(initFlag)) return
      group.setAttribute(initFlag, '')

      const elements = Array.from(group.querySelectorAll('[data-odometer-element]'))
      if (!elements.length || prefersReducedMotion) return

      const staggerOrder = group.getAttribute('data-odometer-stagger-order') || defaults
        .staggerOrder
      const triggerStart = group.getAttribute('data-odometer-trigger-start') || defaults
        .triggerStart
      const elementStagger = parseFloat(group.getAttribute('data-odometer-stagger')) || defaults
        .elementStagger

      const elementData = elements.map(el => {
        const originalText = el.textContent.trim()
        const hasExplicitStart = el.hasAttribute('data-odometer-start')
        const startValue = parseFloat(el.getAttribute('data-odometer-start')) || 0
        const duration = parseFloat(el.getAttribute('data-odometer-duration')) || defaults
          .duration
        const step = getLineHeightRatio(el)

        let segments = parseSegments(originalText)
        segments = mapStartDigits(segments, startValue)
        segments = markHiddenSegments(segments, startValue)

        const grow = shouldGrow(el, hasExplicitStart, startValue, segments)
        const { rollers, revealEls } = buildRollerDOM(el, segments, step, grow)

        const fontSize = parseFloat(getComputedStyle(el).fontSize)
        const revealData = revealEls.map(revealEl => {
          const widthEm = revealEl.offsetWidth / fontSize
          gsap.set(revealEl, { width: 0, overflow: 'hidden' })
          return { el: revealEl, widthEm }
        })

        return { el, rollers, duration, step, revealData, originalText }
      })

      const ordered = applyStaggerOrder(elementData, staggerOrder)

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: group,
          start: triggerStart,
          once: true
        },
        onComplete() {
          elementData.forEach(({ el, originalText, step }) => {
            cleanupElement(el, originalText)
          })
        }
      })

      ordered.forEach((data, orderIdx) => {
        const { rollers, duration, step, revealData } = data
        const offset = orderIdx * elementStagger

        revealData.forEach(({ el, widthEm }) => {
          tl.to(el, {
            width: widthEm + 'em',
            opacity: 1,
            duration: defaults.revealDuration,
            ease: defaults.revealEase
          }, offset)
        })

        rollers.forEach(({ roller, targetPos }, digitIdx) => {
          const reversedIdx = rollers.length - 1 - digitIdx
          tl.to(roller, {
            y: -targetPos * step + 'em',
            duration,
            ease: defaults.ease,
            force3D: true
          }, offset + reversedIdx * defaults.digitStagger)
        })
      })
    })

    // Programmatic update (optional add-on)
    return function updateOdometer(el, newText, options = {}) {
      const currentText = el.textContent.trim()
      if (currentText === newText) return

      const duration = options.duration || defaults.duration
      const ease = options.ease || defaults.ease
      const step = getLineHeightRatio(el)

      // Kill any running animation and clear its inline style locks
      const existing = activeTweens.get(el)
      if (existing) {
        existing.kill()
        gsap.set(el, { clearProps: 'width,overflow' })
      }

      // Measure current width before rebuilding (in em for responsive scaling)
      const fontSize = parseFloat(getComputedStyle(el).fontSize)
      const oldWidthEm = el.getBoundingClientRect().width / fontSize

      // Parse current text as start, new text as end
      const startSegments = parseSegments(currentText)
      const startDigitsStr = startSegments
        .filter(s => s.type === 'digit')
        .map(s => s.char)
        .join('')
      const startValue = parseInt(startDigitsStr, 10) || 0

      let segments = parseSegments(newText)
      segments = mapStartDigits(segments, startValue)
      segments = markHiddenSegments(segments, startValue)
      const { rollers, revealEls } = buildRollerDOM(el, segments, step, true)

      // Measure new natural width (in em)
      const newWidthEm = el.getBoundingClientRect().width / fontSize
      const widthChanged = Math.abs(oldWidthEm - newWidthEm) > 0.01

      // Lock to old width for smooth transition
      if (widthChanged) {
        gsap.set(el, { width: oldWidthEm + 'em', overflow: 'hidden' })
      }

      const tl = gsap.timeline({
        onComplete() {
          cleanupElement(el, newText)
          activeTweens.delete(el)
        }
      })
      activeTweens.set(el, tl)

      // Animate element width
      if (widthChanged) {
        tl.to(el, {
          width: newWidthEm + 'em',
          duration: defaults.revealDuration,
          ease: defaults.revealEase
        }, 0)
      }

      // Fade in hidden statics
      revealEls.forEach(revealEl => {
        if (revealEl.getAttribute('data-odometer-part') === 'static') {
          tl.to(revealEl, { opacity: 1, duration: 0.2 }, 0)
        }
      })

      // Roll digits
      rollers.forEach(({ roller, targetPos }, digitIdx) => {
        const reversedIdx = rollers.length - 1 - digitIdx
        tl.to(roller, {
          y: -targetPos * step + 'em',
          duration,
          ease,
          force3D: true
        }, reversedIdx * defaults.digitStagger)
      })
    }

    // Helpers
    function getLineHeightRatio(el) {
      const cs = getComputedStyle(el)
      const lh = cs.lineHeight
      if (lh === 'normal') return 1.2
      return parseFloat(lh) / parseFloat(cs.fontSize)
    }

    function parseSegments(text) {
      return [...text].map(char => ({
        type: /\d/.test(char) ? 'digit' : 'static',
        char
      }))
    }

    function mapStartDigits(segments, startValue) {
      const digitSlots = segments.filter(s => s.type === 'digit')
      const padded = String(Math.floor(Math.abs(startValue)))
        .padStart(digitSlots.length, '0')
        .slice(-digitSlots.length)
      let di = 0
      return segments.map(s =>
        s.type === 'digit' ? { ...s, startDigit: parseInt(padded[di++], 10) } :
        s
      )
    }

    function markHiddenSegments(segments, startValue) {
      const totalDigits = segments.filter(s => s.type === 'digit').length
      const absStart = Math.floor(Math.abs(startValue))
      const startDigitCount = absStart === 0 ? 1 : String(absStart).length
      const leadingZeros = Math.max(0, totalDigits - startDigitCount)
      if (leadingZeros === 0) return segments
      let digitsSeen = 0
      let firstDigitSeen = false
      let prevDigitHidden = false
      return segments.map(seg => {
        if (seg.type === 'digit') {
          firstDigitSeen = true
          const hidden = digitsSeen < leadingZeros
          prevDigitHidden = hidden
          digitsSeen++
          return { ...seg, hidden }
        }
        const hidden = firstDigitSeen && prevDigitHidden
        return { ...seg, hidden }
      })
    }

    function shouldGrow(el, hasExplicitStart, startValue, segments) {
      if (el.hasAttribute('data-odometer-grow')) {
        return el.getAttribute('data-odometer-grow') !== 'false'
      }
      if (!hasExplicitStart) return false
      const absStart = Math.floor(Math.abs(startValue))
      const startDigitCount = absStart === 0 ? 1 : String(absStart).length
      const endDigitCount = segments.filter(s => s.type === 'digit').length
      return startDigitCount < endDigitCount
    }

    function buildRollerDOM(el, segments, step, grow) {
      el.innerHTML = ''
      el.style.height = ''
      const rollers = []
      const revealEls = []
      const totalCells = 10 * defaults.digitCycles
      segments.forEach(seg => {
        if (seg.type === 'static') {
          const span = document.createElement('span')
          span.setAttribute('data-odometer-part', 'static')
          span.style.height = step + 'em'
          span.style.lineHeight = step
          span.textContent = seg.char
          el.appendChild(span)
          if (grow && seg.hidden) {
            gsap.set(span, { opacity: 0 })
            revealEls.push(span)
          }
          return
        }
        const mask = document.createElement('span')
        mask.setAttribute('data-odometer-part', 'mask')
        mask.style.height = step + 'em'
        mask.style.lineHeight = step
        const roller = document.createElement('span')
        roller.setAttribute('data-odometer-part', 'roller')
        roller.style.lineHeight = step

        const digits = []
        for (let d = 0; d < totalCells; d++) {
          digits.push(d % 10)
        }
        roller.textContent = digits.join('\n')
        mask.appendChild(roller)
        el.appendChild(mask)
        const startDigit = seg.startDigit || 0
        const isReveal = grow && seg.hidden
        gsap.set(roller, { y: isReveal ? step + 'em' : -startDigit * step + 'em' })
        const endDigit = parseInt(seg.char, 10)
        const targetPos = endDigit > startDigit ? endDigit : 10 + endDigit
        rollers.push({ roller, targetPos })
        if (isReveal) revealEls.push(mask)
      })
      return { rollers, revealEls }
    }

    function cleanupElement(el, originalText) {
      el.style.overflow = ''
      el.style.height = ''

      // Remove rollers, set final digit, clear inline bloat (but preserve width)
      const digits = [...originalText].filter(c => /\d/.test(c))
      let di = 0

      el.querySelectorAll('[data-odometer-part="mask"]').forEach(mask => {
        const roller = mask.querySelector('[data-odometer-part="roller"]')
        if (roller) roller.remove()
        mask.textContent = digits[di++] || ''
        mask.style.opacity = ''
        mask.style.overflow = ''
      })

      el.querySelectorAll('[data-odometer-part="static"]').forEach(stat => {
        stat.style.opacity = ''
      })
    }

    function recalcOnResize() {
      document.querySelectorAll('[data-odometer-element]').forEach(el => {
        // Force-complete any running programmatic animation
        const running = activeTweens.get(el)
        if (running) {
          running.progress(1)
          activeTweens.delete(el)
        }

        const hasRollers = el.querySelector('[data-odometer-part="roller"]')

        if (hasRollers) {
          // Pre-triggered: recalculate step-based inline styles
          const step = getLineHeightRatio(el)
          el.querySelectorAll('[data-odometer-part="mask"]').forEach(mask => {
            mask.style.height = step + 'em'
            mask.style.lineHeight = step
          })
          el.querySelectorAll('[data-odometer-part="roller"]').forEach(roller => {
            roller.style.lineHeight = step
          })
          el.querySelectorAll('[data-odometer-part="static"]').forEach(stat => {
            stat.style.lineHeight = step
          })
        }
        // Completed elements: width is em-based, scales automatically, don't touch
      })
      ScrollTrigger.refresh()
    }

    let resizeTimer
    let lastWidth = window.innerWidth
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        if (window.innerWidth === lastWidth) return
        lastWidth = window.innerWidth
        recalcOnResize()
      }, 250)
    })

    function applyStaggerOrder(items, order) {
      const arr = [...items]
      if (order === 'right') return arr.reverse()
      if (order === 'random') return shuffleArray(arr)
      return arr
    }

    function shuffleArray(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]
      }
      return arr
    }
  }


  function initWavyMarquee() {
    document.querySelectorAll('[data-wavy-marquee-init]').forEach((container) => {
      // ---------- Instellingen ----------
      const autoSpeed = 100; // basissnelheid (px per seconde)
      const viewport = [
        // [min-breedte, snelheid-schaal, golflengte-schaal, boog]
        // Boog (mobiel): één boog over de schermbreedte, hoog in het midden en laag aan beide randen
        [992, 1, 1, false],
        [768, 0.75, 1, false],
        [480, 0.6, 0.75, true],
        [0, 0.5, 0.75, true]
      ];
      const scrollSpeed = 0.004; // hoeveel scrollen versnelt (lager = rustiger)
      const scrollEase = 0.05; // hoe vloeiend de scroll-boost in/uitfadet (lager = zachter)
      const dragSpeed = 0.5; // hoeveel slepen versnelt
      const maxDragSpeed = 75; // maximale versnelling bij slepen
      const dragEase = 0.1; // hoe snel slepen uitfadet
      const waveY = 0.5; // hoogte van de golf (t.o.v. itemhoogte)
      const waveBoost = 0; // extra golfhoogte bij snelheid (0 = altijd even hoog)
      const itemsPerWave = 10; // hoeveel items per golf (hoger = langere, rustigere golf)
      const waveTravel = 0; // beweegt de golf zelf mee (0 = vaste baan)
      const pauseBuffer = 0.25; // extra marge voor pauzeren, als deel van de schermhoogte

      const getViewport = () => viewport.find(([min]) => innerWidth >= min).slice(1);

      container._wavyMarqueeObserver?.kill();
      container._wavyMarqueeTrigger?.kill();

      if (container._wavyMarqueeTick) gsap.ticker.remove(container._wavyMarqueeTick);
      if (container._wavyMarqueeResize) window.removeEventListener('resize', container
        ._wavyMarqueeResize);

      const list = container.querySelector('[data-wavy-marquee-list]');
      if (!list) return;

      const originals = [...list.querySelectorAll('[data-wavy-marquee-item]')].map((item) => item
        .cloneNode(true));
      if (!originals.length) return;

      const baseDirection = container.dataset.wavyMarqueeDirection === 'flipped' ? 1 : -1;
      const setX = gsap.quickSetter(list, 'x', 'px');
      const fullCircle = Math.PI * 2;

      let items = [];
      let loopWidth = 0,
        waveLength = 0,
        averageWidth = 1,
        travel = 0,
        pausePadding = 0;
      let speed = 1,
        targetSpeed = 1,
        direction = baseDirection;
      let isActive = false,
        isDragging = false;
      let [speedScale, waveScale, arch] = getViewport();

      // Marge boven/onder de container voordat de animatie pauzeert
      const getPauseMargin = () => pausePadding + innerHeight * pauseBuffer;

      function addBatch() {
        const fragment = document.createDocumentFragment();
        originals.forEach((item) => fragment.appendChild(item.cloneNode(true)));
        list.appendChild(fragment);
      }

      function buildLoop() {
        list.innerHTML = '';

        addBatch();
        addBatch();

        const firstItems = [...list.querySelectorAll('[data-wavy-marquee-item]')];
        loopWidth = firstItems[originals.length].offsetLeft - firstItems[0].offsetLeft;

        for (let i = 2; i < Math.max(2, Math.ceil(container.offsetWidth / loopWidth) + 1); i++) {
          addBatch();
        }

        items = [...list.querySelectorAll('[data-wavy-marquee-item]')];

        const originalItems = firstItems.slice(0, originals.length);
        averageWidth = originalItems.reduce((sum, item) => sum + item.offsetWidth, 0) / originals
          .length;
        waveLength = arch ? container.offsetWidth * 2 :
          Math.max(container.offsetWidth, averageWidth * itemsPerWave) * waveScale;

        let maxHeight = 0;

        for (const item of items) {
          item._x = item.offsetLeft;
          item._width = item.offsetWidth;
          item._height = item.offsetHeight;
          item._setY = gsap.quickSetter(item, 'y', 'px');
          maxHeight = Math.max(maxHeight, item._height);
        }

        pausePadding = maxHeight * (Math.abs(waveY) + 1);
        render();
      }

      function render() {
        if (!loopWidth || !waveLength) return;

        const x = gsap.utils.wrap(-loopWidth, 0, travel);
        const dynamicWaveY = waveY + (speed - 1) * waveBoost;
        const phaseTravel = travel / waveLength * fullCircle * waveTravel;
        const containerWidth = container.offsetWidth;

        setX(x);

        for (const item of items) {
          const itemX = item._x + x;
          if (itemX + item._width < 0 || itemX > containerWidth) continue;

          // Boog rekent vanaf het midden van het item: top in het midden van het scherm,
          // even laag aan beide randen (zelfde hoogteverschil als de golf)
          if (arch) {
            const phase = ((itemX + item._width / 2) / containerWidth - 0.5) * Math.PI + phaseTravel;
            item._setY((1 - 2 * Math.cos(phase)) * item._height * dynamicWaveY);
          } else {
            const phase = itemX / waveLength * fullCircle + phaseTravel;
            item._setY(Math.sin(phase) * item._height * dynamicWaveY);
          }
        }
      }

      function tick(_, deltaTime) {
        if (!isActive || !loopWidth) return;

        // Snelheid beweegt vloeiend naar de doel-snelheid, doel-snelheid zakt terug naar 1
        const ease = isDragging ? dragEase : scrollEase;
        speed += (targetSpeed - speed) * ease;
        targetSpeed += (1 - targetSpeed) * ease;

        travel += autoSpeed * speedScale * speed * direction * deltaTime / 1000;
        render();
      }

      container._wavyMarqueeObserver = Observer.create({
        target: container,
        type: 'touch,pointer',
        lockAxis: true,
        onChangeX: (self) => {
          if (!isActive || !self.deltaX) return;

          isDragging = true;
          container.style.cursor = 'grabbing';
          direction = self.deltaX > 0 ? 1 : -1;

          const dragAmount = Math.abs(self.deltaX) / averageWidth * 100 * dragSpeed;
          targetSpeed = Math.min(1 + dragAmount, maxDragSpeed);
        },
        onRelease: () => {
          isDragging = false;
          container.style.cursor = 'grab';
        }
      });

      container._wavyMarqueeTrigger = ScrollTrigger.create({
        trigger: container,
        start: () => `top-=${getPauseMargin()}px bottom`,
        end: () => `bottom+=${getPauseMargin()}px top`,
        invalidateOnRefresh: true,
        onToggle: (self) => isActive = self.isActive,
        onUpdate: (self) => {
          if (isDragging) return;

          direction = self.direction === 1 ? -baseDirection : baseDirection;
          // Boost via targetSpeed, zodat het vloeiend in- en uitfadet
          targetSpeed = Math.max(targetSpeed, 1 + Math.abs(self.getVelocity()) *
            scrollSpeed);
        }
      });

      buildLoop();
      ScrollTrigger.refresh();

      isActive = container._wavyMarqueeTrigger.isActive || ScrollTrigger.isInViewport(container);
      container._wavyMarqueeTick = tick;
      gsap.ticker.add(tick);

      container._wavyMarqueeResize = debounceOnWidthChange(() => {
        [speedScale, waveScale, arch] = getViewport();
        buildLoop();
        ScrollTrigger.refresh();
      }, 150);

      window.addEventListener('resize', container._wavyMarqueeResize);
    });
  }

  function debounceOnWidthChange(fn, ms) {
    let last = innerWidth,
      timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (innerWidth !== last) {
          last = innerWidth;
          fn.apply(this, args);
        }
      }, ms);
    };
  }

  // Voordelen-tabs (doelgroeppagina's): [data-dg-tabs] met knoppen [data-dg-tab] en panelen
  // [data-dg-tab-panel] in dezelfde volgorde. Wisselt vanzelf (data-dg-duration in ms, standaard
  // 6000); de lijn onder de actieve tab loopt mee als timer. Pauzeert bij hover, focus en buiten
  // beeld. Overgangen staan in Global CSS v2 (panelen krijgen data-state="active|past|future").
  let dgTabsCount = 0;

  function initDgTabs() {
    document.querySelectorAll('[data-dg-tabs]').forEach((root) => {
      const tabs = [...root.querySelectorAll('[data-dg-tab]')];
      const panels = [...root.querySelectorAll('[data-dg-tab-panel]')];
      if (!tabs.length || tabs.length !== panels.length) return;

      const duration = parseInt(root.getAttribute('data-dg-duration'), 10) || 6000;
      const autoplay = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const bars = tabs.map((tab) => tab.querySelector('.dg-benefits_progress-bar'));
      const prefix = `dg-tabs-${++dgTabsCount}`;
      let current = 0;
      let elapsed = 0;
      let last = 0;
      let running = false;
      let inView = false;
      let hovered = false;
      let focused = false;

      // Tabs en panelen aan elkaar koppelen voor schermlezers
      tabs.forEach((tab, i) => {
        tab.id = `${prefix}-tab-${i + 1}`;
        panels[i].id = `${prefix}-panel-${i + 1}`;
        tab.setAttribute('aria-controls', panels[i].id);
        panels[i].setAttribute('aria-labelledby', tab.id);
      });

      function show(index) {
        const prev = current;
        current = (index + tabs.length) % tabs.length;
        elapsed = 0;
        tabs.forEach((tab, i) => {
          const active = i === current;
          tab.setAttribute('aria-selected', String(active));
          tab.tabIndex = active ? 0 : -1;
          if (bars[i]) bars[i].style.transform = `scaleX(${active && !autoplay ? 1 : 0})`;
        });
        panels.forEach((panel, i) => {
          let state = 'future';
          if (i === current) state = 'active';
          else if (i === prev) state = 'past';
          panel.setAttribute('data-state', state);
          panel.setAttribute('aria-hidden', String(i !== current));
        });
      }

      function tick(now) {
        if (!inView) {
          running = false;
          return;
        }
        const dt = last ? Math.min(now - last, 100) : 0;
        last = now;
        if (!hovered && !focused && !document.hidden) {
          elapsed += dt;
          if (bars[current]) bars[current].style.transform = `scaleX(${Math.min(elapsed / duration, 1)})`;
          if (elapsed >= duration) show(current + 1);
        }
        requestAnimationFrame(tick);
      }

      function start() {
        if (running || !autoplay) return;
        running = true;
        last = 0;
        requestAnimationFrame(tick);
      }

      tabs.forEach((tab, i) => {
        tab.addEventListener('click', (e) => {
          e.preventDefault();
          if (i !== current) show(i);
        });
      });

      // Pijltjestoetsen tussen de tabs (WAI-ARIA tabs)
      root.addEventListener('keydown', (e) => {
        if (!e.target.closest('[data-dg-tab]')) return;
        const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
        let next = null;
        if (e.key in keys) next = current + keys[e.key];
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = tabs.length - 1;
        if (next === null) return;
        e.preventDefault();
        show(next);
        tabs[current].focus();
      });

      // Alleen pauzeren als de muis op de tekst van een paneel staat (niet op tabs of afbeelding)
      root.querySelectorAll('.dg-benefits_content').forEach((text) => {
        text.addEventListener('mouseenter', () => { hovered = true; });
        text.addEventListener('mouseleave', () => { hovered = false; });
      });
      // Toetsenbordfocus pauzeert ook (een muisklik op een tab niet)
      root.addEventListener('focusin', (e) => { focused = e.target.matches(':focus-visible'); });
      root.addEventListener('focusout', (e) => {
        if (!root.contains(e.relatedTarget)) focused = false;
      });

      new IntersectionObserver((entries) => {
        inView = entries[0].isIntersecting;
        if (inView) start();
      }, { threshold: 0.25 }).observe(root);

      root.setAttribute('data-dg-ready', '');
      show(0);
    });
  }

  // Naadloze rij (Osmo "Draggable Infinite Slider", de bekende GSAP horizontalLoop-helper).
  // Elke kaart schuift los via xPercent op één tijdlijn; wat links uit beeld gaat, komt achteraan
  // terug, dus geen klonen nodig. Twee aanvullingen op Osmo: dragClickables (slepen mag ook op de
  // video-knop) en timeline.destroy() (alles terugzetten bij een filterwissel).
  function horizontalLoop(items, config) {
    let timeline;
    items = gsap.utils.toArray(items);
    config = config || {};
    const ctx = gsap.context(() => {
      let onChange = config.onChange, lastIndex = 0,
        tl = gsap.timeline({repeat: config.repeat, onUpdate: onChange && function() { let i = tl.closestIndex(); if (lastIndex !== i) { lastIndex = i; onChange(items[i], i); } }, paused: config.paused, defaults: {ease: "none"}, onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100)}),
        length = items.length, startX = items[0].offsetLeft, times = [], widths = [], spaceBefore = [], xPercents = [], curIndex = 0, indexIsDirty = false, center = config.center, pixelsPerSecond = (config.speed || 1) * 100,
        snap = config.snap === false ? v => v : gsap.utils.snap(config.snap || 1), timeOffset = 0,
        container = center === true ? items[0].parentNode : gsap.utils.toArray(center)[0] || items[0].parentNode, totalWidth,
        getTotalWidth = () => items[length-1].offsetLeft + xPercents[length-1] / 100 * widths[length-1] - startX + spaceBefore[0] + items[length-1].offsetWidth * gsap.getProperty(items[length-1], "scaleX") + (parseFloat(config.paddingRight) || 0),
        populateWidths = () => { let b1 = container.getBoundingClientRect(), b2; items.forEach((el, i) => { widths[i] = parseFloat(gsap.getProperty(el, "width", "px")); xPercents[i] = snap(parseFloat(gsap.getProperty(el, "x", "px")) / widths[i] * 100 + gsap.getProperty(el, "xPercent")); b2 = el.getBoundingClientRect(); spaceBefore[i] = b2.left - (i ? b1.right : b1.left); b1 = b2; }); gsap.set(items, { xPercent: i => xPercents[i] }); totalWidth = getTotalWidth(); },
        timeWrap,
        populateOffsets = () => { timeOffset = center ? tl.duration() * (container.offsetWidth / 2) / totalWidth : 0; center && times.forEach((t, i) => { times[i] = timeWrap(tl.labels["label" + i] + tl.duration() * widths[i] / 2 / totalWidth - timeOffset); }); },
        getClosest = (values, value, wrap) => { let i = values.length, closest = 1e10, index = 0, d; while (i--) { d = Math.abs(values[i] - value); if (d > wrap / 2) { d = wrap - d; } if (d < closest) { closest = d; index = i; } } return index; },
        populateTimeline = () => { let i, item, curX, distanceToStart, distanceToLoop; tl.clear(); for (i = 0; i < length; i++) { item = items[i]; curX = xPercents[i] / 100 * widths[i]; distanceToStart = item.offsetLeft + curX - startX + spaceBefore[0]; distanceToLoop = distanceToStart + widths[i] * gsap.getProperty(item, "scaleX"); tl.to(item, {xPercent: snap((curX - distanceToLoop) / widths[i] * 100), duration: distanceToLoop / pixelsPerSecond}, 0).fromTo(item, {xPercent: snap((curX - distanceToLoop + totalWidth) / widths[i] * 100)}, {xPercent: xPercents[i], duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond, immediateRender: false}, distanceToLoop / pixelsPerSecond).add("label" + i, distanceToStart / pixelsPerSecond); times[i] = distanceToStart / pixelsPerSecond; } timeWrap = gsap.utils.wrap(0, tl.duration()); },
        refresh = (deep) => { let progress = tl.progress(); tl.progress(0, true); populateWidths(); deep && populateTimeline(); populateOffsets(); deep && tl.draggable ? tl.time(times[curIndex], true) : tl.progress(progress, true); },
        onResize = () => refresh(true), proxy;
      gsap.set(items, {x: 0}); populateWidths(); populateTimeline(); populateOffsets(); window.addEventListener("resize", onResize);
      function toIndex(index, vars) { vars = vars || {}; (Math.abs(index - curIndex) > length / 2) && (index += index > curIndex ? -length : length); let newIndex = gsap.utils.wrap(0, length, index), time = times[newIndex]; if (time > tl.time() !== index > curIndex && index !== curIndex) { time += tl.duration() * (index > curIndex ? 1 : -1); } if (time < 0 || time > tl.duration()) { vars.modifiers = {time: timeWrap}; } curIndex = newIndex; vars.overwrite = true; gsap.killTweensOf(proxy); return vars.duration === 0 ? tl.time(timeWrap(time)) : tl.tweenTo(time, vars); }
      tl.toIndex = (index, vars) => toIndex(index, vars);
      tl.closestIndex = setCurrent => { let index = getClosest(times, tl.time(), tl.duration()); if (setCurrent) { curIndex = index; indexIsDirty = false; } return index; };
      tl.current = () => indexIsDirty ? tl.closestIndex(true) : curIndex;
      tl.next = vars => toIndex(tl.current()+1, vars);
      tl.previous = vars => toIndex(tl.current()-1, vars);
      tl.times = times;
      tl.progress(1, true).progress(0, true);
      if (config.reversed) { tl.vars.onReverseComplete(); tl.reverse(); }
      if (config.draggable && typeof(Draggable) === "function") {
        proxy = document.createElement("div");
        let wrap = gsap.utils.wrap(0, 1), ratio, startProgress, draggable, dragSnap, lastSnap, initChangeX, wasPlaying,
          align = () => tl.progress(wrap(startProgress + (draggable.startX - draggable.x) * ratio)),
          syncIndex = () => tl.closestIndex(true);
        draggable = Draggable.create(proxy, {
          trigger: items[0].parentNode, type: "x", dragClickables: true,
          onPressInit() { let x = this.x; gsap.killTweensOf(tl); wasPlaying = !tl.paused(); tl.pause(); startProgress = tl.progress(); refresh(); ratio = 1 / totalWidth; initChangeX = (startProgress / -ratio) - x; gsap.set(proxy, {x: startProgress / -ratio}); },
          onDrag: align, onThrowUpdate: align, overshootTolerance: 0, inertia: true,
          snap(value) { if (Math.abs(startProgress / -ratio - this.x) < 10) { return lastSnap + initChangeX } let time = -(value * ratio) * tl.duration(), wrappedTime = timeWrap(time), snapTime = times[getClosest(times, wrappedTime, tl.duration())], dif = snapTime - wrappedTime; Math.abs(dif) > tl.duration() / 2 && (dif += dif < 0 ? tl.duration() : -tl.duration()); lastSnap = (time + dif) / tl.duration() / -ratio; return lastSnap; },
          onRelease() { syncIndex(); draggable.isThrowing && (indexIsDirty = true); },
          onThrowComplete: () => { syncIndex(); wasPlaying && tl.play(); }
        })[0];
        tl.draggable = draggable;
      }
      tl.closestIndex(true); lastIndex = curIndex; onChange && onChange(items[curIndex], curIndex); timeline = tl;
      return () => window.removeEventListener("resize", onResize);
    });
    timeline.destroy = () => {
      if (timeline.draggable) timeline.draggable.kill();
      ctx.revert();
    };
    return timeline;
  }

  // Ervaringen-slider (doelgroeppagina's), dots naar Osmo "Logo Card Testimonials".
  // [data-dg-testimonials] bevat een rij kaarten ([data-dg-track] > [data-dg-slide] met
  // data-dg-category) en een bolletjes-rij ([data-dg-dots] met één voorbeeld-[data-dg-dot]).
  // De filterknoppen [data-dg-filter] in dezelfde sectie tonen alleen die doelgroep; de rij wordt
  // dan opnieuw opgebouwd met horizontalLoop (hierboven): oneindig, sleepbaar met inertie, de
  // actieve kaart in het midden van de sectie. Het actieve bolletje loopt vol als timer
  // (data-dg-autoplay in seconden, 0 = alleen klikken). Pauzeert bij hover, focus en buiten beeld.
  // Geen tekst-animatie meer (te druk voor de doelgroep); alleen de zijkaarten vervagen (CSS).
  function initDgTestimonials() {
    const roots = document.querySelectorAll('[data-dg-testimonials]');
    if (!roots.length || !window.gsap) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Draggable + InertiaPlugin komen niet met Webflow mee; zonder slepen werkt de rij ook
    const plugins = [
      window.Draggable ? null : loadScript(LIBS.draggable),
      window.InertiaPlugin ? null : loadScript(LIBS.inertia)
    ];
    Promise.allSettled(plugins).then(() => {
      ['Draggable', 'InertiaPlugin'].forEach((name) => {
        if (window[name]) gsap.registerPlugin(window[name]);
      });
      roots.forEach((root) => setupDgTestimonials(root, reduceMotion));
    });
  }

  function setupDgTestimonials(root, reduceMotion) {
    const section = root.closest('section') || document.body;
    const track = root.querySelector('[data-dg-track]');
    const allSlides = [...root.querySelectorAll('[data-dg-slide]')];
    const dotsWrap = root.querySelector('[data-dg-dots]');
    const dotTemplate = dotsWrap && dotsWrap.querySelector('[data-dg-dot]');
    const filters = [...section.querySelectorAll('[data-dg-filter]')];
    const filterWrap = filters.length ? filters[0].parentElement : null;
    if (!track || !allSlides.length || !dotTemplate) return;
    if (filterWrap) filterWrap.style.setProperty('--toggle-count', filters.length);

    // Knoppen zijn zo breed als hun tekst: het blokje krijgt de plek en breedte van de actieve knop
    // en rekt mee bij het wisselen (CSS: .dg-filter.is-measured)
    let activeFilter = 0;
    function placeToggle() {
      const button = filters[activeFilter];
      if (!filterWrap || !button) return;
      const first = !filterWrap.classList.contains('is-measured');
      const bg = first && filterWrap.querySelector('.dg-filter_bg');
      if (bg) bg.style.transition = 'none';
      filterWrap.style.setProperty('--toggle-x', `${button.offsetLeft}px`);
      filterWrap.style.setProperty('--toggle-w', `${button.offsetWidth}px`);
      filterWrap.classList.add('is-measured');
      if (bg) {
        void bg.offsetWidth;
        bg.style.transition = '';
      }
    }
    if (filterWrap && window.ResizeObserver) {
      const resize = new ResizeObserver(() => placeToggle());
      [filterWrap, ...filters].forEach((el) => resize.observe(el));
    }

    const seconds = parseFloat(root.getAttribute('data-dg-autoplay'));
    const duration = (isNaN(seconds) ? 6 : seconds) * 1000;
    const autoplay = duration > 0 && !reduceMotion;
    const move = { ease: 'power3', duration: reduceMotion ? 0 : 0.725 };
    dotTemplate.remove();
    track.style.justifyContent = 'flex-start';

    let slides = []; // echte kaarten van de gekozen doelgroep
    let items = []; // wat in de loop zit: de kaarten, op brede schermen plus klonen
    let category = null;
    let dots = [];
    let loop = null;
    let active = -1; // index in slides (voor bolletjes en timer)
    let current = -1; // index in items (de kaart in het midden)
    let elapsed = 0;
    let last = 0;
    let running = false;
    let inView = false;
    let held = false;
    let dragged = false;
    let steering = false; // tijdens een klik/autoplay-beweging staat de actieve kaart al vast

    // De rij loopt tot de randen van de sectie, zodat kaarten pas buiten beeld achteraan terugkomen
    function bleed() {
      track.style.marginLeft = '';
      track.style.marginRight = '';
      const s = section.getBoundingClientRect();
      const t = track.getBoundingClientRect();
      track.style.marginLeft = `${s.left - t.left}px`;
      track.style.marginRight = `${t.right - s.right}px`;
    }

    function fill(i, value) {
      const el = dots[i] && dots[i].querySelector('[data-dg-dot-fill]');
      if (el) el.style.transform = `scaleX(${value})`;
    }

    // Vanuit de loop (ook tijdens slepen): actieve kaart, bolletjes en timer bijwerken
    function setActive(itemIndex) {
      itemIndex = ((itemIndex % items.length) + items.length) % items.length;
      if (itemIndex === current) return;
      current = itemIndex;
      active = itemIndex % slides.length;
      elapsed = 0;
      items.forEach((el, i) => el.setAttribute('data-dg-active', String(i === current)));
      slides.forEach((slide, i) => {
        const on = i === active;
        slide.setAttribute('aria-hidden', String(!on));
        slide.querySelectorAll('a, button').forEach((el) => { el.tabIndex = on ? 0 : -1; });
      });
      dots.forEach((dot, i) => {
        dot.setAttribute('aria-current', String(i === active));
        fill(i, i === active && !autoplay ? 1 : 0);
      });
    }

    // Klik, bolletje of autoplay: de doelkaart wordt meteen actief, zodat de blur gelijk met de
    // beweging verschuift (niet halverwege omklapt)
    function steer(itemIndex) {
      if (!loop) return;
      setActive(itemIndex);
      steering = !reduceMotion;
      loop.toIndex(itemIndex, { ...move, onComplete: () => { steering = false; } });
    }

    // Naar kaart i van de doelgroep: met klonen de dichtstbijzijnde kopie daarvan
    function goTo(i) {
      if (!loop) return;
      let best = i;
      const len = items.length;
      for (let j = i; j < len; j += slides.length) {
        const d = Math.min(Math.abs(j - current), len - Math.abs(j - current));
        const bd = Math.min(Math.abs(best - current), len - Math.abs(best - current));
        if (d < bd) best = j;
      }
      steer(best);
    }

    // Eén ronde kaarten moet breder zijn dan de sectie plus één kaart, anders komt er zichtbaar
    // een kaart terug. Op heel brede schermen daarom extra rondes klonen (aria-hidden, niet bedienbaar).
    function roundsNeeded() {
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const round = slides.reduce((sum, s) => sum + s.offsetWidth + gap, 0) || 1;
      const widest = Math.max(...slides.map((s) => s.offsetWidth));
      return Math.max(1, Math.ceil((section.clientWidth + widest) / round));
    }

    function removeClones() {
      track.querySelectorAll('[data-dg-clone]').forEach((c) => c.remove());
    }

    let rounds = 1;

    let swapToken = 0;

    // Wisselen van doelgroep: rij en bolletjes vervagen, kaarten wisselen onzichtbaar, dan weer in beeld
    function setFilter(category, animate) {
      // Schuivend blokje achter de actieve filter (naar Osmo "Toggle Switch")
      const filterIndex = filters.findIndex((f) => f.getAttribute('data-dg-filter') === category);
      if (filterWrap && filterIndex > -1) {
        filterWrap.style.setProperty('--toggle-active', filterIndex);
        activeFilter = filterIndex;
        placeToggle();
      }
      filters.forEach((f, i) => {
        f.setAttribute('aria-selected', String(i === filterIndex));
        f.tabIndex = i === filterIndex ? 0 : -1;
      });

      const token = ++swapToken;
      if (!animate || reduceMotion || !track.animate) {
        showCategory(category);
        return;
      }
      held = true;
      const fadeOut = { duration: 250, easing: 'ease-in', fill: 'forwards' };
      // Vanaf de huidige zichtbaarheid, zodat snel doorklikken niet verspringt
      const outs = [track, dotsWrap].map((el) =>
        el.animate([{ opacity: getComputedStyle(el).opacity }, { opacity: 0 }], fadeOut));
      let swapped = false;
      const swap = () => {
        if (swapped || token !== swapToken) return; // al gedaan, of alweer een andere filter gekozen
        swapped = true;
        // Ook vervaging van eerdere klikken opruimen (die blijven anders op 0 staan)
        [track, dotsWrap].forEach((el) => el.getAnimations().forEach((anim) => anim.cancel()));
        showCategory(category);
        const fadeIn = { duration: 450, easing: 'cubic-bezier(.22, .61, .36, 1)' };
        [track, dotsWrap].forEach((el) => el.animate([{ opacity: 0 }, { opacity: 1 }], fadeIn));
        held = root.matches(':hover') || root.contains(document.activeElement);
      };
      outs[0].finished.then(swap).catch(() => {});
      setTimeout(swap, 320); // vangnet als de animatie niet afrondt (bv. tab op de achtergrond)
    }

    function showCategory(cat, startAt) {
      if (loop) loop.destroy();
      loop = null;
      removeClones();
      category = cat;
      slides = allSlides.filter((s) => s.getAttribute('data-dg-category') === cat);
      if (!slides.length) slides = allSlides;
      // Zonder overgang wisselen, anders knippert de opacity/blur van de zijkaarten
      allSlides.forEach((s) => {
        s.style.transition = 'none';
        s.hidden = !slides.includes(s);
        s.removeAttribute('data-dg-active');
      });
      dotsWrap.replaceChildren();
      dots = slides.map((slide, i) => {
        const dot = dotTemplate.cloneNode(true);
        dot.setAttribute('aria-label', `Ervaring ${i + 1} van ${slides.length}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
        return dot;
      });
      dotsWrap.hidden = slides.length < 2;
      active = -1;
      current = -1;
      items = slides;
      track.style.marginLeft = '';
      track.style.marginRight = '';
      track.style.justifyContent = slides.length > 1 ? 'flex-start' : 'center';
      if (slides.length > 1) {
        rounds = roundsNeeded();
        for (let r = 1; r < rounds; r++) {
          const copies = slides.map((s) => {
            const c = s.cloneNode(true);
            c.setAttribute('data-dg-clone', '');
            c.setAttribute('aria-hidden', 'true');
            c.querySelectorAll('a, button').forEach((el) => { el.tabIndex = -1; });
            return c;
          });
          track.append(...copies);
          items = items.concat(copies);
        }
        bleed();
        steering = false;
        loop = horizontalLoop(items, {
          paused: true,
          draggable: true,
          center: section,
          paddingRight: parseFloat(getComputedStyle(track).columnGap) || 0,
          onChange: (el, i) => { if (!steering) setActive(i); }
        });
        loop.toIndex(startAt || 0, { duration: 0 });
        if (loop.draggable) {
          // Slepen neemt het over van een lopende klik-beweging
          loop.draggable.addEventListener('press', () => { steering = false; });
          loop.draggable.addEventListener('dragstart', () => {
            dragged = true;
            held = true;
            root.setAttribute('data-dg-dragging', '');
          });
          loop.draggable.addEventListener('release', () => {
            root.removeAttribute('data-dg-dragging');
            held = root.matches(':hover');
          });
        }
      }
      setActive(startAt || 0);
      void track.offsetWidth;
      allSlides.forEach((s) => { s.style.transition = ''; });
    }

    function tick(now) {
      if (!inView) {
        running = false;
        return;
      }
      const dt = last ? Math.min(now - last, 100) : 0;
      last = now;
      if (!held && !document.hidden && slides.length > 1) {
        elapsed += dt;
        fill(active, Math.min(elapsed / duration, 1));
        if (elapsed >= duration) {
          elapsed = 0;
          steer(current + 1);
        }
      }
      requestAnimationFrame(tick);
    }

    function start() {
      if (running || !autoplay) return;
      running = true;
      last = 0;
      requestAnimationFrame(tick);
    }

    // Klik op een kaart naast de actieve: eerst daarheen schuiven (niet meteen de video starten).
    // Na slepen telt de klik niet.
    track.addEventListener('click', (e) => {
      if (dragged) {
        dragged = false;
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      const i = items.indexOf(e.target.closest('[data-dg-slide]'));
      if (i === -1 || i === current) return;
      e.preventDefault();
      e.stopPropagation();
      steer(i);
    }, true);
    track.addEventListener('pointerdown', () => { dragged = false; });

    filters.forEach((f, i) => {
      f.addEventListener('click', (e) => {
        e.preventDefault();
        if (f.getAttribute('aria-selected') === 'true') return;
        setFilter(f.getAttribute('data-dg-filter'), true);
      });
      // Pijltjes links/rechts tussen de filters
      f.addEventListener('keydown', (e) => {
        const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        const next = filters[(i + dir + filters.length) % filters.length];
        setFilter(next.getAttribute('data-dg-filter'), true);
        next.focus();
      });
    });

    root.addEventListener('pointerenter', () => { held = true; });
    root.addEventListener('pointerleave', () => { held = false; });
    root.addEventListener('focusin', () => { held = true; });
    root.addEventListener('focusout', (e) => {
      if (!root.contains(e.relatedTarget)) held = false;
    });

    // Vóór de resize van de loop zelf (die meet daarna alles opnieuw)
    // Breder geworden en te weinig kaarten: opnieuw opbouwen met klonen (op dezelfde kaart)
    window.addEventListener('resize', () => {
      if (!loop) return;
      if (roundsNeeded() !== rounds) showCategory(category, active);
      else bleed();
    });
    new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      if (inView) start();
    }).observe(root);

    root.setAttribute('data-dg-ready', '');
    // Startfilter: data-dg-start op de root (component-prop "Start-filter"), anders aria-selected, anders de eerste
    const startFilter = (root.getAttribute('data-dg-start') || '').trim().toLowerCase();
    const first =
      filters.find((f) => startFilter && f.getAttribute('data-dg-filter') === startFilter) ||
      filters.find((f) => f.getAttribute('aria-selected') === 'true') ||
      filters[0];
    setFilter(first ? first.getAttribute('data-dg-filter') : null);
  }

  // FAQ-accordeon (zoals op de Echo-site, naar Osmo "Accordion CSS"): [data-accordion-css-init]
  // om de lijst, [data-accordion-status] per item, [data-accordion-toggle] op de knop.
  // Openen/sluiten (hoogte-animatie) gebeurt in CSS; data-accordion-close-siblings="true" = één tegelijk open.
  function initAccordionCSS() {
    document.querySelectorAll('[data-accordion-css-init]').forEach((accordion) => {
      const closeSiblings = accordion.getAttribute('data-accordion-close-siblings') === 'true';

      function setStatus(item, open) {
        item.setAttribute('data-accordion-status', open ? 'active' : 'not-active');
        const toggle = item.querySelector('[data-accordion-toggle]');
        if (toggle) toggle.setAttribute('aria-expanded', String(open));
      }

      // Pas nu dicht: zonder JS (en in de Designer) staan alle antwoorden open.
      // Eerst zonder overgang dichtklappen, een frame later de animaties aanzetten.
      accordion.setAttribute('data-accordion-ready', 'on');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        accordion.setAttribute('data-accordion-ready', 'live');
      }));

      accordion.addEventListener('click', (event) => {
        const toggle = event.target.closest('[data-accordion-toggle]');
        if (!toggle) return;
        const item = toggle.closest('[data-accordion-status]');
        if (!item) return;
        const isActive = item.getAttribute('data-accordion-status') === 'active';
        setStatus(item, !isActive);
        if (closeSiblings && !isActive) {
          accordion.querySelectorAll('[data-accordion-status="active"]').forEach((sibling) => {
            if (sibling !== item) setStatus(sibling, false);
          });
        }
      });
    });
  }

  // Video-popup (doelgroeppagina's): een knop met [data-dg-video-play] en data-vimeo-id="123456"
  // opent die Vimeo-video in een <dialog>. Een YouTube-ID of een Vimeo-/YouTube-link mag ook. Sluiten (Esc, kruisje of klik naast de video) haalt
  // de iframe weg, zodat het geluid direct stopt. Opmaak staat in Global CSS v2 (.dg-video-dialog).
  // Staande video's: data-vimeo-ratio="9/16" op de knop (standaard 16/9).
  // Vimeo-nummer, YouTube-ID (11 tekens) of een volledige link → embed-adres, anders null.
  // dnt=1 en youtube-nocookie: geen tracking-cookies
  function videoEmbedSrc(value) {
    const v = (value || '').trim();
    const vimeo = /^(?:https?:\/\/)?(?:www\.|player\.)?(?:vimeo\.com\/(?:video\/)?)?(\d+)(?:[/?#].*)?$/.exec(v);
    if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&dnt=1&title=0&byline=0&portrait=0`;
    const yt = /(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{11})/.exec(v) || /^([\w-]{11})$/.exec(v);
    if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0`;
    return null;
  }

  function initVideoPopup() {
    const buttons = document.querySelectorAll('[data-dg-video-play][data-vimeo-id]');
    if (!buttons.length) return;

    let dialog = null;
    let frame = null;
    let lastButton = null;

    function build() {
      dialog = document.createElement('dialog');
      dialog.className = 'dg-video-dialog';
      dialog.setAttribute('aria-label', 'Video');
      dialog.innerHTML =
        '<button type="button" class="dg-video-dialog_close" aria-label="Video sluiten">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
        '</button><div class="dg-video-dialog_frame"></div>';
      frame = dialog.querySelector('.dg-video-dialog_frame');

      dialog.querySelector('.dg-video-dialog_close').addEventListener('click', close);
      // Klik naast de video (op de achtergrond) sluit ook
      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) close();
      });
      // Esc geeft eerst 'cancel'; 'close' als vangnet. Opruimen mag vaker gebeuren.
      dialog.addEventListener('cancel', cleanup);
      dialog.addEventListener('close', cleanup);
      document.body.appendChild(dialog);
    }

    // Direct (niet pas op het close-event) de iframe weghalen, zodat het geluid meteen stopt
    function cleanup() {
      frame.innerHTML = '';
      if (window.lenis) window.lenis.start();
      if (lastButton) {
        lastButton.focus();
        lastButton = null;
      }
    }

    function close() {
      cleanup();
      if (dialog.open) dialog.close();
    }

    function open(button) {
      const src = videoEmbedSrc(button.getAttribute('data-vimeo-id'));
      if (!src) return;
      if (!dialog) build();
      lastButton = button;

      const iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.title = button.getAttribute('aria-label') || 'Video';
      iframe.allow = 'autoplay; fullscreen; picture-in-picture';
      iframe.setAttribute('allowfullscreen', '');
      frame.replaceChildren(iframe);

      // Andere verhouding dan 16/9: frame zo groot mogelijk binnen het scherm (zelfde marges als de CSS)
      const ratio = /^\s*(\d+(?:\.\d+)?)\s*[/:]\s*(\d+(?:\.\d+)?)\s*$/.exec(button.getAttribute('data-vimeo-ratio') || '');
      if (ratio && +ratio[1] > 0 && +ratio[2] > 0) {
        frame.style.aspectRatio = `${ratio[1]} / ${ratio[2]}`;
        frame.style.width = `min(100%, 70rem, calc((100dvh - 9rem) * ${ratio[1]} / ${ratio[2]}))`;
      } else {
        frame.style.aspectRatio = '';
        frame.style.width = '';
      }

      if (window.lenis) window.lenis.stop();
      dialog.showModal();
    }

    // Via de document-klik, zodat ook gekloonde kaarten (ervaringen-slider) werken
    document.addEventListener('click', (e) => {
      const button = e.target.closest('[data-dg-video-play][data-vimeo-id]');
      if (!button) return;
      e.preventDefault();
      open(button);
    });
  }


  // Laposta: custom formulier ([data-laposta-wrap]) versturen zoals Laposta's eigen validate.js:
  // eenmalig token + rekenpuzzel (spambeveiliging), dan een gewone formulierpost in een verborgen iframe.
  // Laposta stuurt bij een gelukte aanmelding door naar "next" (een adres op onze eigen site);
  // komt het iframe daar uit, dan tonen we [data-laposta-success], anders [data-laposta-error].
  // Vervangt het oude iframe-script in Site settings → Footer.

  const LAPOSTA_DEBUG = false; // op true zetten om de stappen in de console te zien

  const LAPOSTA_TEXT = {
    loading: 'Bezig…',
    invalid: 'Vul je e-mailadres in en kies wie je bent.',
    invalidEmail: 'Vul nog je e-mailadres in.',
    invalidRole: 'Kies nog wie je bent.',
    error: 'Er ging iets mis. Controleer je e-mailadres en probeer het opnieuw.'
  };

  const LAPOSTA_TOKEN_PATH = '/subscribe/check/token.php';
  const LAPOSTA_POW_PATH = '/subscribe/check/pow.js?v=260827';
  // Doorstuuradres na een gelukte aanmelding: klein bestand op de eigen site, alleen in het iframe
  const LAPOSTA_NEXT_URL = window.location.origin + '/robots.txt';

  // Muis- of touchactiviteit op de pagina (signaal voor Laposta's botcheck)
  let lapostaPointerSeen = false;
  ['pointerdown', 'mousedown', 'mousemove', 'touchstart'].forEach((type) => {
    document.addEventListener(type, (e) => {
      if (e.isTrusted) lapostaPointerSeen = true;
    }, { passive: true });
  });

  function initLapostaForms() {
    const wraps = document.querySelectorAll('[data-laposta-wrap]');
    lapostaLog(`Klaar: ${wraps.length} formulier(en) gevonden`);
    wraps.forEach((wrap, index) => {
      const form = wrap.querySelector('[data-laposta-form]');
      if (!form || form.__laposta) return;
      form.__laposta = true;

      const action = new URL(form.getAttribute('action'), window.location.href);
      const success = wrap.querySelector('[data-laposta-success]');
      const error = wrap.querySelector('[data-laposta-error]');
      const errorText = error ? error.querySelector('[data-laposta-error-text]') || error : null;
      const label = form.querySelector('[data-laposta-label]');
      const labelText = label ? label.textContent : '';
      const honeypot = form.querySelector('[data-hp]');
      const radios = form.querySelectorAll('input[type="radio"]');
      const openedAt = Date.now();
      let busy = false;

      // Puzzelscript pas laden als iemand het formulier gebruikt (geen extra script + cookie bij elke paginaweergave)
      form.addEventListener('focusin', () => loadLapostaPow(action.origin).catch(() => {}), { once: true });

      // Verborgen iframe: het formulier post hierin, zodat de pagina blijft staan
      const frame = document.createElement('iframe');
      frame.name = 'laposta-post-' + index;
      frame.title = 'Laposta';
      frame.tabIndex = -1;
      frame.setAttribute('aria-hidden', 'true');
      frame.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden;';
      wrap.appendChild(frame);

      // Interactie met het formulier (signaal voor Laposta's botcheck)
      let interacted = false;
      let firstInteractionAt = 0;
      ['focusin', 'input', 'keydown'].forEach((type) => {
        form.addEventListener(type, (e) => {
          if (!e.isTrusted || (e.target && e.target.type === 'hidden')) return;
          interacted = true;
          if (!firstInteractionAt) firstInteractionAt = Date.now();
        });
      });

      // Radio tiles: checked-state als attribuut, zodat styling altijd direct meekomt
      function syncRadios() {
        radios.forEach((radio) => {
          const tile = radio.closest('.radiocheck-field');
          if (tile) tile.setAttribute('data-checked', radio.checked ? 'true' : 'false');
        });
      }
      radios.forEach((radio) => radio.addEventListener('change', syncRadios));
      syncRadios();

      function reveal(el) {
        if (!el) return;
        el.style.display = 'block';
        if (window.gsap) gsap.fromTo(el, { opacity: 0, y: 8 }, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out'
        });
      }

      function hide(el) {
        if (el) el.style.display = 'none';
      }

      function setLoading(isLoading) {
        busy = isLoading;
        if (label) label.textContent = isLoading ? LAPOSTA_TEXT.loading : labelText;
        form.setAttribute('aria-busy', isLoading ? 'true' : 'false');
        wrap.setAttribute('data-laposta-state', isLoading ? 'loading' : 'idle');
      }

      function showSuccess() {
        form.reset();
        syncRadios();
        hide(form);
        hide(error);
        reveal(success);
        wrap.setAttribute('data-laposta-state', 'success');
      }

      function showError(message) {
        if (errorText) errorText.textContent = message || LAPOSTA_TEXT.error;
        reveal(error);
        wrap.setAttribute('data-laposta-state', 'error');
      }

      // Melding noemt alleen wat nog ontbreekt: e-mail, rol of allebei
      const emailInput = form.querySelector('input[type="email"]:not([data-hp])');
      let invalidShown = false;
      function missingText() {
        const emailOk = !emailInput || (emailInput.value.trim() !== '' && emailInput.checkValidity());
        const roleOk = !form.querySelector('input[type="radio"]') || !!form.querySelector('input[type="radio"]:checked');
        if (emailOk && roleOk) return '';
        if (emailOk) return LAPOSTA_TEXT.invalidRole;
        if (roleOk) return LAPOSTA_TEXT.invalidEmail;
        return LAPOSTA_TEXT.invalid;
      }
      // Staat de melding er al, dan loopt hij mee met wat je invult (en verdwijnt als alles klopt)
      ['input', 'change'].forEach((type) => form.addEventListener(type, () => {
        if (!invalidShown) return;
        const text = missingText();
        if (text) {
          showError(text);
        } else {
          invalidShown = false;
          hide(error);
          wrap.setAttribute('data-laposta-state', 'idle');
        }
      }));

      // Capture + stopImmediatePropagation: oude submit-handlers (iframe-script) draaien niet mee
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (busy) return;
        hide(error);
        invalidShown = false;

        // Valideren via initAdvancedFormValidation (TESTCODE)
        if (typeof form.__validate === 'function' && !form.__validate()) {
          lapostaLog('Niet verstuurd: e-mail of rol niet goed ingevuld');
          showError(missingText() || LAPOSTA_TEXT.invalid);
          invalidShown = true;
          return;
        }

        // Honeypot ingevuld = bot: doe alsof het gelukt is, niets versturen
        if (honeypot && honeypot.value) {
          showSuccess();
          return;
        }

        setLoading(true);
        try {
          const ok = await sendToLaposta(form, frame, action, {
            openedAt,
            interacted,
            firstInteractionAt
          });
          setLoading(false);
          if (ok) showSuccess();
          else showError();
        } catch (err) {
          lapostaLog('Versturen mislukt', err);
          setLoading(false);
          showError();
        }
      }, true);
    });
  }

  async function sendToLaposta(form, frame, action, signals) {
    const account = form.querySelector('input[name="a"]');
    const list = form.querySelector('input[name="l"]');

    setLapostaField(form, 'next', LAPOSTA_NEXT_URL);
    setLapostaField(form, 'submit-duration', String(Date.now() - signals.openedAt));
    setLapostaField(form, 'subscribe-token', '');
    setLapostaField(form, 'subscribe-pow', '');

    // Eenmalig token + rekenpuzzel, net als Laposta's validate.js
    const token = await requestLapostaToken(action, account && account.value, list && list.value,
      lapostaBehaviour(signals));
    if (token) {
      setLapostaField(form, 'subscribe-token', token.token);
      if (token.challenge) {
        const solution = await solveLapostaPow(token.challenge, action.origin);
        if (solution) setLapostaField(form, 'subscribe-pow', solution);
      }
    }
    lapostaLog('Verstuurt', Object.fromEntries(new FormData(form)));

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        frame.removeEventListener('load', onLoad);
        resolve(false);
      }, 15000);

      function onLoad() {
        clearTimeout(timer);
        // Doorgestuurd naar "next" (eigen domein) = gelukt; Laposta-pagina (ander domein) = fout
        let landedHome = false;
        try {
          landedHome = frame.contentWindow.location.origin === window.location.origin;
        } catch (err) {}
        lapostaLog(landedHome ? 'Gelukt: doorgestuurd naar next' :
          'Laposta toonde een eigen pagina (fout)');
        resolve(landedHome);
      }

      frame.addEventListener('load', onLoad, { once: true });
      form.setAttribute('target', frame.name);
      form.submit(); // gewone post, triggert geen submit-event
    });
  }

  function setLapostaField(form, name, value) {
    let field = form.querySelector(`input[name="${name}"]`);
    if (!field) {
      field = document.createElement('input');
      field.type = 'hidden';
      field.name = name;
      form.appendChild(field);
    }
    field.value = value;
  }

  // Botcheck-signalen als "i.p.w.c.t", zoals validate.js ze meestuurt
  function lapostaBehaviour(signals) {
    const nav = window.navigator || {};
    const headless = !!(nav.userAgent && nav.userAgent.indexOf('Chrome/') !== -1 && !window.chrome);
    return [
      signals.interacted ? 1 : 0,
      lapostaPointerSeen ? 1 : 0,
      nav.webdriver ? 1 : 0,
      headless ? 1 : 0,
      Math.min(signals.firstInteractionAt ? Date.now() - signals.firstInteractionAt : 0, 9999999)
    ].join('.');
  }

  async function requestLapostaToken(action, account, list, behaviour) {
    if (!account || !list) return null;
    const url = new URL(LAPOSTA_TOKEN_PATH, action.origin);
    url.searchParams.set('a', account);
    url.searchParams.set('l', list);
    url.searchParams.set('p', '1');
    url.searchParams.set('b', behaviour);
    try {
      const res = await fetch(url, {
        credentials: 'omit',
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) return null;
      const json = await res.json();
      lapostaLog('Token', json && json.token ? 'ontvangen' : 'geen', json && json.challenge);
      return json && json.token ? json : null;
    } catch (err) {
      lapostaLog('Token mislukt', err);
      return null;
    }
  }

  function loadLapostaPow(origin) {
    if (window.LapostaPow) return Promise.resolve();
    return loadScript(origin + LAPOSTA_POW_PATH);
  }

  async function solveLapostaPow(challenge, origin) {
    try {
      await loadLapostaPow(origin);
    } catch (err) {
      return null;
    }
    if (!window.LapostaPow) return null;
    return new Promise((resolve) => {
      window.LapostaPow.solve(challenge.salt, challenge.difficulty, resolve, { maxMs: 8000 });
    });
  }

  function lapostaLog(...args) {
    if (LAPOSTA_DEBUG) console.log('[Laposta]', ...args);
  }


  // ---------- Homepage, Over ons en Onze missie ----------
  // Voorheen script-embeds op de pagina's; nu staan HTML en stijl in Webflow (Global CSS v2 voor wat
  // Webflow niet kan) en de code hier. Een sectie met nog een oude script-embed (.w-script) slaan we over.

  // ---------- Homepage: het verhaal in 3 stappen (hp-story) ----------
  // Een vast beeld dat meebeweegt met de tekst: 1 kriskras netwerk, 2 de puzzel valt in elkaar,
  // 3 iedereen verbonden via OZO. Tekst en stappen staan in Webflow ([data-hp-story], [data-hp-step]);
  // de tekening (SVG) komt in de lege [data-hp-stage]. Scroll-animatie met GSAP ScrollTrigger.
  function initHpStory() {
    const root = document.querySelector('[data-hp-story]');
    // Een oude script-embed in de sectie regelt het zelf nog (overgang)
    if (!root || root.hasAttribute('data-hp-ready') || root.querySelector('.w-script')) return;
    if (!window.gsap || !window.ScrollTrigger) return;
    var NS = 'http://www.w3.org/2000/svg';
    var W = 640, H = 560, CX = 320, CY = 285, AR = 26, PW = 176, PH = 136, HR = 64, PZ = 1.22;
    var INK = '#351b7c';
    var T = {
      client: { fg: '#7469e8', bg: '#dcd8fd', piece: '#e3defd', ink: '#5446c4' },
      pro: { fg: '#2f7c7a', bg: '#b4e5e7', piece: '#a8e6e8', ink: '#1b6260' },
      gem: { fg: '#f39a5e', bg: '#ffe0cc', piece: '#ffdcc6', ink: '#d0631f' },
      it: { fg: '#d1b03a', bg: '#f8eda8', piece: '#f8eba3', ink: '#8a7108' }
    };
    // a = plek in stap 1, p = plek op de puzzel, ang = plek rond OZO (om de 36°, Cliënt bovenaan)
    // Op de puzzel één poppetje per stuk: sub schuift naar de plek van de eerste van de groep en vervaagt,
    // late (IT-partner) hoort niet bij de chaos en komt pas bij de puzzel in beeld
    var NODES = [
      { r: 'Cliënt', t: 'client', a: [320, 285], p: [232, 205], ang: -90, big: 1 },
      { r: 'Mantelzorger', t: 'client', a: [548, 128], p: [232, 205], ang: 54, sub: 1 },
      { r: 'Huisarts', t: 'pro', a: [128, 110], p: [408, 205], ang: -54 },
      { r: 'GGZ', t: 'pro', a: [520, 470], p: [408, 205], ang: -18, sub: 1 },
      { r: 'Apotheek', t: 'pro', a: [110, 455], p: [408, 205], ang: -126, sub: 1 },
      { r: 'Gemeente', t: 'gem', a: [72, 270], p: [232, 341], ang: 198 },
      { r: 'Ziekenhuis', t: 'pro', a: [300, 505], p: [408, 205], ang: 162, sub: 1 },
      { r: 'VVT', t: 'pro', a: [578, 300], p: [408, 205], ang: 18, sub: 1 },
      { r: 'School', t: 'pro', a: [320, 62], p: [408, 205], ang: 90, sub: 1 },
      { r: 'IT-partner', t: 'it', a: [408, 341], p: [408, 341], ang: 126, late: 1 }
    ];
    // stap 1 (netwerk) en stap 3 (OZO in het midden) iets kleiner dan de puzzel
    var K = 0.9;
    NODES.forEach(function (n) { n.a = [CX + (n.a[0] - CX) * K, CY + (n.a[1] - CY) * K]; });
    var PAINS = [
      [1, 'Heeft iemand de huisarts al gebeld?'],
      [0, 'Ik hoor alles pas achteraf.'],
      [3, 'Weer twintig minuten in de wacht…'],
      [4, 'Klopt deze medicatielijst nog?'],
      [2, 'Wie heeft het laatste overzicht?']
    ];
    var PAIRS = [[0, 3], [1, 4], [2, 6], [5, 1], [7, 2], [6, 0], [3, 5], [4, 7], [2, 1], [0, 5], [8, 4], [8, 7]];
    // e = randen boven/rechts/onder/links: 0 recht, 1 nop naar buiten, -1 naar binnen
    var PIECES = [
      { t: 'client', l: 'Cliënt & naasten', o: [CX - PW, CY - PH], e: [0, -1, 1, 0], c: [16, 0, 0, 0], d: [-1, -1], r: -16 },
      { t: 'pro', l: 'Zorgprofessionals', o: [CX, CY - PH], e: [0, 0, 1, 1], c: [0, 16, 0, 0], d: [1, -1], r: 14 },
      { t: 'gem', l: 'Gemeenten', o: [CX - PW, CY], e: [-1, -1, 0, 0], c: [0, 0, 0, 16], d: [-1, 1], r: 12 },
      { t: 'it', l: 'IT-partners', o: [CX, CY], e: [-1, 0, 0, 1], c: [0, 0, 16, 0], d: [1, 1], r: -12 }
    ];
    // Op de puzzel krijgt elk stuk een icoon (Material Symbols, viewBox 0 -960 960 960)
    var ICON = {
      client: 'M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780Zm-455-80h311q-10-20-55.5-35T480-370q-55 0-100.5 15T325-320ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Zm0-80q17 0 28.5-11.5T520-600q0-17-11.5-28.5T480-640q-17 0-28.5 11.5T440-600q0 17 11.5 28.5T480-560Zm1 240Zm-1-280Z',
      pro: 'M420-280h120v-100h100v-120H540v-100H420v100H320v120h100v100ZM160-120v-480l320-240 320 240v480H160Zm80-80h480v-360L480-740 240-560v360Zm240-270Z',
      gem: 'M324-111.5Q251-143 197-197t-85.5-127Q80-397 80-480t31.5-156Q143-709 197-763t127-85.5Q397-880 480-880t156 31.5Q709-817 763-763t85.5 127Q880-563 880-480t-31.5 156Q817-251 763-197t-127 85.5Q563-80 480-80t-156-31.5ZM480-260q45-45 80-93 30-41 55-90t25-97q0-66-47-113t-113-47q-66 0-113 47t-47 113q0 48 25 97t55 90q35 48 80 93Zm-42.5-237.5Q420-515 420-540t17.5-42.5Q455-600 480-600t42.5 17.5Q540-565 540-540t-17.5 42.5Q505-480 480-480t-42.5-17.5Z',
      it: 'M480-540ZM80-160v-80h400v80H80Zm120-120q-33 0-56.5-23.5T120-360v-360q0-33 23.5-56.5T200-800h560q33 0 56.5 23.5T840-720H200v360h280v80H200Zm600 40v-320H640v320h160Zm-180 80q-25 0-42.5-17.5T560-220v-360q0-25 17.5-42.5T620-640h200q25 0 42.5 17.5T880-580v360q0 25-17.5 42.5T820-160H620Zm100-300q13 0 21.5-9t8.5-21q0-13-8.5-21.5T720-520q-12 0-21 8.5t-9 21.5q0 12 9 21t21 9Zm0 60Z'
    };

    function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function lerp(a, b, t) { return a + (b - a) * t; }
    function lerp2(p, q, t) { return [lerp(p[0], q[0], t), lerp(p[1], q[1], t)]; }
    function f(v) { return Math.round(v * 10) / 10; }
    function backOut(x) { x = clamp(x) - 1; return 1 + 2.6 * x * x * x + 1.6 * x * x; }
    function svg(tag, attrs, parent) {
      var n = document.createElementNS(NS, tag);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(n);
      return n;
    }
    function div(cls, parent, text) {
      var n = document.createElement('div');
      n.className = cls;
      if (text) n.textContent = text;
      parent.appendChild(n);
      return n;
    }
    var seed = 11;
    function rnd(a, b) { seed = (seed * 16807) % 2147483647; return a + (b - a) * (seed - 1) / 2147483646; }

    // Vloeiende lijn door alle punten (Catmull-Rom)
    function curve(p) {
      var d = 'M' + f(p[0][0]) + ',' + f(p[0][1]);
      for (var i = 0; i < p.length - 1; i++) {
        var p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
        d += 'C' + f(p1[0] + (p2[0] - p0[0]) / 6) + ',' + f(p1[1] + (p2[1] - p0[1]) / 6) + ' ' +
          f(p2[0] - (p3[0] - p1[0]) / 6) + ',' + f(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + f(p2[0]) + ',' + f(p2[1]);
      }
      return d;
    }
    // Eerste deel (fractie fr) van een puntenreeks
    function partial(p, fr) {
      if (fr >= 1) return p;
      var x = fr * (p.length - 1), i = Math.floor(x), out = p.slice(0, i + 1);
      if (x > i) out.push(lerp2(p[i], p[i + 1], x - i));
      return out.length > 1 ? out : [p[0], p[0]];
    }
    function pointAt(p, u) {
      var n = p.length - 1, x = clamp(u) * n, i = Math.min(Math.floor(x), n - 1);
      return lerp2(p[i], p[i + 1], x - i);
    }
    // Kriskras lijn van a naar b: een omweg via het midden
    function chaosLine(a, b) {
      var A = NODES[a].a, B = NODES[b].a, V = [CX + rnd(-100, 100) * K, CY + rnd(-80, 80) * K];
      function jit(p, q, t, m) {
        var x = lerp2(p, q, t), dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1, o = rnd(-m, m);
        return [x[0] - dy / L * o, x[1] + dx / L * o];
      }
      return [A, jit(A, V, 0.45, 35), V, jit(V, B, 0.55, 40), B];
    }
    // Puzzelstuk: rand met een echte nop (hals + bol), met de klok mee getekend.
    // De noppen wijzen naar plekken zonder iconen of labels.
    var TAB = [[-16, 0], [-9, 0, -7, 3, -8, 7], [-11, 14, -8, 22, 0, 22], [8, 22, 11, 14, 8, 7], [7, 3, 9, 0, 16, 0]];
    function edge(P, Q, k) {
      if (!k) return 'L' + Q;
      var L = Math.hypot(Q[0] - P[0], Q[1] - P[1]), ux = (Q[0] - P[0]) / L, uy = (Q[1] - P[1]) / L;
      var mx = (P[0] + Q[0]) / 2, my = (P[1] + Q[1]) / 2, nx = uy * k, ny = -ux * k;
      function pt(du, dv) { return f(mx + ux * du + nx * dv) + ',' + f(my + uy * du + ny * dv); }
      var d = 'L' + pt(TAB[0][0], TAB[0][1]);
      for (var i = 1; i < TAB.length; i++) {
        var c = TAB[i];
        d += 'C' + pt(c[0], c[1]) + ' ' + pt(c[2], c[3]) + ' ' + pt(c[4], c[5]);
      }
      return d + 'L' + Q;
    }
    function piecePath(e, c) {
      function arc(r, x, y) { return r ? 'A' + r + ',' + r + ' 0 0 1 ' + x + ',' + y : ''; }
      return 'M' + c[0] + ',0' + edge([c[0], 0], [PW - c[1], 0], e[0]) + arc(c[1], PW, c[1]) +
        edge([PW, c[1]], [PW, PH - c[2]], e[1]) + arc(c[2], PW - c[2], PH) +
        edge([PW - c[2], PH], [c[3], PH], e[2]) + arc(c[3], 0, PH - c[3]) +
        edge([0, PH - c[3]], [0, c[0]], e[3]) + arc(c[0], c[0], 0) + 'Z';
    }
    // Licht golvende cirkel rond OZO
    function blobPath(r, t) {
      var n = 40, pts = [];
      for (var i = 0; i < n; i++) {
        var a = i / n * Math.PI * 2;
        var rr = r * (1 + 0.035 * Math.sin(3 * a + t * 1.1) + 0.025 * Math.sin(5 * a - t * 0.8) + 0.02 * Math.sin(2 * a + t * 0.6));
        pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
      }
      var m = lerp2(pts[n - 1], pts[0], 0.5), d = 'M' + f(m[0]) + ',' + f(m[1]);
      for (i = 0; i < n; i++) {
        m = lerp2(pts[i], pts[(i + 1) % n], 0.5);
        d += 'Q' + f(pts[i][0]) + ',' + f(pts[i][1]) + ' ' + f(m[0]) + ',' + f(m[1]);
      }
      return d + 'Z';
    }

    function setup(root) {
      var stage = root.querySelector('[data-hp-stage]');
      var steps = root.querySelector('[data-hp-steps]');
      var stepEls = root.querySelectorAll('[data-hp-step]');
      if (!stage || !steps || stepEls.length < 3) return;
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      // Mobiel: tijdens de puzzel schuift het beeld omhoog, zodat de puzzel tegen de bovenkant staat
      var mq = window.matchMedia('(max-width: 767px)'), LIFT = 50;

      stage.innerHTML = '';
      var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'hp-story_svg', focusable: 'false' }, stage);
      var defs = svg('defs', {}, s);
      svg('circle', { r: AR }, svg('clipPath', { id: 'hpAvClip' }, defs));
      var rg = svg('radialGradient', { id: 'hpGlow' }, defs);
      svg('stop', { offset: '0', 'stop-color': '#fff', 'stop-opacity': '.95' }, rg);
      svg('stop', { offset: '1', 'stop-color': '#fff', 'stop-opacity': '0' }, rg);

      var glow = svg('circle', { cx: CX, cy: CY, r: 250, fill: 'url(#hpGlow)', opacity: 0 }, s);
      var gChaos = svg('g', { fill: 'none', stroke: '#cdc7fa', 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-dasharray': '7 9' }, s);
      var chaos = PAIRS.map(function (pr) {
        return { a: pr[0], b: pr[1], pts: chaosLine(pr[0], pr[1]), el: svg('path', {}, gChaos) };
      });
      var gPieces = svg('g', {}, s);
      var pieces = PIECES.map(function (p) {
        var g = svg('g', { opacity: 0 }, gPieces);
        svg('path', { d: piecePath(p.e, p.c), fill: T[p.t].piece, stroke: '#f6f1ee', 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
        return { p: p, g: g };
      });
      var gRings = svg('g', { fill: 'none', stroke: '#c9c2f7', 'stroke-width': 1.5 }, s);
      var rings = [svg('circle', { cx: CX, cy: CY, opacity: 0 }, gRings), svg('circle', { cx: CX, cy: CY, opacity: 0 }, gRings)];
      var gLines = svg('g', { fill: 'none', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-dasharray': '5 7' }, s);
      var gDots = svg('g', {}, s);
      var gHub = svg('g', { opacity: 0 }, s);
      var hubBlob = svg('path', { fill: '#fff', stroke: INK, 'stroke-width': 2.5 }, gHub);
      svg('text', { 'text-anchor': 'middle', y: 11, fill: INK, 'class': 'hp-story_hubtext' }, gHub).textContent = 'OZO';
      var gChips = svg('g', {}, s);
      var gNodes = svg('g', {}, s);

      var nodes = NODES.map(function (n, i) {
        var c = T[n.t], g = svg('g', {}, gNodes), rad = Math.PI / 180;
        var halo = svg('circle', { r: AR + 6, fill: 'none', stroke: c.fg, 'stroke-width': 1.5, opacity: 0 }, g);
        svg('circle', { r: AR, fill: c.bg }, g);
        var cl = svg('g', { 'clip-path': 'url(#hpAvClip)' }, g);
        svg('circle', { cy: -7, r: 9.5, fill: c.fg }, cl);
        svg('ellipse', { cy: 21, rx: 17, ry: 13.5, fill: c.fg }, cl);
        var icon = svg('path', { d: ICON[n.t], fill: c.fg, transform: 'scale(.036) translate(-480,480)', opacity: 0 }, g);
        return {
          n: n, g: g, halo: halo, fig: cl, icon: icon, line: svg('path', { stroke: c.fg }, gLines),
          dots: [svg('circle', { r: 3.4, fill: c.fg, opacity: 0 }, gDots), svg('circle', { r: 3.4, fill: c.fg, opacity: 0 }, gDots)],
          ring: [CX + 238 * K * Math.cos(n.ang * rad), CY + 200 * K * Math.sin(n.ang * rad)],
          pz: [CX + (n.p[0] - CX) * PZ, CY + (n.p[1] - CY) * PZ],
          pos: n.a.slice(), s: 1, ph: i * 1.37
        };
      });
      var chips = [0, 1].map(function () {
        var g = svg('g', { opacity: 0 }, gChips);
        svg('path', { d: 'M-9,-10H9A5,5 0 0 1 14,-5V3A5,5 0 0 1 9,8H-4L-9,13V8A5,5 0 0 1 -14,3V-5A5,5 0 0 1 -9,-10Z', fill: '#fff', stroke: INK, 'stroke-width': 1.4, 'stroke-linejoin': 'round' }, g);
        [-6, 0, 6].forEach(function (x) { svg('circle', { cx: x, cy: -1, r: 1.6, fill: INK }, g); });
        var q = svg('text', { 'text-anchor': 'middle', fill: INK, 'class': 'hp-story_q', opacity: 0 }, gChips);
        q.textContent = '?';
        return { g: g, q: q };
      });

      var ov = div('hp-story_overlay', stage);
      var names = nodes.map(function (o) { return div('hp-story_name' + (o.n.big ? ' is-big' : ''), ov, o.n.r); });
      var plabels = pieces.map(function (o) { return div('hp-story_plabel', ov, o.p.l); });
      var painWrap = div('hp-story_pains', ov);
      var pains = PAINS.map(function (p) { return { i: p[0], el: div('hp-story_pain', painWrap, p[1]) }; });
      var S = { chaos: 1, toPuz: 0, puz: 0, puzOut: 0, toRing: 0, hub: 0, lines: 0, flow: 0 };

      function render() {
        var t = reduce ? 0 : performance.now() / 1000, e1 = S.toPuz, e2 = S.toRing;
        var vy = mq.matches ? LIFT * e1 * (1 - e2) : 0;
        s.setAttribute('viewBox', '0 ' + f(vy) + ' ' + W + ' ' + H);

        nodes.forEach(function (o, i) {
          var n = o.n, b = lerp2(lerp2(n.a, o.pz, e1), o.ring, e2), calm = (1 - e1) * 5 + e2 * 2.5 + 1.2;
          var x = b[0] + Math.sin(t * 0.8 + o.ph) * calm + Math.sin(t * 3.3 + o.ph * 2) * 0.5 * S.chaos;
          var y = b[1] + Math.cos(t * 0.7 + o.ph * 1.3) * calm;
          var pzk = e1 * (1 - e2);
          var sc = (1 - 0.12 * pzk) * (K + (1 - K) * pzk) * (n.big ? 1.15 : 1);
          o.pos = [x, y];
          o.s = sc;
          o.g.setAttribute('transform', 'translate(' + f(x) + ',' + f(y) + ') scale(' + sc.toFixed(3) + ')');
          var al = n.late ? clamp(e1 * 1.5) : n.sub ? 1 - clamp(pzk * 1.6) : 1;
          o.al = al;
          o.g.setAttribute('opacity', al.toFixed(2));
          // Op de puzzel wordt het poppetje het icoon van de groep
          var ic = clamp(pzk * 1.6 - 0.3);
          o.fig.setAttribute('opacity', (1 - ic).toFixed(2));
          o.icon.setAttribute('opacity', ic.toFixed(2));
          var lo = (clamp(1 - e1 * 2.2) + clamp(e2 * 2.2 - 1.2)) * al;
          names[i].style.cssText = 'left:' + f(x / W * 100) + '%;top:' + f((y - vy + AR * sc + 5) / H * 100) + '%;opacity:' + lo.toFixed(2);
        });

        chaos.forEach(function (c, i) {
          var fr = clamp(S.chaos * 1.35 - (i % 4) * 0.09);
          if (fr <= 0) { c.el.setAttribute('d', ''); c.cur = null; return; }
          var last = c.pts.length - 1;
          var p = c.pts.map(function (q, k) {
            if (k === 0) return nodes[c.a].pos;
            if (k === last) return nodes[c.b].pos;
            return [q[0] + Math.sin(t * 1.2 + k * 1.9 + i) * 1.5, q[1] + Math.cos(t * 1.05 + k * 1.3 + i) * 1.5];
          });
          c.cur = partial(p, fr);
          c.el.setAttribute('d', curve(c.cur));
          c.el.setAttribute('opacity', clamp(fr * 3).toFixed(2));
        });
        gChaos.setAttribute('stroke-dashoffset', f(-t * 14));

        // Berichtjes die onderweg kwijtraken
        var cm = reduce ? 0 : clamp((S.chaos - 0.6) * 3);
        chips.forEach(function (ch, k) {
          var v = t * 0.16 + k / 2, u = v % 1, c = chaos[(Math.floor(v) * 3 + k * 5) % chaos.length];
          if (!cm || !c.cur) { ch.g.setAttribute('opacity', 0); ch.q.setAttribute('opacity', 0); return; }
          var pt = pointAt(c.cur, 0.05 + Math.min(u, 0.5));
          var o = u < 0.08 ? u / 0.08 : u < 0.5 ? 1 : u < 0.62 ? 1 - (u - 0.5) / 0.12 : 0;
          var qo = u < 0.56 ? 0 : u < 0.66 ? (u - 0.56) / 0.1 : u < 0.9 ? 1 - (u - 0.66) / 0.24 : 0;
          ch.g.setAttribute('transform', 'translate(' + f(pt[0]) + ',' + f(pt[1] - 4) + ')');
          ch.g.setAttribute('opacity', (o * cm).toFixed(2));
          ch.q.setAttribute('x', f(pt[0]));
          ch.q.setAttribute('y', f(pt[1] - 18 - Math.max(0, u - 0.56) * 40));
          ch.q.setAttribute('opacity', (k ? 0 : qo * cm).toFixed(2));
        });

        // Pijnpunten: steeds één tekstballon tegelijk
        var active = Math.floor(t / 2.6) % pains.length;
        painWrap.style.opacity = clamp((S.chaos - 0.6) * 3).toFixed(2);
        pains.forEach(function (p, k) {
          var o = nodes[p.i], x = o.pos[0], y = o.pos[1], below = y < 150;
          var tx = x < 140 ? '-16%' : x > 500 ? '-84%' : '-50%';
          p.el.style.left = f(x / W * 100) + '%';
          p.el.style.top = f(((below ? y + AR * o.s + 30 : y - AR * o.s - 10) - vy) / H * 100) + '%';
          p.el.style.setProperty('--tx', tx);
          p.el.style.setProperty('--tail', tx === '-16%' ? '16%' : tx === '-84%' ? '84%' : '50%');
          p.el.classList.toggle('is-below', below);
          p.el.classList.toggle('is-on', k === active);
        });

        pieces.forEach(function (o, k) {
          var p = o.p, e = backOut((S.puz - k * 0.1) / 0.7), eo = S.puzOut * S.puzOut;
          var cx = CX + (p.o[0] + PW / 2 - CX) * PZ + p.d[0] * 150 * (1 - e), cy = CY + (p.o[1] + PH / 2 - CY) * PZ + p.d[1] * 110 * (1 - e);
          cx = lerp(cx, CX, eo);
          cy = lerp(cy, CY, eo) + Math.sin(t * 0.9 + k) * 1.5 * clamp(e) * (1 - eo);
          var rot = p.r * (1 - e) - p.r * 2.5 * eo, sc = (0.7 + 0.3 * e) * (1 - 0.8 * eo) * PZ;
          o.g.setAttribute('transform', 'translate(' + f(cx) + ',' + f(cy) + ') rotate(' + f(rot) + ') scale(' + sc.toFixed(3) + ') translate(' + (-PW / 2) + ',' + (-PH / 2) + ')');
          o.g.setAttribute('opacity', (clamp(e * 1.5) * (1 - eo)).toFixed(3));
          var lo = clamp(S.puz * 2.2 - 1.2) * (1 - clamp(S.puzOut * 3));
          plabels[k].style.cssText = 'left:' + f(cx / W * 100) + '%;top:' + f((cy - vy + 40 * sc) / H * 100) + '%;opacity:' + lo.toFixed(2) + ';color:' + T[p.t].ink;
        });

        var hs = Math.max(backOut(S.hub), 0.001);
        gHub.setAttribute('opacity', clamp(S.hub * 2).toFixed(2));
        gHub.setAttribute('transform', 'translate(' + CX + ',' + CY + ') scale(' + (hs * K).toFixed(3) + ')');
        hubBlob.setAttribute('d', blobPath(HR, t));
        glow.setAttribute('opacity', (S.hub * 0.9).toFixed(2));
        rings.forEach(function (r, k) {
          var u = (t * 0.4 + k * 0.5) % 1;
          r.setAttribute('r', f((HR + u * 120) * K));
          r.setAttribute('opacity', ((1 - u) * 0.5 * S.flow).toFixed(3));
        });

        // Rustige lijnen van OZO naar iedereen, met informatie die heen en weer gaat
        nodes.forEach(function (o, i) {
          var fr = clamp(S.lines * 1.5 - i * 0.05);
          o.halo.setAttribute('opacity', (S.flow * (0.25 + 0.2 * Math.sin(t * 2 + i))).toFixed(2));
          if (fr <= 0) {
            o.line.setAttribute('d', '');
            o.dots[0].setAttribute('opacity', 0);
            o.dots[1].setAttribute('opacity', 0);
            return;
          }
          var dx = o.pos[0] - CX, dy = o.pos[1] - CY, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
          var P0 = [CX + ux * (HR * K + 8), CY + uy * (HR * K + 8)];
          var P2 = [o.pos[0] - ux * (AR * o.s + 8), o.pos[1] - uy * (AR * o.s + 8)];
          var bend = i % 2 ? 14 : -14, P1 = [(P0[0] + P2[0]) / 2 - uy * bend, (P0[1] + P2[1]) / 2 + ux * bend];
          var Q1 = lerp2(P0, P1, fr), Q2 = lerp2(Q1, lerp2(P1, P2, fr), fr);
          o.line.setAttribute('d', 'M' + f(P0[0]) + ',' + f(P0[1]) + 'Q' + f(Q1[0]) + ',' + f(Q1[1]) + ' ' + f(Q2[0]) + ',' + f(Q2[1]));
          o.line.setAttribute('opacity', '.75');
          o.dots.forEach(function (d, k) {
            var u = (t * 0.32 + i * 0.17 + k * 0.5) % 1;
            if (i % 2) u = 1 - u;
            var a = lerp2(lerp2(P0, P1, u), lerp2(P1, P2, u), u);
            d.setAttribute('cx', f(a[0]));
            d.setAttribute('cy', f(a[1]));
            d.setAttribute('opacity', (Math.sin(Math.PI * u) * S.flow * (fr >= 1 ? 1 : 0)).toFixed(2));
          });
        });
        gLines.setAttribute('stroke-dashoffset', f(-t * 12));
      }

      var tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
      // 0 = midden stap 1, 0.5 = midden stap 2, 1 = midden stap 3
      tl.to(S, { chaos: 0, duration: 0.12, ease: 'power1.in' }, 0.13)
        .to(S, { toPuz: 1, duration: 0.16, ease: 'power2.inOut' }, 0.18)
        .to(S, { puz: 1, duration: 0.16 }, 0.19)
        .to(S, { puzOut: 1, duration: 0.08, ease: 'power1.in' }, 0.6)
        .to(S, { toRing: 1, duration: 0.15, ease: 'power2.inOut' }, 0.61)
        .to(S, { hub: 1, duration: 0.09 }, 0.68)
        .to(S, { lines: 1, duration: 0.1 }, 0.74)
        .to(S, { flow: 1, duration: 0.06 }, 0.8)
        .to({ x: 0 }, { x: 1, duration: 0.01 }, 0.99);

      var cur = -1;
      function setActive(p) {
        var k = p < 0.25 ? 0 : p < 0.75 ? 1 : 2;
        if (k === cur) return;
        cur = k;
        for (var i = 0; i < 3; i++) {
          stepEls[i].classList.toggle('is-active', i === k);
        }
      }
      setActive(0);

      var mm = gsap.matchMedia();
      mm.add({ desk: '(min-width: 768px)', mob: '(max-width: 767px)' }, function (ctx) {
        // Desktop: tekst in het midden van het scherm. Mobiel: tekst onder het beeld.
        var vis = root.querySelector('.hp-story_visual');
        // Mobiel: de tekst schuift eerst iets onder het beeld voordat de animatie verder gaat
        var at = ctx.conditions.desk ? 'center center' : function () {
          return 'top ' + Math.round(vis ? vis.offsetHeight - 48 : window.innerHeight * 0.5) + 'px';
        };
        ScrollTrigger.create({
          trigger: stepEls[0], start: at, endTrigger: stepEls[2], end: at, animation: tl, scrub: 0.7,
          onUpdate: function (self) { setActive(self.progress); }
        });
        if (!ctx.conditions.mob) return;
        // Mobiel: de tekst vervaagt geleidelijk naar de randen (onder het beeld en onderaan het scherm), zonder sprong
        var raf = 0;
        function fade() {
          raf = 0;
          var vb = vis ? vis.getBoundingClientRect().bottom : 0, vh = window.innerHeight;
          for (var i = 0; i < stepEls.length; i++) {
            var el = stepEls[i];
            if (!el.firstElementChild) continue;
            var t = el.firstElementChild.getBoundingClientRect().top, b = el.lastElementChild.getBoundingClientRect().bottom;
            var o = Math.min(clamp((b - vb - 10) / 110), clamp((vh * 0.95 - t) / (vh * 0.35)));
            el.style.transition = 'none';
            el.style.opacity = (0.22 + 0.78 * o).toFixed(3);
          }
        }
        function onScroll() { if (!raf) raf = requestAnimationFrame(fade); }
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        fade();
        return function () {
          window.removeEventListener('scroll', onScroll);
          window.removeEventListener('resize', onScroll);
          for (var i = 0; i < stepEls.length; i++) { stepEls[i].style.opacity = ''; stepEls[i].style.transition = ''; }
        };
      });

      var running = false;
      new IntersectionObserver(function (es) {
        var vis = es[0].isIntersecting;
        if (vis && !running) gsap.ticker.add(render);
        if (!vis && running) gsap.ticker.remove(render);
        running = vis;
      }, { rootMargin: '100px' }).observe(stage);
      render();
      root.setAttribute('data-hp-ready', '');
      window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    }
    gsap.registerPlugin(ScrollTrigger);
    setup(root);
  }

  // ---------- Homepage en Onze missie: waarom OZO (hp-why) ----------
  // Kaarten schuiven binnen; de illustraties (SVG-embeds in Webflow) bewegen alleen als ze in beeld zijn.
  // 1: het netwerk rond de cliënt groeit, 3: een gesprekje op de telefoon. 2 en 4 lopen op CSS (Global CSS v2).
  function initHpWhy() {
    if (!window.gsap || !window.ScrollTrigger) return;

    // Labels en tekstballonnen passend maken op de echte tekstbreedte (het lettertype van de site is breder
    // dan een vaste schatting). [data-fit] = start | end | middle vanaf data-x; .fit-icon schuift mee.
    function fitLabels(root) {
      root.querySelectorAll('[data-fit]').forEach(function (g) {
        var rect = g.querySelector('rect');
        var texts = g.querySelectorAll(':scope > text');
        var icon = g.querySelector(':scope > .fit-icon');
        var pad = +g.getAttribute('data-pad') || 0, iw = +g.getAttribute('data-iw') || 0;
        var gap = icon ? +(g.getAttribute('data-gap') || 6) : 0;
        var tw = 0;
        texts.forEach(function (t) { tw = Math.max(tw, t.getComputedTextLength()); });
        if (!texts.length) tw = +rect.getAttribute('width') - pad * 2;
        var w = Math.ceil(pad * 2 + iw + gap + tw), ax = +g.getAttribute('data-x'), mode = g.getAttribute('data-fit');
        var x = mode === 'end' ? ax - w : mode === 'middle' ? ax - w / 2 : ax;
        var dx = x - +rect.getAttribute('x');
        rect.setAttribute('x', x);
        rect.setAttribute('width', w);
        var cy = +rect.getAttribute('y') + +rect.getAttribute('height') / 2;
        if (icon) icon.setAttribute('transform', 'translate(' + (x + pad) + ' ' + cy + ')');
        texts.forEach(function (t) { t.setAttribute('x', x + pad + iw + gap); });
        // Losse onderdelen zonder tekst (typ-puntjes) schuiven mee met het vlak
        if (!texts.length) g.querySelectorAll(':scope > circle').forEach(function (c) { c.setAttribute('cx', +c.getAttribute('cx') + dx); });
      });
      // Het hartje hangt aan de linkeronderhoek van het antwoord
      var b2 = root.querySelector('.hpw3-b2 rect'), heart = root.querySelector('.hpw3-heart-pos');
      if (b2 && heart) heart.setAttribute('transform', 'translate(' + (+b2.getAttribute('x') + 6) + ' ' + (+b2.getAttribute('y') + +b2.getAttribute('height')) + ')');
    }

    function setup(root) {
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      fitLabels(root);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitLabels(root); });

      // CSS-animaties lopen alleen als de sectie in beeld is
      new IntersectionObserver(function (es) {
        root.classList.toggle('is-live', es[0].isIntersecting);
      }, { rootMargin: '60px' }).observe(root);

      if (reduce) return;

      // Kaarten schuiven rustig binnen (eerst verbergen, dan per groep binnenhalen)
      gsap.set(root.querySelectorAll('.hp-why_card'), { autoAlpha: 0 });
      ScrollTrigger.batch(root.querySelectorAll('.hp-why_card'), {
        start: 'top 88%',
        once: true,
        onEnter: function (batch) {
          gsap.fromTo(batch, { y: 48, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out', stagger: 0.12, overwrite: true });
        }
      });

      // Speelt een tijdlijn alleen af als de illustratie in beeld is
      function whenVisible(el, tl) {
        ScrollTrigger.create({
          trigger: el, start: 'top bottom', end: 'bottom top',
          onToggle: function (self) { self.isActive ? tl.play() : tl.pause(); }
        });
      }

      // 1: één voor één sluit iemand aan op het netwerk van de cliënt
      var s1 = root.querySelector('[data-hpw="1"]');
      if (s1) {
        var lines = s1.querySelectorAll('.hpw1-line');
        var toasts = s1.querySelectorAll('.hpw1-toast');
        var tl1 = gsap.timeline({ repeat: -1, paused: true });
        s1.querySelectorAll('.hpw1-sat').forEach(function (sat, i) {
          var t = 0.4 + i * 1.3;
          tl1.fromTo(lines[i], { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut' }, t)
            .fromTo(sat.querySelector('.hpw1-av'), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.5, ease: 'back.out(2.2)' }, t + 0.4)
            .fromTo(sat.querySelector('.hpw1-check'), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, t + 0.75)
            .fromTo(toasts[i], { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' }, t + 0.75)
            .to(toasts[i], { autoAlpha: 0, y: -4, duration: 0.3, ease: 'power2.in' }, t + 1.9);
        });
        tl1.to(s1.querySelectorAll('.hpw1-line, .hpw1-av, .hpw1-check'), { autoAlpha: 0, duration: 0.5 }, 9)
          .to({}, { duration: 0.6 });
        whenVisible(s1, tl1);
      }

      // 3: een vraag, iemand typt, het antwoord komt binnen, met een hartje
      var s3 = root.querySelector('[data-hpw="3"]');
      if (s3) {
        var b1 = s3.querySelector('.hpw3-b1'), typing = s3.querySelector('.hpw3-typing');
        var b2 = s3.querySelector('.hpw3-b2'), heart = s3.querySelector('.hpw3-heart'), send = s3.querySelector('.hpw3-send');
        var tl3 = gsap.timeline({ repeat: -1, paused: true });
        tl3.fromTo(send, { scale: 1, transformOrigin: '50% 50%' }, { scale: 0.85, duration: 0.15, yoyo: true, repeat: 1 }, 0.3)
          .fromTo(b1, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'back.out(1.6)' }, 0.5)
          .fromTo(typing, { autoAlpha: 0, scale: 0.6, transformOrigin: '100% 50%' }, { autoAlpha: 1, scale: 1, duration: 0.3 }, 1.3)
          .to(typing, { autoAlpha: 0, duration: 0.2 }, 2.5)
          .fromTo(b2, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'back.out(1.6)' }, 2.55)
          .fromTo(heart, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.45, ease: 'back.out(3)' }, 3.4)
          .to([b1, b2, heart], { autoAlpha: 0, duration: 0.4 }, 6.6)
          .to({}, { duration: 0.5 });
        whenVisible(s3, tl3);
      }
    }
    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll('[data-hp-why]').forEach((root) => {
      if (root.hasAttribute('data-hp-why-ready') || root.querySelector('.w-script')) return;
      root.setAttribute('data-hp-why-ready', '');
      setup(root);
    });
  }

  // ---------- Homepage: videokaart met eigen speler (hp-video) ----------
  // De kaart [data-hp-video] (Webflow, met data-src = mp4 en data-title) opent een eigen speler in een
  // pop-up: een gewone <video> met onze eigen bediening (geen Vimeo-player). De kaart groeit uit tot
  // de speler en krimpt bij sluiten terug. Stijl van de speler: Global CSS v2.
  function initHpVideo() {
    var ICON = {
      play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.6v12.8a1 1 0 0 0 1.52.85l10.4-6.4a1 1 0 0 0 0-1.7L9.52 4.75A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>',
      pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4.2" height="14" rx="1.3" fill="currentColor"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.3" fill="currentColor"/></svg>',
      replay: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v3.8h3.8"/></svg>',
      sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 9.5h3.4L12 5.6v12.8l-4.6-3.9H4z" fill="currentColor" stroke="none"/><path d="M15.5 9.2a4 4 0 0 1 0 5.6M18.2 6.6a7.6 7.6 0 0 1 0 10.8"/></svg>',
      muted: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 9.5h3.4L12 5.6v12.8l-4.6-3.9H4z" fill="currentColor" stroke="none"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>',
      full: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
      close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
    };

    function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function fmt(s) {
      s = isFinite(s) ? Math.max(0, Math.floor(s)) : 0;
      return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    }

    function setup(card) {
      var src = card.getAttribute('data-src');
      if (!src) return;
      var poster = card.getAttribute('data-poster') || '';
      var title = card.getAttribute('data-title') || 'Video';
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var dlg, canvas, video, line, prog, buf, handle, tNow, tDur, muteBtn, playBtn, hideTimer, raf;
      var scrubbing = false, busy = false;

      function build() {
        dlg = document.createElement('dialog');
        dlg.className = 'hp-player';
        dlg.setAttribute('aria-label', title);
        dlg.innerHTML =
          '<div class="hp-player_wrap">' +
          '<button type="button" class="hp-player_close" aria-label="Video sluiten">' + ICON.close + '</button>' +
          '<div class="hp-player_canvas" data-status="idle">' +
          '<video class="hp-player_video" playsinline preload="metadata"></video>' +
          (poster ? '<img class="hp-player_poster" alt="" src="' + poster + '">' : '') +
          '<button type="button" class="hp-player_big" aria-label="Afspelen">' +
          '<span class="i-play">' + ICON.play + '</span><span class="i-replay">' + ICON.replay + '</span></button>' +
          '<span class="hp-player_spinner" aria-hidden="true"></span>' +
          '<div class="hp-player_bar">' +
          '<button type="button" class="hp-player_btn" data-act="play" aria-label="Afspelen">' +
          '<span class="i-play">' + ICON.play + '</span><span class="i-pause">' + ICON.pause + '</span></button>' +
          '<span class="hp-player_t" data-t="now">0:00</span>' +
          '<div class="hp-player_line" role="slider" tabindex="0" aria-label="Tijdlijn" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0" aria-valuetext="0:00">' +
          '<span class="hp-player_track"><span class="hp-player_buf"></span><span class="hp-player_prog"></span></span>' +
          '<span class="hp-player_handle"></span></div>' +
          '<span class="hp-player_t" data-t="dur">0:00</span>' +
          '<button type="button" class="hp-player_btn" data-act="mute" aria-label="Geluid uit">' +
          '<span class="i-sound">' + ICON.sound + '</span><span class="i-muted">' + ICON.muted + '</span></button>' +
          '<button type="button" class="hp-player_btn" data-act="full" aria-label="Volledig scherm">' + ICON.full + '</button>' +
          '</div></div></div>';
        canvas = dlg.querySelector('.hp-player_canvas');
        video = dlg.querySelector('video');
        line = dlg.querySelector('.hp-player_line');
        prog = dlg.querySelector('.hp-player_prog');
        buf = dlg.querySelector('.hp-player_buf');
        handle = dlg.querySelector('.hp-player_handle');
        tNow = dlg.querySelector('[data-t="now"]');
        tDur = dlg.querySelector('[data-t="dur"]');
        muteBtn = dlg.querySelector('[data-act="mute"]');
        playBtn = dlg.querySelector('[data-act="play"]');
        if (poster) video.poster = poster;
        video.src = src;

        // Status van de speler: idle, loading, playing, paused of ended (CSS toont de juiste knoppen)
        function status(s) {
          canvas.setAttribute('data-status', s);
          var playing = s === 'playing' || s === 'loading';
          playBtn.setAttribute('aria-label', playing ? 'Pauzeren' : 'Afspelen');
          dlg.querySelector('.hp-player_big').setAttribute('aria-label', s === 'ended' ? 'Opnieuw afspelen' : 'Afspelen');
          if (s !== 'playing') showControls();
        }
        video.addEventListener('play', function () { status('loading'); loop(); });
        video.addEventListener('playing', function () { status('playing'); hideSoon(); });
        video.addEventListener('waiting', function () { if (!video.paused) status('loading'); });
        video.addEventListener('pause', function () { if (!video.ended) status('paused'); cancelAnimationFrame(raf); render(); });
        video.addEventListener('ended', function () { status('ended'); cancelAnimationFrame(raf); render(); });
        video.addEventListener('loadedmetadata', function () {
          tDur.textContent = fmt(video.duration);
          line.setAttribute('aria-valuemax', Math.round(video.duration));
          render();
        });
        video.addEventListener('timeupdate', render);
        video.addEventListener('progress', renderBuffered);
        video.addEventListener('volumechange', function () {
          canvas.toggleAttribute('data-muted', video.muted);
          muteBtn.setAttribute('aria-label', video.muted ? 'Geluid aan' : 'Geluid uit');
        });

        // Klik op het beeld: afspelen/pauzeren. Dubbelklik: volledig scherm.
        canvas.addEventListener('click', function (e) {
          var btn = e.target.closest('button');
          if (btn && btn.getAttribute('data-act') === 'mute') { video.muted = !video.muted; return; }
          if (btn && btn.getAttribute('data-act') === 'full') { toggleFull(); return; }
          if (e.target.closest('.hp-player_line')) return;
          if (btn || !e.target.closest('.hp-player_bar')) toggle();
        });
        canvas.addEventListener('dblclick', function (e) {
          if (!e.target.closest('.hp-player_bar')) toggleFull();
        });
        ['pointermove', 'pointerdown', 'focusin'].forEach(function (type) {
          canvas.addEventListener(type, function () { showControls(); hideSoon(); });
        });

        // Tijdlijn: slepen met muis of vinger, of met de pijltjestoetsen
        line.addEventListener('pointerdown', function (e) {
          scrubbing = true;
          line.setPointerCapture(e.pointerId);
          canvas.classList.add('is-scrubbing');
          seekTo(frac(e.clientX));
        });
        line.addEventListener('pointermove', function (e) { if (scrubbing) seekTo(frac(e.clientX)); });
        function endScrub() { scrubbing = false; canvas.classList.remove('is-scrubbing'); }
        line.addEventListener('pointerup', endScrub);
        line.addEventListener('pointercancel', endScrub);
        line.addEventListener('keydown', function (e) {
          var k = e.key;
          if (k === 'ArrowLeft' || k === 'ArrowDown') skip(-5);
          else if (k === 'ArrowRight' || k === 'ArrowUp') skip(5);
          else if (k === 'Home') video.currentTime = 0;
          else if (k === 'End') video.currentTime = video.duration || 0;
          else return;
          e.preventDefault();
          e.stopPropagation();
        });

        // Sneltoetsen in de pop-up
        dlg.addEventListener('keydown', function (e) {
          if (e.target.closest('button') && (e.key === ' ' || e.key === 'Enter')) return;
          var k = e.key.toLowerCase();
          if (k === ' ' || k === 'k') toggle();
          else if (k === 'arrowleft') skip(-5);
          else if (k === 'arrowright') skip(5);
          else if (k === 'm') video.muted = !video.muted;
          else if (k === 'f') toggleFull();
          else return;
          e.preventDefault();
          showControls();
          hideSoon();
        });

        dlg.querySelector('.hp-player_close').addEventListener('click', close);
        dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.classList.contains('hp-player_wrap')) close(); });
        // Esc: eerst onze eigen sluit-animatie in plaats van direct dicht
        dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
        document.body.appendChild(dlg);
      }

      function frac(x) {
        var r = line.getBoundingClientRect();
        return clamp((x - r.left) / r.width);
      }
      function seekTo(f) {
        if (!video.duration) return;
        video.currentTime = f * video.duration;
        render();
      }
      function skip(s) {
        if (!video.duration) return;
        video.currentTime = Math.min(video.duration, Math.max(0, video.currentTime + s));
        render();
      }
      function render() {
        var d = video.duration || 0, t = video.currentTime || 0, f = d ? t / d : 0;
        prog.style.transform = 'scaleX(' + f + ')';
        handle.style.left = (f * 100) + '%';
        tNow.textContent = fmt(t);
        line.setAttribute('aria-valuenow', Math.round(t));
        line.setAttribute('aria-valuetext', fmt(t) + ' van ' + fmt(d));
      }
      function renderBuffered() {
        if (!video.duration || !video.buffered.length) return;
        buf.style.transform = 'scaleX(' + (video.buffered.end(video.buffered.length - 1) / video.duration) + ')';
      }
      function loop() {
        cancelAnimationFrame(raf);
        (function step() {
          render();
          if (!video.paused && !video.ended) raf = requestAnimationFrame(step);
        })();
      }
      function toggle() {
        if (video.paused || video.ended) {
          video.play().catch(function () { canvas.setAttribute('data-status', 'paused'); });
        } else {
          video.pause();
        }
      }
      function showControls() {
        clearTimeout(hideTimer);
        canvas.classList.remove('is-idle');
      }
      function hideSoon() {
        clearTimeout(hideTimer);
        if (video.paused || scrubbing) return;
        // Bediening verdwijnt na even stilstaan, behalve als iemand met het toetsenbord in de balk zit
        hideTimer = setTimeout(function () {
          var a = document.activeElement;
          var keyboardInBar = a && canvas.contains(a) && a.matches(':focus-visible');
          if (!video.paused && !scrubbing && !keyboardInBar) canvas.classList.add('is-idle');
        }, 2400);
      }

      // Volledig scherm op de hele speler (met onze bediening); iPhone gebruikt de eigen video-weergave
      function isFull() { return document.fullscreenElement === canvas || document.webkitFullscreenElement === canvas; }
      function toggleFull() {
        if (isFull()) {
          (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        } else if (canvas.requestFullscreen) {
          canvas.requestFullscreen();
        } else if (canvas.webkitRequestFullscreen) {
          canvas.webkitRequestFullscreen();
        } else if (video.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
        }
      }

      // De kaart groeit uit tot de speler (FLIP) en krimpt bij sluiten terug
      function flip(toCard, done) {
        var a = card.getBoundingClientRect(), b = canvas.getBoundingClientRect();
        var from = { x: a.left - b.left, y: a.top - b.top, scaleX: a.width / b.width, scaleY: a.height / b.height };
        var end = { x: 0, y: 0, scaleX: 1, scaleY: 1 };
        if (reduce || !window.gsap) { done(); return; }
        gsap.fromTo(canvas, toCard ? end : from, Object.assign({}, toCard ? from : end, {
          duration: toCard ? 0.5 : 0.65,
          ease: toCard ? 'power3.inOut' : 'expo.out',
          transformOrigin: '0 0',
          onComplete: done
        }));
      }

      function open() {
        if (busy) return;
        busy = true;
        if (!dlg) build();
        if (window.lenis) window.lenis.stop();
        dlg.showModal();
        card.classList.add('is-lifted');
        requestAnimationFrame(function () { dlg.classList.add('is-open'); });
        flip(false, function () {
          busy = false;
          if (window.gsap) gsap.set(canvas, { clearProps: 'transform' });
          if (video.ended) video.currentTime = 0;
          video.play().catch(function () { canvas.setAttribute('data-status', 'paused'); });
        });
        dlg.querySelector('.hp-player_close').focus({ preventScroll: true });
      }

      function close() {
        if (busy || !dlg || !dlg.open) return;
        busy = true;
        video.pause();
        clearTimeout(hideTimer);
        var finish = function () {
          dlg.classList.remove('is-open');
          dlg.close();
          if (window.gsap) gsap.set(canvas, { clearProps: 'transform' });
          card.classList.remove('is-lifted');
          if (window.lenis) window.lenis.start();
          card.focus({ preventScroll: true });
          busy = false;
        };
        var go = function () {
          dlg.classList.remove('is-open');
          flip(true, finish);
        };
        if (isFull()) {
          (document.exitFullscreen || document.webkitExitFullscreen).call(document);
          setTimeout(go, 250);
        } else {
          go();
        }
      }

      card.addEventListener('click', open);
    }
    document.querySelectorAll('[data-hp-video]').forEach((card) => {
      if (card.hasAttribute('data-hp-video-ready') || card.closest('.w-script')) return;
      card.setAttribute('data-hp-video-ready', '');
      setup(card);
    });
  }

  // ---------- Ga verder als: kaarten met keuzemenu (hp-go) ----------
  // Homepage, Over ons en Onze missie ([data-hpg2], Webflow). Cliënt & naasten en Zorgprofessional
  // (.hpg2-card) openen een menu in de kaart (mobiel: uitklapper eronder); Gemeenten en IT-partner
  // zijn gewone links. Eén kaart tegelijk open; klikken ernaast of Escape sluit.
  function initHpGo() {
    document.querySelectorAll('[data-hpg2]').forEach((grid) => {
      if (grid.hasAttribute('data-hpg2-ready') || grid.closest('.w-script')) return;
      grid.setAttribute('data-hpg2-ready', '');
      const cards = [...grid.querySelectorAll('.hpg2-card')];

      const setOpen = (card, open, focusFirst) => {
        const btn = card.querySelector('.hpg2-trigger');
        card.classList.toggle('is-open', open);
        if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open && focusFirst) {
          setTimeout(() => {
            const first = card.querySelector('a.hpg2-item');
            if (first) first.focus();
          }, 150);
        }
      };

      cards.forEach((card) => {
        const btn = card.querySelector('.hpg2-trigger');
        const menu = card.querySelector('.hpg2-menu');
        if (!btn) return;
        btn.setAttribute('aria-expanded', 'false');
        if (menu && menu.id) btn.setAttribute('aria-controls', menu.id);
        btn.addEventListener('click', (e) => {
          const open = !card.classList.contains('is-open');
          cards.forEach((c) => {
            if (c !== card) setOpen(c, false);
          });
          // Met het toetsenbord (e.detail 0) gaat de focus naar de eerste link
          setOpen(card, open, open && e.detail === 0);
        });
      });

      document.addEventListener('click', (e) => {
        if (!e.target.closest('.hpg2-card')) cards.forEach((c) => setOpen(c, false));
      });
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        const open = grid.querySelector('.hpg2-card.is-open');
        if (!open) return;
        setOpen(open, false);
        open.querySelector('.hpg2-trigger').focus();
      });
    });
  }

  // ---------- Over ons: kaart van Nederland, van 2012 tot nu (oo-map) ----------
  // Het netwerk groeit vanuit Luttenberg (2012) via 2018 naar nu, met "berichtjes" over de lijnen.
  // Kaart, label, tekstblokken (.oo-map_txt) en stappen staan in Webflow ([data-oo-map]); de puntjes
  // en lijnen (SVG) maakt dit script. Per tekstblok: data-count = aantal puntjes, data-hold = ms tot
  // de volgende stap. Speelt af als de kaart voor 60% in beeld is, en opnieuw na helemaal uit beeld.

  // Puntjesraster van Nederland (uit world-atlas, home/over-ons/nl-dots.js), Luttenberg en straal
  const OO_MAP = {"w":1000,"h":1144,"r":9.2,"luttenberg":[785,455],"dots":[[623,0],[887,0],[491,33],[679,33],[717,33],[755,33],[792,33],[830,33],[868,33],[906,33],[434,65],[585,65],[623,65],[660,65],[698,65],[736,65],[774,65],[811,65],[849,65],[887,65],[925,65],[962,65],[566,98],[604,98],[642,98],[679,98],[717,98],[755,98],[792,98],[830,98],[868,98],[906,98],[943,98],[981,98],[396,131],[547,131],[585,131],[623,131],[660,131],[698,131],[736,131],[774,131],[811,131],[849,131],[887,131],[925,131],[962,131],[1000,131],[377,163],[528,163],[566,163],[604,163],[642,163],[679,163],[717,163],[755,163],[792,163],[830,163],[868,163],[906,163],[943,163],[981,163],[358,196],[472,196],[509,196],[547,196],[585,196],[623,196],[660,196],[698,196],[736,196],[774,196],[811,196],[849,196],[887,196],[925,196],[962,196],[1000,196],[415,229],[453,229],[491,229],[528,229],[566,229],[604,229],[642,229],[679,229],[717,229],[755,229],[792,229],[830,229],[868,229],[906,229],[943,229],[981,229],[358,261],[396,261],[434,261],[472,261],[509,261],[547,261],[585,261],[623,261],[660,261],[698,261],[736,261],[774,261],[811,261],[849,261],[887,261],[925,261],[962,261],[340,294],[377,294],[415,294],[453,294],[491,294],[528,294],[566,294],[604,294],[642,294],[679,294],[717,294],[755,294],[792,294],[830,294],[868,294],[906,294],[943,294],[358,327],[396,327],[434,327],[472,327],[509,327],[547,327],[585,327],[623,327],[660,327],[698,327],[736,327],[774,327],[811,327],[849,327],[887,327],[925,327],[962,327],[340,359],[377,359],[415,359],[453,359],[491,359],[528,359],[566,359],[604,359],[642,359],[679,359],[717,359],[755,359],[792,359],[830,359],[868,359],[321,392],[358,392],[396,392],[434,392],[472,392],[509,392],[547,392],[585,392],[623,392],[660,392],[698,392],[736,392],[774,392],[811,392],[849,392],[340,425],[377,425],[415,425],[453,425],[491,425],[528,425],[566,425],[604,425],[642,425],[679,425],[717,425],[755,425],[792,425],[830,425],[868,425],[321,458],[358,458],[396,458],[434,458],[472,458],[509,458],[547,458],[585,458],[623,458],[660,458],[698,458],[736,458],[774,458],[811,458],[849,458],[887,458],[925,458],[962,458],[302,490],[340,490],[377,490],[415,490],[453,490],[491,490],[528,490],[566,490],[604,490],[642,490],[679,490],[717,490],[755,490],[792,490],[830,490],[868,490],[906,490],[943,490],[283,523],[321,523],[358,523],[396,523],[434,523],[472,523],[509,523],[547,523],[585,523],[623,523],[660,523],[698,523],[736,523],[774,523],[811,523],[849,523],[887,523],[925,523],[962,523],[264,556],[302,556],[340,556],[377,556],[415,556],[453,556],[491,556],[528,556],[566,556],[604,556],[642,556],[679,556],[717,556],[755,556],[792,556],[830,556],[868,556],[906,556],[245,588],[283,588],[321,588],[358,588],[396,588],[434,588],[472,588],[509,588],[547,588],[585,588],[623,588],[660,588],[698,588],[736,588],[774,588],[811,588],[849,588],[887,588],[226,621],[264,621],[302,621],[340,621],[377,621],[415,621],[453,621],[491,621],[528,621],[566,621],[604,621],[642,621],[679,621],[717,621],[755,621],[792,621],[830,621],[868,621],[170,654],[208,654],[245,654],[283,654],[321,654],[358,654],[396,654],[434,654],[472,654],[509,654],[547,654],[585,654],[623,654],[660,654],[698,654],[736,654],[774,654],[811,654],[849,654],[887,654],[189,686],[226,686],[264,686],[302,686],[340,686],[377,686],[415,686],[453,686],[491,686],[528,686],[566,686],[604,686],[642,686],[679,686],[717,686],[755,686],[792,686],[830,686],[132,719],[170,719],[208,719],[245,719],[283,719],[321,719],[358,719],[396,719],[434,719],[472,719],[509,719],[547,719],[585,719],[623,719],[660,719],[75,752],[113,752],[151,752],[189,752],[226,752],[264,752],[302,752],[340,752],[377,752],[415,752],[453,752],[491,752],[528,752],[566,752],[604,752],[642,752],[679,752],[132,784],[170,784],[208,784],[245,784],[283,784],[321,784],[358,784],[396,784],[434,784],[472,784],[509,784],[547,784],[585,784],[623,784],[660,784],[698,784],[38,817],[75,817],[113,817],[189,817],[226,817],[264,817],[302,817],[340,817],[377,817],[415,817],[453,817],[491,817],[528,817],[566,817],[604,817],[642,817],[679,817],[717,817],[57,850],[94,850],[132,850],[170,850],[245,850],[283,850],[321,850],[358,850],[396,850],[434,850],[472,850],[509,850],[547,850],[585,850],[623,850],[660,850],[698,850],[736,850],[113,882],[189,882],[226,882],[302,882],[377,882],[415,882],[453,882],[491,882],[528,882],[566,882],[604,882],[642,882],[679,882],[717,882],[19,915],[57,915],[94,915],[132,915],[170,915],[208,915],[472,915],[509,915],[547,915],[585,915],[623,915],[660,915],[698,915],[736,915],[0,948],[113,948],[151,948],[189,948],[491,948],[528,948],[566,948],[604,948],[642,948],[679,948],[717,948],[623,980],[660,980],[698,980],[679,1013],[642,1078],[623,1111],[660,1111],[698,1111],[604,1144],[642,1144],[679,1144]]};
  const OO_MAP_STAGES = [{ count: 7, hold: 5000 }, { count: 48, hold: 5000 }, { count: 150, hold: 0 }];

  function initOoMap() {
    document.querySelectorAll('[data-oo-map]').forEach((root) => {
      if (root.dataset.ooReady || root.closest('.w-script')) return;
      root.dataset.ooReady = '1';
      setupOoMap(root);
    });
  }

  function setupOoMap(root) {
    var NS = 'http://www.w3.org/2000/svg';
    var MAP = OO_MAP;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // De SVG (puntjes, lijnen, berichtjes) komt vóór het label in .oo-map_stage
    var mapStage = root.querySelector('.oo-map_stage');
    var svg = mapStage.querySelector('svg');
    if (!svg) {
      svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'oo-map_svg');
      svg.setAttribute('viewBox', '-40 -40 1080 1224');
      svg.setAttribute('aria-hidden', 'true');
      ['oo-map_lines', 'oo-map_dots', 'oo-map_msgs'].forEach(function (c) {
        var g = document.createElementNS(NS, 'g');
        g.setAttribute('class', c);
        svg.appendChild(g);
      });
      mapStage.insertBefore(svg, mapStage.firstChild);
    }
    var gLines = svg.querySelector('.oo-map_lines'), gDots = svg.querySelector('.oo-map_dots'), gMsgs = svg.querySelector('.oo-map_msgs');
    // De tekstblokken per stap staan in Webflow; aantal puntjes en wachttijd uit data-count / data-hold
    var txts = [].slice.call(root.querySelectorAll('.oo-map_txt'));
    var STAGES = txts.map(function (t, i) {
      var d = OO_MAP_STAGES[i] || OO_MAP_STAGES[OO_MAP_STAGES.length - 1];
      return {
        count: parseInt(t.getAttribute('data-count'), 10) || d.count,
        hold: t.hasAttribute('data-hold') ? parseInt(t.getAttribute('data-hold'), 10) || 0 : d.hold
      };
    });
    if (!STAGES.length) return;
    STAGES[STAGES.length - 1].hold = 0;
    var steps = [].slice.call(root.querySelectorAll('.oo-map_step'));
    var pin = root.querySelector('.oo-map_pin');
    var L = MAP.luttenberg, R = MAP.r;

    // Vaste 'toeval'-reeks, zodat de spreiding bij elk bezoek hetzelfde is
    var seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }

    // Het thuispuntje is het puntje dat het dichtst bij Luttenberg ligt
    var home = 0, best = Infinity;
    MAP.dots.forEach(function (d, i) { var dd = (d[0] - L[0]) * (d[0] - L[0]) + (d[1] - L[1]) * (d[1] - L[1]); if (dd < best) { best = dd; home = i; } });
    var H = MAP.dots[home];

    // Volgorde van groeien: afstand tot thuis met wat ruis, plus een paar vroege sprongen naar andere regio's
    var order = MAP.dots.map(function (d, i) {
      var dist = Math.hypot(d[0] - H[0], d[1] - H[1]);
      var t = i === home ? -1 : dist * (0.35 + rnd() * 1.3);
      if (i !== home && rnd() < 0.12) t *= 0.3;
      if (dist < R * 8) t = dist * 0.05; // 2012: eerst de mensen vlak rond Luttenberg
      return { i: i, t: t };
    }).sort(function (a, b) { return a.t - b.t; }).map(function (o) { return o.i; });

    // Elk nieuw puntje verbindt met het dichtstbijzijnde puntje dat al aan staat
    var parent = {};
    order.forEach(function (idx, k) {
      if (!k) return;
      var d = MAP.dots[idx], bi = order[0], bd = Infinity;
      for (var j = 0; j < k; j++) {
        var e = MAP.dots[order[j]], dd = (d[0] - e[0]) * (d[0] - e[0]) + (d[1] - e[1]) * (d[1] - e[1]);
        if (dd < bd) { bd = dd; bi = order[j]; }
      }
      parent[idx] = bi;
    });

    var dotEls = [], lineEls = {}, rank = {};
    order.forEach(function (idx, k) { rank[idx] = k; });
    MAP.dots.forEach(function (d, i) {
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', d[0]); c.setAttribute('cy', d[1]); c.setAttribute('r', R);
      c.setAttribute('class', 'oo-map_dot');
      gDots.appendChild(c); dotEls[i] = c;
      if (parent[i] !== undefined) {
        var p = MAP.dots[parent[i]], l = document.createElementNS(NS, 'line');
        l.setAttribute('x1', p[0]); l.setAttribute('y1', p[1]); l.setAttribute('x2', d[0]); l.setAttribute('y2', d[1]);
        l.setAttribute('pathLength', '1'); l.setAttribute('class', 'oo-map_line');
        gLines.appendChild(l); lineEls[i] = l;
      }
    });
    // Thuis: twee pulserende ringen met een puntje erop
    [2, 1].forEach(function (n) {
      var ring = document.createElementNS(NS, 'circle');
      ring.setAttribute('cx', H[0]); ring.setAttribute('cy', H[1]); ring.setAttribute('r', R * 2);
      ring.setAttribute('class', 'oo-map_ring' + (n === 2 ? ' is-2' : ''));
      gMsgs.appendChild(ring);
    });
    var hc = document.createElementNS(NS, 'circle');
    hc.setAttribute('cx', H[0]); hc.setAttribute('cy', H[1]); hc.setAttribute('r', R * 1.45); hc.setAttribute('class', 'oo-map_home');
    gMsgs.appendChild(hc);
    pin.style.left = ((H[0] + 40) / 1080 * 100) + '%';
    pin.style.top = ((H[1] + 40) / 1224 * 100) + '%';

    var lit = 0, stage = -1, timer = null, playing = false, msgTimer = null;

    var pending = [];
    function turn(idx, on, animate) {
      dotEls[idx].classList.toggle('is-instant', !animate);
      dotEls[idx].classList.toggle('is-on', on);
      if (lineEls[idx]) { lineEls[idx].classList.toggle('is-instant', !animate); lineEls[idx].classList.toggle('is-on', on); }
    }
    function light(count, animate) {
      pending.forEach(clearTimeout); pending = [];
      var from = lit, span = Math.max(1, count - from);
      order.forEach(function (idx, k) {
        if (k >= count) { turn(idx, false, false); return; }
        if (k < from) { turn(idx, true, false); return; }
        if (!animate) { turn(idx, true, false); return; }
        pending.push(setTimeout(turn, Math.round((k - from) / span * 2200), idx, true, true));
      });
      lit = count;
    }

    function setText(n) {
      txts.forEach(function (t, k) {
        t.classList.toggle('is-active', k === n);
        t.setAttribute('aria-hidden', k === n ? 'false' : 'true');
      });
    }

    function setSteps(n, holdMs) {
      steps.forEach(function (li, k) {
        li.classList.toggle('is-active', k === n);
        li.classList.toggle('is-past', k < n);
        var f = li.querySelector('.oo-map_fill');
        f.style.transition = 'none';
        f.style.transform = k < n ? 'scaleX(1)' : 'scaleX(0)';
        if (k === n) {
          void f.offsetWidth;
          if (holdMs) { f.style.transition = 'transform ' + holdMs + 'ms linear'; f.style.transform = 'scaleX(1)'; }
          else f.style.transform = 'scaleX(1)';
        }
      });
    }

    function go(n, animate) {
      clearTimeout(timer);
      var s = STAGES[n];
      if (n !== stage) setText(n);
      stage = n;
      light(s.count, animate);
      setSteps(n, playing && animate ? s.hold : 0);
      if (playing && s.hold) timer = setTimeout(function () { go(n + 1, true); }, s.hold);
      else playing = false;
    }

    // Kleine berichtjes die over het netwerk reizen zodra het gegroeid is
    function sendMessage() {
      if (document.hidden || lit < 8) return;
      var k = 1 + Math.floor(rnd() * (lit - 1)), idx = order[k], line = lineEls[idx];
      if (!line) return;
      var a = MAP.dots[parent[idx]], b = MAP.dots[idx];
      if (rnd() < 0.5) { var t = a; a = b; b = t; }
      var m = document.createElementNS(NS, 'circle');
      m.setAttribute('r', R * 0.55); m.setAttribute('class', 'oo-map_msg');
      gMsgs.insertBefore(m, gMsgs.firstChild);
      var t0 = performance.now(), dur = 900;
      (function step(now) {
        var p = Math.min(1, (now - t0) / dur), e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        m.setAttribute('cx', a[0] + (b[0] - a[0]) * e); m.setAttribute('cy', a[1] + (b[1] - a[1]) * e);
        m.setAttribute('opacity', p < .15 ? p / .15 : p > .85 ? (1 - p) / .15 : 1);
        if (p < 1) requestAnimationFrame(step); else m.remove();
      })(t0);
    }

    var started = false;
    steps.forEach(function (li, k) {
      li.querySelector('button').addEventListener('click', function () { started = true; playing = !reduce; go(k, !reduce); });
    });

    if (reduce) { go(STAGES.length - 1, false); return; }

    // Terug naar 2012, zodat het hele verhaal bij een volgend bezoek opnieuw speelt
    function reset() {
      clearTimeout(timer); pending.forEach(clearTimeout); pending = [];
      playing = false; started = false; stage = -1; lit = 0;
      order.forEach(function (idx) { turn(idx, false, false); });
      setText(0);
      setSteps(-1, 0);
    }

    // Afspelen als de kaart voor 60% in beeld is; terugzetten als hij helemaal uit beeld is
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          if (!msgTimer) msgTimer = setInterval(sendMessage, 420);
          if (!started && en.intersectionRatio >= 0.6) { started = true; playing = true; go(0, true); }
        } else {
          if (msgTimer) { clearInterval(msgTimer); msgTimer = null; }
          if (started) reset();
        }
      });
    }, { threshold: [0, 0.6] });
    io.observe(root);
  }

  // ---------- Start ----------

  function init() {
    if (window.gsap && window.Observer && window.ScrollTrigger) {
      gsap.registerPlugin(Observer, ScrollTrigger);
    }

    // Elk onderdeel apart: een fout in het ene stopt de rest niet (namen blijven leesbaar na minify)
    const parts = {
      initLenis,
      initCopyrightYear,
      initFinsweet,
      initFreshchat,
      initFloatLabels,
      initSliders,
      initVideoButtons,
      initLightboxLabels,
      initSearchTerm,
      initNavScroll,
      initMegaNavDirectionalHover,
      initMegaNavImages,
      initSearchToggle,
      initAdvancedFormValidation,
      initVimeoBackground,
      initHeroWave,
      initBlobMorph,
      initNumberOdometer,
      initWavyMarquee,
      initDgTabs,
      initDgTestimonials,
      initAccordionCSS,
      initVideoPopup,
      initLapostaForms,
      initHpStory,
      initHpWhy,
      initHpVideo,
      initHpGo,
      initOoMap,
    };
    Object.keys(parts).forEach((name) => {
      try {
        parts[name]();
      } catch (err) {
        console.error('[OZO] ' + name, err);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
