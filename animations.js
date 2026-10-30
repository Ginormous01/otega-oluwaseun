const motionPreference = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
);
const root = document.documentElement;
const menuButton = document.querySelector(".menu-toggle");
const siteHeader = document.querySelector(".site-header");
const mainNavigation = document.querySelector(".main-nav");
const compactNavigation = window.matchMedia("(max-width: 1040px)");
let progressFrame = 0;

const revealAll = () => {
  root.classList.remove("motion-ready");
  document.querySelectorAll("[data-reveal]").forEach((element) => {
    element.classList.add("is-visible");
  });
};

const setMenuOpen = (isOpen) => {
  if (!menuButton || !siteHeader) return;

  siteHeader.classList.toggle("is-menu-open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute(
    "aria-label",
    isOpen ? "Close navigation menu" : "Open navigation menu",
  );
};

const updateReadingProgress = () => {
  progressFrame = 0;
  const scrollableHeight =
    document.documentElement.scrollHeight - window.innerHeight;
  const progress =
    scrollableHeight > 0
      ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight))
      : 0;
  const progressBar = document.querySelector(".reading-progress");

  root.style.setProperty("--reading-progress", String(progress));
  progressBar?.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
};

const scheduleProgressUpdate = () => {
  if (progressFrame) return;
  progressFrame = window.requestAnimationFrame(updateReadingProgress);
};

const revealHashTarget = () => {
  const target = document.getElementById(window.location.hash.slice(1));
  if (!target) return;

  const section = target.closest("section") || target;
  const revealTargets = [
    ...(section.matches("[data-reveal]") ? [section] : []),
    ...section.querySelectorAll("[data-reveal]"),
  ];

  revealTargets.forEach((element) => {
    element.classList.add("is-visible");
  });
};

if (motionPreference.matches || !("IntersectionObserver" in window)) {
  revealAll();
} else {
  root.classList.add("motion-ready");

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -48px 0px",
    },
  );

  document.querySelectorAll("[data-reveal]").forEach((element, index) => {
    element.style.setProperty("--reveal-order", index % 4);
    revealObserver.observe(element);
  });
}

document.querySelectorAll(".insight-card").forEach((element, index) => {
  element.style.setProperty("--card-order", index);
});

menuButton?.addEventListener("click", () => {
  setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
});

mainNavigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuOpen(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenuOpen(false);
});

document.addEventListener("pointerdown", (event) => {
  if (
    siteHeader?.classList.contains("is-menu-open") &&
    !siteHeader.contains(event.target)
  ) {
    setMenuOpen(false);
  }
});

window.addEventListener("scroll", scheduleProgressUpdate, { passive: true });
window.addEventListener("resize", scheduleProgressUpdate);
window.addEventListener("load", scheduleProgressUpdate, { once: true });
window.addEventListener("hashchange", revealHashTarget);
window.requestAnimationFrame(revealHashTarget);
scheduleProgressUpdate();

const handleNavigationBreakpointChange = (event) => {
  if (!event.matches) setMenuOpen(false);
};

if (compactNavigation.addEventListener) {
  compactNavigation.addEventListener(
    "change",
    handleNavigationBreakpointChange,
  );
} else {
  compactNavigation.addListener(handleNavigationBreakpointChange);
}

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        document
          .querySelectorAll('.main-nav a[href^="#"]')
          .forEach((link) => {
            if (link.hash === `#${entry.target.id}`) {
              link.setAttribute("aria-current", "location");
            } else {
              link.removeAttribute("aria-current");
            }
          });
      });
    },
    {
      rootMargin: "-25% 0px -65% 0px",
      threshold: 0,
    },
  );

  document.querySelectorAll("main > section[id]").forEach((section) => {
    sectionObserver.observe(section);
  });
}

const handleMotionPreferenceChange = (event) => {
  if (event.matches) revealAll();
};

if (motionPreference.addEventListener) {
  motionPreference.addEventListener("change", handleMotionPreferenceChange);
} else {
  motionPreference.addListener(handleMotionPreferenceChange);
}
