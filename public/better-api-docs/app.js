/**
 * Better API Docs — Professional Application Engine
 * Handles syntax highlighting, multi-language snippet tab switching,
 * live search filtering across endpoints/schemas, and active scroll spy.
 */

document.addEventListener("DOMContentLoaded", () => {
  setupSearch();
  setupKeyboardShortcuts();
  setupGlobalEvents();
  applySyntaxHighlightingAll();
});

/**
 * Applies syntax color coding to all pre code elements
 */
function applySyntaxHighlightingAll() {
  document.querySelectorAll("pre code").forEach(block => {
    if (block.dataset.highlighted === "true") return;
    block.dataset.highlighted = "true";

    // Cache original raw code string to prevent double-processing or entity corruption
    if (!block.dataset.rawCode) {
      block.dataset.rawCode = block.textContent;
    }
    const rawText = block.dataset.rawCode;
    const isJson = rawText.trim().startsWith("{") || rawText.trim().startsWith("[");

    if (isJson) {
      block.innerHTML = highlightJson(rawText);
    } else {
      block.innerHTML = highlightCode(rawText);
    }
  });
}

/**
 * Universal code syntax highlighter for JS, Python, Java, Go, cURL
 * Preserves literal operators (===, !==, ==, <=, >=, &&, ||) without modification
 */
function highlightCode(codeStr) {
  if (!codeStr) return "";

  // Step 1: Escape HTML entities
  let text = codeStr
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Step 2: Extract & protect strings using token placeholders
  const stringStorage = [];
  text = text.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"|'(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\'])*'|`[\s\S]*?`)/g, (match) => {
    const key = `___STR_TOKEN_${stringStorage.length}___`;
    stringStorage.push(`<span class="code-str">${match}</span>`);
    return key;
  });

  // Step 3: Keywords
  const kwRegex = /\b(const|let|var|function|async|await|require|import|from|def|return|func|package|public|class|static|void|throws|if|else|new|byte|defer|try|catch|type|struct)\b/g;
  text = text.replace(kwRegex, '<span class="code-kw">$1</span>');

  // Step 4: Types & Classes
  const typeRegex = /\b(String|CompoundTag|Buffer|NBTInputStream|GZIPInputStream|ByteArrayInputStream|HttpClient|HttpRequest|HttpResponse|URI|Base64|File|BytesIO|map|interface|error|int|string|byte|boolean|float64|int64|Promise)\b/g;
  text = text.replace(typeRegex, '<span class="code-type">$1</span>');

  // Step 5: Function calls
  text = text.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\()/g, '<span class="code-fn">$1</span>');

  // Step 6: Comments
  text = text.replace(/(\/\/[^\n]*|#[^\n]*)/g, '<span class="code-comment">$1</span>');

  // Step 7: Restore strings
  stringStorage.forEach((strSpan, idx) => {
    text = text.replace(`___STR_TOKEN_${idx}___`, strSpan);
  });

  return text;
}

/**
 * High-contrast JSON syntax highlighter
 */
function highlightJson(jsonStr) {
  if (!jsonStr) return "";
  const text = jsonStr.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return text.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    let cls = "json-number";
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = "json-key";
      } else {
        cls = "json-string";
      }
    } else if (/true|false/.test(match)) {
      cls = "json-boolean";
    } else if (/null/.test(match)) {
      cls = "json-null";
    }
    return `<span class="${cls}">${match}</span>`;
  });
}

/**
 * Language snippet tab switcher
 */
function switchSnippet(btn, targetId) {
  const parent = btn.parentElement;
  parent.querySelectorAll(".snippet-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  const grandParent = parent.parentElement.parentElement;
  grandParent.querySelectorAll(".snippet-content").forEach(w => w.style.display = "none");

  const target = document.getElementById(targetId);
  if (target) {
    target.style.display = "block";
    target.querySelectorAll("pre code").forEach(block => {
      block.dataset.highlighted = "false";
    });
    applySyntaxHighlightingAll();
  }
}

/**
 * Copy to clipboard with instant user feedback
 */
function copyToClipboard(btn) {
  if (typeof btn === 'string') {
    return navigator.clipboard.writeText(btn);
  }
  if (!btn || typeof btn.closest !== 'function') return;
  const wrapper = btn.closest(".code-block-wrapper") || btn.parentElement;
  const codeEl = wrapper ? wrapper.querySelector("code") : null;
  const text = codeEl ? (codeEl.dataset.rawCode || codeEl.innerText || codeEl.textContent) : '';

  navigator.clipboard.writeText(text).then(() => {
    const origText = btn.textContent;
    btn.textContent = "Copied!";
    btn.style.color = "#16a34a";
    setTimeout(() => {
      btn.textContent = origText;
      btn.style.color = "";
    }, 2000);
  });
}

/**
 * Global search filter across endpoints, schemas, parameters, and code
 */
function setupSearch() {
  const input = document.getElementById("search-input");
  if (!input) return;

  input.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    const endpointBlocks = document.querySelectorAll(".endpoint-docs-block");
    const sidebarItems = document.querySelectorAll(".sidebar-nav-item");

    endpointBlocks.forEach((block) => {
      const text = block.innerText.toLowerCase();
      const match = !q || text.includes(q);
      block.style.display = match ? "grid" : "none";
    });

    sidebarItems.forEach((item) => {
      const text = item.innerText.toLowerCase();
      const href = item.querySelector("a")?.getAttribute("href") || "";
      const isOverviewOrGeneral = href.startsWith("#overview") || href.startsWith("#rate") || href.startsWith("#auth") || href.startsWith("#section");
      if (isOverviewOrGeneral) {
        item.style.display = "block";
      } else {
        const match = !q || text.includes(q);
        item.style.display = match ? "block" : "none";
      }
    });
  });
}

