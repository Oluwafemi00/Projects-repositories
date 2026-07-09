// ==========================================
// 1. CRITICAL UI — Cursor & Progress Bar
// ==========================================
const dot = document.querySelector(".cursor-dot");
const outline = document.querySelector(".cursor-outline");
const progress = document.getElementById("progress-bar");

let isCursorTicking = false;
window.addEventListener(
  "mousemove",
  (e) => {
    if (!dot || !outline) return;
    if (!isCursorTicking) {
      window.requestAnimationFrame(() => {
        dot.style.opacity = "1";
        outline.style.opacity = "1";
        dot.style.left = `${e.clientX}px`;
        dot.style.top = `${e.clientY}px`;
        outline.animate(
          { left: `${e.clientX}px`, top: `${e.clientY}px` },
          { duration: 380, fill: "forwards" },
        );
        isCursorTicking = false;
      });
      isCursorTicking = true;
    }
  },
  { passive: true },
);

document.addEventListener("mouseleave", () => {
  if (dot) dot.style.opacity = "0";
  if (outline) outline.style.opacity = "0";
});

// Cursor hover expansion
document.addEventListener("mouseover", (e) => {
  if (e.target.closest("a, button, .repo-row, .blog-row, .chip, .btn-back")) {
    outline?.classList.add("hovered");
  } else {
    outline?.classList.remove("hovered");
  }
});

// Scroll progress
let isScrollTicking = false;
window.addEventListener(
  "scroll",
  () => {
    if (!isScrollTicking) {
      window.requestAnimationFrame(() => {
        const scrolled =
          (window.scrollY /
            (document.documentElement.scrollHeight - window.innerHeight)) *
          100;
        if (progress) progress.style.width = `${scrolled}%`;

        // Navbar shrink
        const navbar = document.getElementById("navbar");
        if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 55);

        isScrollTicking = false;
      });
      isScrollTicking = true;
    }
  },
  { passive: true },
);

