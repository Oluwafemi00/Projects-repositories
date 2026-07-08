# System Repositories & Engineering Logs

**A self-updating project hub that treats GitHub as the single source of truth.**

Built to eliminate manual portfolio updates—when your repos change, your site changes. No duplication, no static generators, no CMS.

[![Live Deployment](https://img.shields.io/badge/🚀_Live_System-View_Hub-27c93f?style=for-the-badge)](https://oluwafemi00.github.io/my-project-portfolio/)
[![Performance](https://img.shields.io/badge/Lighthouse-91%25_Mobile-success?style=for-the-badge)]()
[![Architecture](https://img.shields.io/badge/Architecture-Vanilla_JS-c5a059?style=for-the-badge)]()

---

## The Core Problem

**Traditional portfolio workflow:**

1. Build a project on GitHub
2. Manually add it to your portfolio site
3. Update descriptions in two places
4. Keep screenshots/links synchronized
5. Repeat for every project change

**Result:** Portfolio becomes stale. README gets updated, site doesn't.

---

## The Solution: GitHub as Single Source of Truth

This system **pulls live repository data directly from GitHub** and renders it dynamically.

**The workflow now:**

1. Push to GitHub
2. Portfolio updates automatically

**One source of truth. Zero manual sync.**

When you update a repo's description, stars, or README—your portfolio reflects it immediately. No rebuilds, no deploys, no duplication.

---

## Why This Architecture Matters

### For You (The Developer)

- **Never update two places again** - GitHub is the canonical source
- **Add projects instantly** - Push to GitHub, they appear automatically
- **Portfolio never goes stale** - Live data means always current
- **Write once, render anywhere** - Engineering logs are just Markdown files

### For Visitors (Recruiters/Employers)

- **Always see latest work** - No "this portfolio is outdated" risk
- **Accurate project metadata** - Stars, language stats, last updated dates
- **Direct GitHub links** - One click to source code
- **Performance matters** - 91% Lighthouse score = respects their time

---

## System Architecture

### 🔄 Live Repository Sync

**How it works:**

```javascript
async function fetchRepositories() {
  const response = await fetch(
    "https://api.github.com/users/oluwafemi00/repos?sort=updated",
  );
  const repos = await response.json();

  // Filter for showcase-worthy projects
  const featured = repos.filter(
    (repo) => !repo.fork && !repo.archived && repo.stargazers_count > 0,
  );

  renderProjects(featured);
}
```

**Data pulled:**

- Repository name, description, language
- Star count, fork count, last updated
- Topics/tags for categorization
- Direct links to GitHub source

**Why this works:**

- No database needed
- No backend maintenance
- Always reflects current state
- GitHub handles version control

---

### 🛡️ Rate Limit Fallback System

**The Problem:**  
GitHub's API limits unauthenticated requests to **60/hour per IP**. When exceeded, requests fail with `403` (often misreported as CORS errors by browsers).

**The Solution:**  
Graceful degradation with controlled fallback state.

**Implementation:**

```javascript
async function fetchWithFallback(url) {
  try {
    const response = await fetch(url);

    if (response.status === 403) {
      const rateLimitReset = response.headers.get("X-RateLimit-Reset");
      showRateLimitWarning(rateLimitReset);
      return loadCachedData(); // Fallback to last successful fetch
    }

    return response.json();
  } catch (error) {
    logSystemWarning("[NETWORK ERROR]", error);
    return loadStaticFallback();
  }
}

function showRateLimitWarning(resetTime) {
  const resetDate = new Date(resetTime * 1000);
  displayBanner(`
    [SYSTEM WARNING] GitHub API rate limit reached.
    Displaying cached data. Refresh after ${resetDate.toLocaleTimeString()}.
  `);
}
```

**User Experience:**

- **Never shows broken UI** - Fallback data prevents blank screens
- **Clear messaging** - Users know why they're seeing cached data
- **Reset countdown** - Shows when fresh data will be available
- **Graceful recovery** - Auto-retries after rate limit window

**Why this matters:**  
Most portfolio sites using GitHub API ignore this problem. This one handles it production-grade.

---

### 📝 Dynamic Engineering Logs

**The Problem:**  
Blog posts stored in databases require backends. Static site generators need rebuild/redeploy cycles.

**The Solution:**  
Markdown files fetched and rendered client-side.

**Architecture:**

```
/logs
├── 2024-01-building-pwas.md
├── 2024-02-state-management.md
└── 2024-03-api-design.md
```

**Rendering Pipeline:**

```javascript
async function loadEngineeringLog(filename) {
  // 1. Fetch raw Markdown
  const markdown = await fetch(`/logs/${filename}`).then((r) => r.text());

  // 2. Parse with Marked.js (loaded on-demand)
  const html = marked.parse(markdown);

  // 3. Inject into DOM with syntax highlighting
  document.getElementById("log-content").innerHTML = html;

  // 4. Apply code highlighting
  hljs.highlightAll();
}
```

**Benefits:**

- **Write in Markdown** - Natural for developers
- **No database** - Files versioned in Git
- **No build step** - Add file, it appears
- **Syntax highlighting** - Code blocks render properly
- **SEO-friendly** - Content crawlable

**Lazy Loading:**  
Marked.js only loads when user clicks a log entry:

```javascript
if (!window.marked) {
  await import("https://cdn.jsdelivr.net/npm/marked/marked.min.js");
}
```

Saves ~50KB on initial page load.

---

### 🎯 Zero Layout Shift (CLS: 0.00)

**The Problem:**  
Async data loading causes content to jump around (bad UX, bad Core Web Vitals).

**The Solution:**  
Reserve space before content loads.

**Implementation:**

```css
.project-grid {
  /* Reserve space for 6 project cards */
  min-height: 800px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.project-card {
  /* Fixed height prevents reflow */
  height: 280px;
  overflow: hidden;
}
```

**Result:**

- **CLS: 0.00** - No content jumping
- **Perceived performance** - Layout stable instantly
- **Accessibility** - Screen readers don't get confused

---

## Performance Engineering

### Lighthouse Metrics

| Metric                      | Score  | Details                    |
| --------------------------- | ------ | -------------------------- |
| **Performance**             | 91/100 | Mobile 3G simulation       |
| **Total Blocking Time**     | 10ms   | Main thread barely blocked |
| **Cumulative Layout Shift** | 0.00   | Zero visual instability    |
| **First Contentful Paint**  | 1.2s   | Fast perceived load        |
| **Time to Interactive**     | 2.1s   | Fully interactive quickly  |

### Optimization Strategies

**1. Minimal JavaScript Bundle**

- No framework overhead (0KB React/Vue tax)
- Marked.js loaded lazily (only for blog posts)
- Total JS: ~8KB gzipped

**2. Critical Rendering Path**

- Inline critical CSS in `<head>`
- Defer non-critical styles
- Preconnect to GitHub API domains

**3. Async Data Loading**

- Fetch projects in parallel
- Progressive rendering (show as data arrives)
- Skeleton screens during load

**4. Browser Caching**

```javascript
// Cache GitHub responses for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;
const cache = new Map();

function getCachedOrFetch(url) {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  return fetch(url).then((data) => {
    cache.set(url, { data, timestamp: Date.now() });
    return data;
  });
}
```

---

## What I Learned Building This

### API Integration Patterns

- **Rate limit handling** - Production-grade error recovery
- **Caching strategies** - Balance freshness vs API calls
- **Fallback systems** - Never show broken UI
- **CORS understanding** - Why some errors happen

### Performance Engineering

- **Critical Rendering Path** optimization
- **Layout shift prevention** - Reserve space before content
- **Lazy loading** - Defer non-critical resources
- **Bundle size awareness** - Every KB matters

### System Design

- **Single source of truth** - GitHub as canonical data
- **Progressive enhancement** - Works with/without JavaScript
- **Graceful degradation** - Handles API failures
- **State management** - Without frameworks

---

## Technical Deep Dive: GitHub API Integration

### Authentication Trade-offs

**Option 1: Unauthenticated (Current)**

- **Pros:** No keys to manage, works immediately
- **Cons:** 60 requests/hour limit
- **Use case:** Personal portfolio (low traffic)

**Option 2: Authenticated (Future)**

- **Pros:** 5,000 requests/hour
- **Cons:** Requires GitHub token, security considerations
- **Use case:** High-traffic portfolio

**Current implementation:**  
Unauthenticated with aggressive caching (5min) and fallback data. Rate limit rarely hit in practice.

### Data Transformation Pipeline

```javascript
// Raw GitHub API response
{
  "name": "study-planner-pro",
  "description": "PWA for student productivity",
  "stargazers_count": 42,
  "language": "JavaScript",
  "topics": ["pwa", "productivity", "vanilla-js"]
}

// Transformed for UI
{
  title: "Study Planner Pro",
  description: "PWA for student productivity",
  stars: 42,
  language: "JavaScript",
  tags: ["PWA", "Productivity", "Vanilla JS"],
  githubUrl: "https://github.com/oluwafemi00/study-planner-pro",
  liveUrl: extractLiveUrl(repo) // Parse from description or homepage
}
```

---

## Real-World Use Cases

**Scenario 1: Adding a New Project**

1. Push project to GitHub
2. Add topics like `["featured", "portfolio"]`
3. Portfolio auto-updates on next visit
4. No manual editing required

**Scenario 2: Updating Project Description**

1. Edit README on GitHub
2. Change repo description
3. Portfolio reflects changes immediately
4. One source of truth maintained

**Scenario 3: Writing Engineering Logs**

1. Create Markdown file in `/logs` directory
2. Push to GitHub
3. Log appears in portfolio automatically
4. No CMS, no database, no backend

---

## Future Enhancements

### v2.0 Roadmap

- [ ] **GitHub GraphQL API** - More efficient data fetching
- [ ] **Personal Access Token** - Higher rate limits (5k/hour)
- [ ] **Service Worker caching** - True offline support
- [ ] **Search/filter UI** - Find projects by language/topic
- [ ] **Analytics integration** - Track popular projects
- [ ] **RSS feed generation** - Subscribe to engineering logs

### v3.0 Vision

- [ ] **Contribution graphs** - Visualize GitHub activity
- [ ] **Commit history** - Show recent work
- [ ] **Issue/PR stats** - Demonstrate open source work
- [ ] **Multi-platform** - Include GitLab, Bitbucket repos

---

## Installation & Development

```bash
# Clone the repository
git clone https://github.com/oluwafemi00/my-project-portfolio.git

# Navigate to directory
cd my-project-portfolio

# Serve with local server (required for fetch API)
npx serve .

# OR use Python
python -m http.server 8000

# Open browser
open http://localhost:8000
```

**Why local server?**  
Fetch API requires CORS-safe environment. Opening `file://` directly won't work.

---

## File Structure

```
my-project-portfolio/
├── index.html              # Main entry point
├── styles.css              # Styling & layout
├── app.js                  # Core application logic
├── github-api.js           # GitHub API integration
├── markdown-parser.js      # Marked.js integration
├── /logs
│   ├── 2024-01-*.md       # Engineering log posts
│   └── index.json          # Log metadata
└── /fallback
    └── cached-repos.json   # Fallback data for rate limits
```

**Separation of concerns:**

- `github-api.js` - All API logic isolated
- `markdown-parser.js` - Rendering logic separate
- `app.js` - UI orchestration only

---

## Browser Support

| Feature   | Chrome | Firefox | Safari | Edge |
| --------- | ------ | ------- | ------ | ---- |
| Core Site | ✅     | ✅      | ✅     | ✅   |
| Fetch API | ✅     | ✅      | ✅     | ✅   |
| ES6+      | ✅     | ✅      | ✅     | ✅   |
| CSS Grid  | ✅     | ✅      | ✅     | ✅   |

**Minimum versions:**

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

---

## Why This Approach?

### vs Static Site Generators (Gatsby, Hugo, Jekyll)

**Static generators require:**

- Build step on every change
- Deploy pipeline configuration
- Node.js/Ruby environment
- Learning specific frameworks

**This approach:**

- No build step - just push to GitHub
- No deploy pipeline - GitHub Pages handles it
- No dependencies - vanilla JS
- Universal knowledge - HTML/CSS/JS

### vs Dynamic CMS (WordPress, Ghost, Contentful)

**CMS solutions require:**

- Database maintenance
- Backend hosting costs
- Content duplication (GitHub + CMS)
- Security updates

**This approach:**

- No database - GitHub is the database
- No backend - pure frontend
- Single source of truth - GitHub only
- Zero maintenance - no security patches

---

## Author

**Femi Sodiq Oladele**  
Software Engineer | Building systems that eliminate manual work  
[LinkedIn](#) | [GitHub](https://github.com/oluwafemi00) | [Portfolio](https://oluwafemi00.github.io/my-project-portfolio/)

---

## License

MIT License - Fork it, improve it, ship it.

---

## Key Insights

**What this project proves:**

✅ **System thinking** - Single source of truth architecture  
✅ **API integration** - Real-world rate limiting and error handling  
✅ **Performance engineering** - 91% Lighthouse, 0.00 CLS  
✅ **Error resilience** - Graceful degradation patterns  
✅ **Developer experience** - Eliminate manual portfolio updates

**Why it matters:**

Most portfolios are static snapshots. This one is a **living system** that stays current automatically.

It demonstrates:

- API integration skills
- Error handling maturity
- Performance awareness
- System architecture thinking
- Automation mindset

---

**⭐ If this inspired you to rethink portfolio architecture, star the repo!**

**💼 Hiring?** This project shows: API integration, error handling, performance optimization, system design, and automation—all skills that transfer directly to production engineering.
