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
    fsFormsubmit: 'https://cdn.jsdelivr.net/npm/@finsweet/attributes-formsubmit@1/formsubmit.js'
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

  // Menu schuift weg bij naar beneden scrollen, komt terug bij omhoog scrollen (desktop)
  function initNavScroll() {
    const navMenu = document.querySelector('#NAVMENU');
    if (!navMenu || !window.gsap) return;
    let lastScrollTop = 0; // Tracks the previous scroll position
    const scrollThreshold = 28; // Minimum scroll difference to trigger the animation
    window.addEventListener('scroll', function () {
      if (window.innerWidth <= 991) return; // Disabled on mobile/tablet
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      // Calculate the scroll difference
      const scrollDelta = Math.abs(currentScroll - lastScrollTop);
      // Only trigger animation if the scroll difference is greater than the threshold
      if (scrollDelta > scrollThreshold) {
        if (currentScroll > lastScrollTop) {
          // Scroll Down: Move NAVMENU up
          gsap.to(navMenu, { y: -150, duration: 0.7, ease: 'power2.out' });
        } else {
          // Scroll Up: Move NAVMENU back to its original position
          gsap.to(navMenu, { y: 0, duration: 0.7, ease: 'power2.out' });
        }
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Update lastScrollTop
      }
    });
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

        // Scroll-based autoplay
        function checkVisibility() {
          const rect = vimeoElement.getBoundingClientRect();
          const inView = rect.top < window.innerHeight && rect.bottom > 0;
          inView ? vimeoPlayerPlay() : vimeoPlayerPause();
        }

        // Autoplay
        if (vimeoElement.getAttribute("data-vimeo-autoplay") === "false") {
          player.pause();
        } else if (vimeoElement.getAttribute("data-vimeo-paused-by-user") === "false") {
          checkVisibility();
          window.addEventListener("scroll", checkVisibility);
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
              window.removeEventListener("scroll", checkVisibility);
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
        // [min-breedte, snelheid-schaal, golflengte-schaal]
        [992, 1, 1],
        [768, 0.75, 1],
        [480, 0.6, 0.75],
        [0, 0.5, 0.75]
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
      let [speedScale, waveScale] = getViewport();

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
        waveLength = Math.max(container.offsetWidth, averageWidth * itemsPerWave) * waveScale;

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

          const phase = itemX / waveLength * fullCircle + phaseTravel;
          item._setY(Math.sin(phase) * item._height * dynamicWaveY);
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
        [speedScale, waveScale] = getViewport();
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


  // Laposta: custom formulier ([data-laposta-wrap]) versturen zoals Laposta's eigen validate.js:
  // eenmalig token + rekenpuzzel (spambeveiliging), dan een gewone formulierpost in een verborgen iframe.
  // Laposta stuurt bij een gelukte aanmelding door naar "next" (een adres op onze eigen site);
  // komt het iframe daar uit, dan tonen we [data-laposta-success], anders [data-laposta-error].
  // Vervangt het oude iframe-script in Site settings → Footer.

  const LAPOSTA_DEBUG = false; // op true zetten om de stappen in de console te zien

  const LAPOSTA_TEXT = {
    loading: 'Bezig…',
    invalid: 'Vul je e-mailadres in en kies wie je bent.',
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

      // Capture + stopImmediatePropagation: oude submit-handlers (iframe-script) draaien niet mee
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (busy) return;
        hide(error);

        // Valideren via initAdvancedFormValidation (TESTCODE)
        if (typeof form.__validate === 'function' && !form.__validate()) {
          lapostaLog('Niet verstuurd: e-mail of rol niet goed ingevuld');
          showError(LAPOSTA_TEXT.invalid);
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
      initSearchToggle,
      initAdvancedFormValidation,
      initVimeoBackground,
      initHeroWave,
      initNumberOdometer,
      initWavyMarquee,
      initLapostaForms,
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