// ==========================================
// 2. DEFERRED SYSTEMS
// ==========================================
window.addEventListener("load", () => {
  // Magnetic buttons
  function applyMagnetic() {
    document.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px,
                                         ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      el.addEventListener(
        "mouseleave",
        () => (el.style.transform = "translate(0,0)"),
      );
    });
  }

  // Mobile menu
  const menuTrigger = document.getElementById("mobile-menu-trigger");
  const navMenu = document.querySelector(".nav-menu");

  if (menuTrigger && navMenu) {
    menuTrigger.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      const spans = menuTrigger.querySelectorAll("span");
      const isActive = navMenu.classList.contains("active");
      if (spans.length === 3) {
        spans[0].style.transform = isActive
          ? "rotate(45deg) translate(5px,6px)"
          : "none";
        spans[1].style.opacity = isActive ? "0" : "1";
        spans[2].style.transform = isActive
          ? "rotate(-45deg) translate(5px,-6px)"
          : "none";
      }
    });

    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        menuTrigger.querySelectorAll("span").forEach((s) => {
          s.style.transform = "none";
          s.style.opacity = "1";
        });
      });
    });
  }

  // ==========================================
  // 3. GITHUB API
  // ==========================================
  const USERNAME = "Oluwafemi00";

  // Featured repos (show badge)
  const FEATURED_REPOS = [
    "full-stack-study-planner",
    "Pomodoro-app",
    "SkyCast-Dashboard",
    "CS-Pathfinder",
    "Frontend-Swiftcart",
  ];

  // Language colour map
  const LANG_COLORS = {
    JavaScript: "#f7df1e",
    TypeScript: "#3178c6",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Python: "#3572A5",
    Vue: "#41b883",
  };

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatCount(n) {
    return n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);
  }

  function setSignal(state) {
    const dot = document.getElementById("signal-dot");
    const text = document.getElementById("signal-text");
    if (!dot || !text) return;
    dot.className = `signal-dot ${state}`;
    const map = { live: "Live data", error: "API error", "": "Connecting..." };
    text.textContent = map[state] || "Connecting...";
  }

  // All repos cached for filtering
  let allRepos = [];

  async function fetchRepos() {
    const container = document.getElementById("repo-container");
    const filterBar = document.getElementById("filter-bar");
    if (!container) return;

    try {
      const res = await fetch(
        `https://api.github.com/users/${USERNAME}/repos?sort=updated&per_page=6`,
        {
          headers: { Accept: "application/vnd.github.v3+json" },
        },
      );

      if (res.status === 403 || res.status === 429)
        throw new Error("rate_limit");
      if (!res.ok) throw new Error("fetch_failed");

      const repos = await res.json();
      allRepos = repos.filter((r) => !r.fork); // exclude forks by default

      // Compute stats
      const totalStars = repos.reduce((a, r) => a + r.stargazers_count, 0);
      const languages = [
        ...new Set(repos.map((r) => r.language).filter(Boolean)),
      ];

      animateCounter("stat-repos", allRepos.length);
      animateCounter("stat-stars", totalStars);
      animateCounter("stat-langs", languages.length);

      // Build language filter chips
      if (filterBar) {
        filterBar.style.display = "block";
        const chipsEl = document.getElementById("filter-chips");
        if (chipsEl) {
          languages.forEach((lang) => {
            const btn = document.createElement("button");
            btn.className = "chip";
            btn.dataset.lang = lang;
            btn.textContent = lang;
            chipsEl.appendChild(btn);
          });

          // Filter logic
          let activeFilter = "all";
          let searchQuery = "";

          function renderFiltered() {
            const filtered = allRepos.filter((r) => {
              const matchLang =
                activeFilter === "all" || r.language === activeFilter;
              const matchSearch =
                r.name.toLowerCase().includes(searchQuery) ||
                (r.description || "").toLowerCase().includes(searchQuery);
              return matchLang && matchSearch;
            });
            renderRepos(filtered);
          }

          chipsEl.addEventListener("click", (e) => {
            const chip = e.target.closest(".chip");
            if (!chip) return;
            chipsEl
              .querySelectorAll(".chip")
              .forEach((c) => c.classList.remove("active"));
            chip.classList.add("active");
            activeFilter = chip.dataset.lang;
            renderFiltered();
          });

          const searchInput = document.getElementById("repo-search");
          if (searchInput) {
            searchInput.addEventListener("input", (e) => {
              searchQuery = e.target.value.toLowerCase().trim();
              renderFiltered();
            });
          }
        }
      }

      renderRepos(allRepos);
      setSignal("live");
    } catch (err) {
      setSignal("error");
      const container = document.getElementById("repo-container");
      if (!container) return;
      const msg =
        err.message === "rate_limit"
          ? "GitHub API rate limit reached. Please try again in a few minutes."
          : "Unable to connect to GitHub. Check your network connection.";
      container.innerHTML = `
        <div class="repo-error">
          <h3>[API_ERROR] Data stream paused</h3>
          <p>${msg}</p>
          <a href="https://github.com/${USERNAME}" target="_blank" class="btn-premium magnetic" style="display:inline-flex;text-decoration:none;">
            View GitHub Directly →
          </a>
        </div>
      `;
    }
  }

  function renderRepos(repos) {
    const container = document.getElementById("repo-container");
    const emptyEl = document.getElementById("repo-empty");
    if (!container) return;

    if (repos.length === 0) {
      container.innerHTML = "";
      if (emptyEl) emptyEl.style.display = "block";
      return;
    }

    if (emptyEl) emptyEl.style.display = "none";

    const isFeatured = (name) => FEATURED_REPOS.includes(name);

    // Sort: featured first, then by updated date
    const sorted = [...repos].sort((a, b) => {
      const af = isFeatured(a.name) ? 1 : 0;
      const bf = isFeatured(b.name) ? 1 : 0;
      if (af !== bf) return bf - af;
      return new Date(b.updated_at) - new Date(a.updated_at);
    });

    container.innerHTML = sorted
      .map((repo, i) => {
        const lang = repo.language || null;
        const langDot = lang
          ? `<span class="lang-dot" data-lang="${lang}" style="background:${LANG_COLORS[lang] || "var(--text-dim)"}"></span>`
          : "";
        const featured = isFeatured(repo.name)
          ? '<span class="repo-badge featured">Featured</span>'
          : "";
        const desc = repo.description || "No description provided.";

        return `
        <a
          class="repo-row"
          href="${repo.html_url}"
          target="_blank"
          rel="noopener noreferrer"
          style="animation-delay:${i * 0.04}s"
        >
          <div class="repo-row-left">
            <div class="repo-name-row">
              <span class="repo-name">${repo.name}</span>
              ${featured}
            </div>
            <p class="repo-desc">${desc}</p>
            <div class="repo-meta">
              ${
                lang
                  ? `
              <span class="repo-meta-item">
                ${langDot}
                <span>${lang}</span>
              </span>`
                  : ""
              }
              ${
                repo.stargazers_count > 0
                  ? `
              <span class="repo-meta-item">
                <i class="fas fa-star"></i>
                <span>${formatCount(repo.stargazers_count)}</span>
              </span>`
                  : ""
              }
              ${
                repo.forks_count > 0
                  ? `
              <span class="repo-meta-item">
                <i class="fas fa-code-branch"></i>
                <span>${repo.forks_count}</span>
              </span>`
                  : ""
              }
              <span class="repo-meta-item">
                <i class="fas fa-clock"></i>
                <span>${formatDate(repo.updated_at)}</span>
              </span>
            </div>
          </div>
          <div class="repo-row-right">
            <div class="repo-arrow"><i class="fas fa-arrow-right"></i></div>
          </div>
        </a>
      `;
      })
      .join("");

    applyMagnetic();
  }

  // Animated counter
  function animateCounter(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    let current = 0;
    const step = Math.ceil(target / 30);
    const iv = setInterval(() => {
      current += step;
      if (current >= target) {
        el.textContent = target;
        clearInterval(iv);
      } else el.textContent = current;
    }, 35);
  }

  // ==========================================
  // 4. DEV LOGS (Blog)
  // ==========================================
  const blogPosts = [
    {
      title: "Building a Vanilla JS Portfolio",
      date: "2026-02-17",
      file: "post1",
    },
    {
      title: "Building a GitHub Project Website",
      date: "2026-02-27",
      file: "post2",
    },
    {
      title: "Building Study Planner Pro + AI Integration",
      date: "2026-07-08",
      file: "post3",
    },
  ];

  const blogContainer = document.getElementById("blog-content");

  window.renderPostList = function () {
    if (!blogContainer) return;
    blogContainer.innerHTML = `
      <div class="blog-list">
        ${blogPosts
          .map(
            (post, i) => `
          <div class="blog-row" onclick="loadBlogPost('${post.file}')" style="animation-delay:${i * 0.08}s">
            <div class="blog-row-left">
              <span class="blog-date">${post.date}</span>
              <h3 class="blog-title">${post.title}</h3>
            </div>
            <span class="blog-read">Read →</span>
          </div>
        `,
          )
          .join("")}
      </div>
    `;
  };

  window.loadBlogPost = async function (fileName) {
    if (!blogContainer) return;
    blogContainer.innerHTML = `
      <div class="log-loader">
        <span class="log-spinner"></span>
        <span>Decrypting file...</span>
      </div>
    `;
    try {
      const res = await fetch(`./posts/${fileName}.md`);
      if (!res.ok) throw new Error("File corrupted or missing.");
      const text = await res.text();
      blogContainer.innerHTML = `
        <div class="blog-article">
          <button onclick="renderPostList()" class="btn-back">
            <i class="fas fa-arrow-left"></i> Back to Logs
          </button>
          <div class="markdown-body">
            ${marked.parse(text)}
          </div>
          <button onclick="renderPostList()" class="btn-back" style="margin-top:2rem;">
            <i class="fas fa-arrow-left"></i> Back to Logs
          </button>
        </div>
      `;
    } catch (err) {
      blogContainer.innerHTML = `<p style="color:var(--red);font-family:var(--font-mono);font-size:0.8rem;">[ERROR] ${err.message}</p>`;
    }
  };

  // ==========================================
  // 5. CONTACT FORM
  // ==========================================
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector("button");
      btn.textContent = "TRANSMITTING...";
      btn.style.opacity = "0.5";
      btn.disabled = true;

      try {
        const res = await fetch(contactForm.action, {
          method: "POST",
          body: new FormData(contactForm),
          headers: { Accept: "application/json" },
        });

        if (res.ok) {
          contactForm.innerHTML = `
            <div class="success-state">
              <h3 class="italic-serif" style="font-size:1.8rem;font-family:var(--font-serif);color:var(--text);">
                Transmission Successful.
              </h3>
              <p style="color:var(--text-dim);margin-top:0.5rem;font-size:0.9rem;">
                I'll review your inquiry and respond shortly.
              </p>
            </div>
          `;
        } else throw new Error();
      } catch {
        btn.textContent = "TRANSMISSION_FAILED. RE-TRY?";
        btn.style.opacity = "1";
        btn.disabled = false;
      }
    });
  }

  // ==========================================
  // INIT
  // ==========================================
  fetchRepos();
  renderPostList();
  applyMagnetic();
}); // end load
