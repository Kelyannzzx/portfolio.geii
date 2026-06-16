document.addEventListener("DOMContentLoaded", () => {
  const revealPageContent = () => {};

  const splash = document.querySelector(".splash");
  if (splash) {
    const titleEl = splash.querySelector(".splash-title");
    const pageTitle = document.body.dataset.pageTitle || document.title || "Portfolio";
    let splashTimeoutId = null;
    let splashHidden = false;
    let splashCleanupId = null;

    const cleanupSplash = () => {
      window.removeEventListener("keydown", handleSplashSkip, true);
      document.removeEventListener("keydown", handleSplashSkip);
      document.removeEventListener("pointerdown", handleSplashSkip);
      if (splashTimeoutId) {
        window.clearTimeout(splashTimeoutId);
      }
      if (splashCleanupId) {
        window.clearTimeout(splashCleanupId);
      }
      splash.remove();
      revealPageContent();
    };

    const hideSplash = immediate => {
      if (splashHidden) return;
      splashHidden = true;
      splash.style.animation = "none";
      if (immediate) {
        splash.classList.add("skip");
      }
      splash.classList.add("hide");
      splashCleanupId = window.setTimeout(cleanupSplash, immediate ? 0 : 180);
    };

    const handleSplashSkip = event => {
      if (event.type === "keydown" && event.repeat) return;
      hideSplash(true);
    };

    if (titleEl) titleEl.textContent = pageTitle;
    window.addEventListener("keydown", handleSplashSkip, true);
    document.addEventListener("keydown", handleSplashSkip);
    document.addEventListener("pointerdown", handleSplashSkip);
    splashTimeoutId = window.setTimeout(() => {
      hideSplash(false);
    }, 3000);
  } else {
    revealPageContent();
  }

  const nav = document.querySelector(".nav");
  const reveals = document.querySelectorAll(".reveal");
  const aboutTrigger = document.querySelector(".about-trigger");
  const aboutModal = document.getElementById("about-modal");
  const closeModalBtn = aboutModal?.querySelector(".modal-close");
  const modalBackdrop = aboutModal?.querySelector(".modal-backdrop");
  const skillsModal = document.getElementById("skills-modal");
  const skillsTitle = document.getElementById("skills-modal-title");
  const skillsBody = document.getElementById("skills-modal-body");
  const skillsCloseBtn = skillsModal?.querySelector(".modal-close");
  const skillsBackdrop = skillsModal?.querySelector(".modal-backdrop");
  const skillCards = document.querySelectorAll(".skill-card");
  const logo = document.querySelector(".logo");
  const homePortalTrigger = document.querySelector(".home-portal-trigger");
  const homeNameParts = document.querySelectorAll(".home-name-part");
  const homeThemeHub = document.getElementById("home-theme-hub");
  const homeThemeBackdrop = document.querySelector(".home-theme-backdrop");
  const projectLinks = document.querySelectorAll(".project-nav-card");
  let homePortalState = "closed";

  const handleScroll = () => {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 18);
  };

  handleScroll();
  window.addEventListener("scroll", handleScroll);

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: "0px 0px -10% 0px" }
  );

  reveals.forEach(el => observer.observe(el));

  // Expériences scroll reveal
  const expItems = document.querySelectorAll(".exp-item");
  if (expItems.length) {
    const expObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add("exp-visible");
          else entry.target.classList.remove("exp-visible");
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    expItems.forEach((item, i) => {
      item.style.transitionDelay = `${i * 100}ms`;
      expObserver.observe(item);
    });
  }

  // Timeline scroll reveal — re-joue à chaque passage
  const tlItems = document.querySelectorAll(".tl-item");
  if (tlItems.length) {
    const tlObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("tl-visible");
          } else {
            entry.target.classList.remove("tl-visible");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    tlItems.forEach((item, i) => {
      item.style.transitionDelay = `${i * 80}ms`;
      tlObserver.observe(item);
    });
  }

  document.querySelectorAll(".btn").forEach(btn => {
    btn.addEventListener("pointerdown", e => {
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    });
  });

  const interactiveCards = document.querySelectorAll(".interactive-card");
  interactiveCards.forEach(card => {
    let raf = null;

    const reset = () => {
      card.style.transform = "";
      raf = null;
    };

    const update = e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rotateX = (-y * 10).toFixed(2);
      const rotateY = (x * 10).toFixed(2);
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
      raf = null;
    };

    card.addEventListener("pointermove", e => {
      if (raf) return;
      raf = requestAnimationFrame(() => update(e));
    });

    card.addEventListener("pointerleave", () => {
      reset();
    });

  });

  const openModal = () => {
    if (!aboutModal) return;
    aboutModal.classList.add("open");
    aboutModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("lock-scroll");
  };

  const closeModal = () => {
    if (!aboutModal) return;
    aboutModal.classList.remove("open");
    aboutModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lock-scroll");
  };

  aboutTrigger?.addEventListener("click", openModal);
  closeModalBtn?.addEventListener("click", closeModal);
  modalBackdrop?.addEventListener("click", closeModal);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && aboutModal?.classList.contains("open")) {
      closeModal();
    }
  });

  const openSkillsModal = card => {
    if (!skillsModal || !skillsTitle || !skillsBody) return;
    const title = card.querySelector("h3")?.textContent || "Compétence";
    const content = card.querySelector(".skill-content")?.innerHTML || "";
    skillsTitle.textContent = title;
    skillsBody.innerHTML = content;
    skillsModal.classList.add("open");
    skillsModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("lock-scroll");
  };

  const closeSkillsModal = () => {
    if (!skillsModal) return;
    skillsModal.classList.remove("open");
    skillsModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lock-scroll");
  };

  skillCards.forEach(card => {
    card.addEventListener("click", () => openSkillsModal(card));
  });

  skillsCloseBtn?.addEventListener("click", closeSkillsModal);
  skillsBackdrop?.addEventListener("click", closeSkillsModal);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && skillsModal?.classList.contains("open")) {
      closeSkillsModal();
    }
  });

  const spawnFirework = (x, y) => {
    const burst = document.createElement("div");
    burst.className = "firework";
    burst.style.left = `${x}px`;
    burst.style.top = `${y}px`;

    const count = 14;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement("span");
      dot.className = "firework-dot";
      const angle = (Math.PI * 2 * i) / count;
      const radius = 70 + Math.random() * 30;
      dot.style.setProperty("--tx", `${Math.cos(angle) * radius}px`);
      dot.style.setProperty("--ty", `${Math.sin(angle) * radius}px`);
      dot.style.setProperty("--hue", `${200 + Math.random() * 80}`);
      burst.appendChild(dot);
    }

    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 750);
  };

  logo?.addEventListener("click", e => {
    const x = e.clientX;
    const y = e.clientY;
    spawnFirework(x, y);
  });

  const openHomePortal = () => {
    if (!homePortalTrigger || !homeThemeHub || homePortalState !== "closed") return;

    const triggerRect = homePortalTrigger.getBoundingClientRect();
    const leftPart = homeNameParts[0]?.getBoundingClientRect();
    const rightPart = homeNameParts[1]?.getBoundingClientRect();
    const focusX = leftPart && rightPart
      ? (leftPart.right + rightPart.left) / 2
      : triggerRect.left + triggerRect.width / 2;
    const focusY = leftPart && rightPart
      ? (leftPart.top + leftPart.height / 2 + rightPart.top + rightPart.height / 2) / 2
      : triggerRect.top + triggerRect.height / 2;
    const originX = ((focusX - triggerRect.left) / triggerRect.width) * 100;
    const originY = ((focusY - triggerRect.top) / triggerRect.height) * 100;

    homePortalTrigger.style.setProperty("--portal-origin-x", `${originX}%`);
    homePortalTrigger.style.setProperty("--portal-origin-y", `${originY}%`);
    document.body.style.setProperty("--portal-focus-x", `${focusX}px`);
    document.body.style.setProperty("--portal-focus-y", `${focusY}px`);

    homePortalState = "opening";
    homeThemeHub.classList.add("active");
    homeThemeHub.setAttribute("aria-hidden", "false");
    homePortalTrigger.setAttribute("aria-expanded", "true");
    document.body.classList.add("home-portal-opening", "lock-scroll");

    window.setTimeout(() => {
      document.body.classList.add("home-portal-open");
      homePortalState = "open";
    }, 420);
  };

  const closeHomePortal = () => {
    if (!homeThemeHub || homePortalState === "closed") return;

    homePortalState = "closing";
    document.body.classList.remove("home-portal-open");
    homePortalTrigger?.setAttribute("aria-expanded", "false");

    window.setTimeout(() => {
      homeThemeHub.classList.remove("active");
      homeThemeHub.setAttribute("aria-hidden", "true");
      document.body.classList.remove("home-portal-opening", "lock-scroll");
      homePortalState = "closed";
    }, 260);
  };

  homePortalTrigger?.addEventListener("click", openHomePortal);
  homePortalTrigger?.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openHomePortal();
  });

  homeThemeBackdrop?.addEventListener("click", closeHomePortal);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && homePortalState === "open") {
      closeHomePortal();
    }
  });

  // Lightbox zoom sur images zoomables
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.innerHTML = `<div class="lightbox-bd"></div><div class="lightbox-box"><img class="lightbox-img" src="" alt=""><button class="lightbox-cl" aria-label="Fermer">✕</button></div>`;
  document.body.appendChild(lightbox);
  const lbImg = lightbox.querySelector(".lightbox-img");
  const closeLb = () => { lightbox.classList.remove("open"); document.body.classList.remove("lock-scroll"); };
  lightbox.querySelector(".lightbox-bd").addEventListener("click", closeLb);
  lightbox.querySelector(".lightbox-cl").addEventListener("click", closeLb);
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeLb(); });

  document.querySelectorAll(".proj-zoomable").forEach(img => {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", () => {
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lightbox.classList.add("open");
      document.body.classList.add("lock-scroll");
    });
  });

  // Bascule thème clair / sombre (persisté)
  const root = document.documentElement;
  const themeBtn = document.createElement("button");
  themeBtn.className = "theme-toggle";
  themeBtn.type = "button";
  themeBtn.setAttribute("aria-label", "Basculer le mode sombre");
  const syncThemeBtn = () => {
    const dark = root.getAttribute("data-theme") === "dark";
    themeBtn.textContent = dark ? "☀" : "☾";
    themeBtn.title = dark ? "Passer en mode clair" : "Passer en mode sombre";
  };
  syncThemeBtn();
  themeBtn.addEventListener("click", () => {
    const dark = root.getAttribute("data-theme") === "dark";
    if (dark) root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", "dark");
    try { localStorage.setItem("theme", dark ? "light" : "dark"); } catch (e) {}
    syncThemeBtn();
  });
  document.body.appendChild(themeBtn);

  // Menu mobile (burger)
  const navEl = document.querySelector(".nav");
  const navLinksEl = navEl?.querySelector(".nav-links");
  if (navEl && navLinksEl) {
    const burger = document.createElement("button");
    burger.className = "nav-burger";
    burger.type = "button";
    burger.setAttribute("aria-label", "Ouvrir le menu");
    burger.setAttribute("aria-expanded", "false");
    burger.innerHTML = "<span></span>";
    navEl.insertBefore(burger, navLinksEl);
    burger.addEventListener("click", () => {
      const open = navEl.classList.toggle("nav-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    });
    navLinksEl.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        navEl.classList.remove("nav-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }
});
