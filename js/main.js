/* ============================================================
   TRIPLEGLOW HOUSEKEEPING SERVICES — SHARED SCRIPT
   Nav toggle, scroll reveal + stagger, hero/banner entrance,
   animated counters, magnetic buttons, card tilt, scroll
   progress, process-line draw, gallery filters + lightbox,
   page transitions.
   ============================================================ */

(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- Mobile navigation ---------- */
  var hamburger = document.querySelector(".hamburger");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (hamburger && mobilePanel) {
    hamburger.addEventListener("click", function () {
      var isOpen = mobilePanel.classList.toggle("open");
      hamburger.classList.toggle("open", isOpen);
      hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.classList.toggle("nav-open", isOpen);
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    mobilePanel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobilePanel.classList.remove("open");
        hamburger.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
        document.body.style.overflow = "";
      });
    });

    document.addEventListener("click", function (e) {
      if (!mobilePanel.classList.contains("open")) return;
      if (mobilePanel.contains(e.target) || hamburger.contains(e.target)) return;
      mobilePanel.classList.remove("open");
      hamburger.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
      document.body.style.overflow = "";
    });
  }

  /* ---------- Scroll reveal (with per-group stagger) ---------- */
  var revealEls = document.querySelectorAll(".reveal");

  if (revealEls.length) {
    var groupCounts = new Map();
    revealEls.forEach(function (el) {
      var parent = el.parentElement;
      var count = groupCounts.get(parent) || 0;
      var delay = Math.min(count, 5) * 90;
      el.style.setProperty("--reveal-delay", delay + "ms");
      groupCounts.set(parent, count + 1);
    });
  }

  if ("IntersectionObserver" in window && revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* ---------- Process line draw-in ---------- */
  var processStrip = document.querySelector(".process-strip");
  if (processStrip && "IntersectionObserver" in window) {
    var stripObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            stripObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    stripObserver.observe(processStrip);
  } else if (processStrip) {
    processStrip.classList.add("in");
  }

  /* ---------- Orchestrated hero / page-banner entrance ---------- */
  var entranceSequence = [
    { selector: ".hero-badge", delay: 60 },
    { selector: ".hero h1", delay: 180 },
    { selector: ".hero p.lead", delay: 300 },
    { selector: ".hero-photo", delay: 220 },
    { selector: ".hero-actions", delay: 420 },
    { selector: ".hero-stats", delay: 540 },
    { selector: ".hero-float-card", delay: 680 },
    { selector: ".page-banner .breadcrumb", delay: 60 },
    { selector: ".page-banner h1", delay: 180 },
    { selector: ".page-banner p", delay: 300 }
  ];

  entranceSequence.forEach(function (item) {
    var el = document.querySelector(item.selector);
    if (!el) return;
    if (reducedMotion) {
      el.classList.add("in");
    } else {
      window.setTimeout(function () {
        el.classList.add("in");
      }, item.delay);
    }
  });

  /* ---------- Animated hero stat counters ---------- */
  function animateCounter(el) {
    var text = el.textContent.trim();
    var match = text.match(/^(\d+)(.*)$/);
    if (!match) return;
    var target = parseInt(match[1], 10);
    var suffix = match[2];
    if (reducedMotion) return;

    var duration = 1100;
    var start = null;
    el.textContent = "0" + suffix;

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }
    window.requestAnimationFrame(step);
  }

  var statEls = document.querySelectorAll(".hero-stats strong");
  if (statEls.length) {
    window.setTimeout(function () {
      statEls.forEach(animateCounter);
    }, 540);
  }

  /* ---------- WhatsApp float entrance ---------- */
  var waFloat = document.querySelector(".wa-float");
  if (waFloat) {
    if (reducedMotion) {
      waFloat.classList.add("in");
    } else {
      window.setTimeout(function () {
        waFloat.classList.add("in");
      }, 1300);
    }
  }

  /* ---------- Magnetic buttons (desktop only) ---------- */
  if (finePointer && !reducedMotion) {
    document.querySelectorAll(".btn").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = "translate(" + (x * 0.16).toFixed(1) + "px," + (y * 0.35 - 1).toFixed(1) + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "";
      });
    });
  }

  /* ---------- Card tilt (desktop only) ---------- */
  if (finePointer && !reducedMotion) {
    document.querySelectorAll(".card, .testi-card, .gallery-item").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "perspective(700px) rotateX(" + (py * -5).toFixed(2) + "deg) rotateY(" +
          (px * 5).toFixed(2) + "deg) translateY(-5px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* ---------- Scroll progress bar ---------- */
  var progressBar = document.createElement("div");
  progressBar.className = "scroll-progress";
  document.body.appendChild(progressBar);
  function updateProgress() {
    var docEl = document.documentElement;
    var scrollTop = docEl.scrollTop || document.body.scrollTop;
    var scrollHeight = (docEl.scrollHeight || document.body.scrollHeight) - docEl.clientHeight;
    var pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = pct + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  /* ---------- Header shadow on scroll ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var applyHeaderShadow = function () {
      header.classList.toggle("scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", applyHeaderShadow, { passive: true });
    applyHeaderShadow();
  }

  /* ---------- Before/After comparison slider ---------- */
  function initBASlider(frame) {
    if (!frame || frame.dataset.baInit) return;
    frame.dataset.baInit = "1";

    var dragging = false;
    var dragged = false;
    var startX = 0;
    var startY = 0;

    function setPos(clientX) {
      var rect = frame.getBoundingClientRect();
      if (!rect.width) return;
      var pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      frame.style.setProperty("--ba-pos", pct + "%");
      frame.setAttribute("aria-valuenow", Math.round(pct));
    }

    frame.addEventListener("pointerdown", function (e) {
      dragging = true;
      dragged = false;
      startX = e.clientX;
      startY = e.clientY;
      if (frame.setPointerCapture) {
        try { frame.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
      }
      setPos(e.clientX);
    });

    frame.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      if (Math.abs(e.clientX - startX) > 3 || Math.abs(e.clientY - startY) > 3) {
        dragged = true;
      }
      setPos(e.clientX);
    });

    function endDrag() { dragging = false; }
    frame.addEventListener("pointerup", endDrag);
    frame.addEventListener("pointercancel", endDrag);

    /* Prevent a drag from also being read as a "click" that opens the lightbox */
    frame.addEventListener("click", function (e) {
      if (dragged) {
        e.stopPropagation();
        dragged = false;
      }
    });

    frame.addEventListener("keydown", function (e) {
      var current = parseFloat(frame.style.getPropertyValue("--ba-pos")) || 50;
      if (e.key === "ArrowLeft") {
        current = Math.max(0, current - 5);
        frame.style.setProperty("--ba-pos", current + "%");
        frame.setAttribute("aria-valuenow", Math.round(current));
        e.preventDefault();
        e.stopPropagation();
      } else if (e.key === "ArrowRight") {
        current = Math.min(100, current + 5);
        frame.style.setProperty("--ba-pos", current + "%");
        frame.setAttribute("aria-valuenow", Math.round(current));
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }

  document.querySelectorAll(".ba-frame").forEach(initBASlider);

  /* ---------- FAQ accordion ---------- */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    var question = item.querySelector(".faq-question");
    var answer = item.querySelector(".faq-answer");
    if (!question || !answer) return;

    question.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");

      faqItems.forEach(function (other) {
        if (other === item) return;
        other.classList.remove("open");
        other.querySelector(".faq-question").setAttribute("aria-expanded", "false");
        other.querySelector(".faq-answer").style.maxHeight = null;
      });

      if (isOpen) {
        item.classList.remove("open");
        question.setAttribute("aria-expanded", "false");
        answer.style.maxHeight = null;
      } else {
        item.classList.add("open");
        question.setAttribute("aria-expanded", "true");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  /* ---------- Gallery filters ---------- */
  var filterBtns = document.querySelectorAll(".filter-btn");
  var galleryItems = document.querySelectorAll(".gallery-item");

  if (filterBtns.length && galleryItems.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) {
          b.classList.remove("active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");

        var category = btn.getAttribute("data-filter");
        galleryItems.forEach(function (item) {
          var match = category === "all" || item.getAttribute("data-category") === category;
          item.style.display = match ? "" : "none";
        });
      });
    });
  }

  /* ---------- Gallery lightbox ---------- */
  var lightbox = document.querySelector(".lightbox");
  if (lightbox && galleryItems.length) {
    var visibleItems = function () {
      return Array.prototype.slice.call(galleryItems);
    };
    var currentIndex = 0;

    var lbVisual = lightbox.querySelector(".lightbox-visual");
    var lbTitle = lightbox.querySelector(".lightbox-caption h3");
    var lbDesc = lightbox.querySelector(".lightbox-caption p");
    var closeBtn = lightbox.querySelector(".lightbox-close");
    var prevBtn = lightbox.querySelector(".lightbox-prev");
    var nextBtn = lightbox.querySelector(".lightbox-next");

    function applyItem(item, index) {
      var title = item.getAttribute("data-title") || "";
      var desc = item.getAttribute("data-desc") || "";
      var sourceFrame = item.querySelector(".ba-frame");
      lbVisual.innerHTML = "";
      if (sourceFrame) {
        var clone = sourceFrame.cloneNode(true);
        clone.removeAttribute("data-ba-init");
        clone.style.setProperty("--ba-pos", "50%");
        clone.setAttribute("aria-valuenow", "50");
        lbVisual.appendChild(clone);
        initBASlider(clone);
      }
      lbTitle.textContent = title;
      lbDesc.textContent = desc;
      currentIndex = index;
    }

    function renderItem(index, animate) {
      var items = visibleItems();
      var item = items[index];
      if (!item) return;

      if (animate && !reducedMotion) {
        lbVisual.classList.add("switching");
        window.setTimeout(function () {
          applyItem(item, index);
          requestAnimationFrame(function () {
            lbVisual.classList.remove("switching");
          });
        }, 160);
      } else {
        applyItem(item, index);
      }
    }

    function openLightbox(index) {
      renderItem(index, false);
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    galleryItems.forEach(function (item, index) {
      item.addEventListener("click", function () {
        openLightbox(index);
      });
      item.setAttribute("tabindex", "0");
      item.setAttribute("role", "button");
      item.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(index);
        }
      });
    });

    closeBtn.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    prevBtn.addEventListener("click", function () {
      var items = visibleItems();
      var next = (currentIndex - 1 + items.length) % items.length;
      renderItem(next, true);
    });
    nextBtn.addEventListener("click", function () {
      var items = visibleItems();
      var next = (currentIndex + 1) % items.length;
      renderItem(next, true);
    });

    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextBtn.click();
      if (e.key === "ArrowLeft") prevBtn.click();
    });
  }

  /* ---------- Smooth page-to-page transition (gate close) ---------- */
  if (!reducedMotion) {
    var pageGate = document.querySelector(".page-gate");

    document.querySelectorAll('a[href$=".html"]').forEach(function (link) {
      if (link.target || link.hasAttribute("download")) return;
      var url = link.getAttribute("href");
      if (!url || url.indexOf("://") !== -1) return;

      link.addEventListener("click", function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        var destination = link.href;

        if (pageGate) {
          pageGate.classList.add("closing");
          window.setTimeout(function () {
            window.location.href = destination;
          }, 460);
        } else {
          document.body.classList.add("page-exit");
          window.setTimeout(function () {
            window.location.href = destination;
          }, 220);
        }
      });
    });
  }

  /* ---------- Current year in footer ---------- */
  var yearEl = document.querySelector("#current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