/**
 * Keyboard shortcuts ('/' to focus search, 'Escape' to clear)
 */
function setupKeyboardShortcuts() {
  const input = document.getElementById("search-input");
  if (!input) return;

  window.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== input) {
      e.preventDefault();
      input.focus();
    } else if (e.key === "Escape" && document.activeElement === input) {
      input.value = "";
      input.dispatchEvent(new Event("input"));
      input.blur();
    }
  });
}

/**
 * Numerical Item ID Lookup Engine
 */
let itemIdMap = null;

async function setupItemIdLookup() {
  const searchInput = document.getElementById("item-id-search-input");
  const tableBody = document.getElementById("item-id-table-body");
  const countBadge = document.getElementById("item-id-count-badge");
  if (!searchInput || !tableBody) return;

  try {
    const res = await fetch("numerical-item-ids.json");
    itemIdMap = await res.json();
  } catch (err) {
    console.warn("Could not load numerical-item-ids.json:", err);
    return;
  }

  const entries = Object.entries(itemIdMap).map(([idStr, name]) => ({
    id: parseInt(idStr, 10),
    name: name
  }));

  function renderRows(filtered) {
    tableBody.innerHTML = filtered.map(item => `
      <tr>
        <td>
          <span class="id-num-badge ${item.id >= 0 ? 'positive' : 'negative'}">${item.id}</span>
        </td>
        <td><code>minecraft:${item.name}</code></td>
        <td style="color: var(--text-muted); font-size: 0.8rem;">${item.id >= 0 ? 'Item' : 'Block / Custom'}</td>
      </tr>
    `).join("");

    if (countBadge) {
      countBadge.innerText = `${filtered.length.toLocaleString()} matching IDs`;
    }
  }

  // Initial render (popular/top entries)
  renderRows(entries);

  searchInput.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
      renderRows(entries);
      return;
    }

    const filtered = entries.filter(item => {
      return item.id.toString() === q ||
             item.id.toString().includes(q) ||
             item.name.toLowerCase().includes(q);
    });

    renderRows(filtered);
  });
}

/**
 * Scroll spy & external link safety & mobile sidebar toggle
 */
function setupGlobalEvents() {
  document.querySelectorAll('a[target="_blank"]').forEach(a => {
    a.setAttribute("rel", "noopener noreferrer");
  });
  
  const menuBtn = document.querySelector(".mobile-menu-btn");
  const sidebar = document.getElementById("sidebar");
  
  if (menuBtn && sidebar) {
    let backdrop = document.querySelector(".sidebar-backdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "sidebar-backdrop";
      document.body.appendChild(backdrop);
    }

    function toggleMenu(open) {
      const isOpen = open !== undefined ? open : !sidebar.classList.contains("mobile-open");
      sidebar.classList.toggle("mobile-open", isOpen);
      backdrop.classList.toggle("active", isOpen);
      document.body.style.overflow = isOpen ? "hidden" : "";
    }

    menuBtn.addEventListener("click", () => toggleMenu());
    backdrop.addEventListener("click", () => toggleMenu(false));

    // Close when clicking any link inside the sidebar on mobile
    sidebar.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 900) {
          toggleMenu(false);
        }
      });
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sidebar.classList.contains("mobile-open")) {
        toggleMenu(false);
      }
    });

    // Auto-close on resize to desktop
    window.addEventListener("resize", () => {
      if (window.innerWidth > 900 && sidebar.classList.contains("mobile-open")) {
        toggleMenu(false);
      }
    });
  }

  setupItemIdLookup();
}
