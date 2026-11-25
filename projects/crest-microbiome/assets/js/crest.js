(() => {
  "use strict";

  const menuButton = document.querySelector("[data-crest-menu]");
  const navigation = document.querySelector("[data-crest-navigation]");

  if (menuButton && navigation) {
    const closeMenu = () => {
      menuButton.setAttribute("aria-expanded", "false");
      navigation.classList.remove("is-open");
    };

    menuButton.addEventListener("click", () => {
      const willOpen = menuButton.getAttribute("aria-expanded") !== "true";
      menuButton.setAttribute("aria-expanded", String(willOpen));
      navigation.classList.toggle("is-open", willOpen);
    });

    navigation.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) closeMenu();
    });
  }

  const parseCsv = (text) => {
    const rows = [];
    let row = [];
    let value = "";
    let quoted = false;

    for (let index = 0; index < text.length; index += 1) {
      const character = text[index];
      const next = text[index + 1];

      if (character === '"' && quoted && next === '"') {
        value += '"';
        index += 1;
      } else if (character === '"') {
        quoted = !quoted;
      } else if (character === "," && !quoted) {
        row.push(value);
        value = "";
      } else if ((character === "\n" || character === "\r") && !quoted) {
        if (character === "\r" && next === "\n") index += 1;
        row.push(value);
        if (row.some((cell) => cell.trim() !== "")) rows.push(row);
        row = [];
        value = "";
      } else {
        value += character;
      }
    }

    if (value || row.length) {
      row.push(value);
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
    }

    if (!rows.length) return [];
    const headers = rows[0].map((header) => header.replace(/^\uFEFF/, "").trim());

    return rows.slice(1).map((cells) =>
      headers.reduce((record, header, index) => {
        record[header] = (cells[index] || "").trim();
        return record;
      }, {})
    );
  };

  const escapeHtml = (value) =>
    String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const isExternalUrl = (url) => /^https?:\/\//i.test(url);

  const resolveUrl = (url, base) => {
    if (!url) return "";
    if (isExternalUrl(url) || url.startsWith("/") || url.startsWith("#")) return url;
    return `${base}${url}`;
  };

  const formatDate = (date) => {
    const match = String(date || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? `${match[1]}.${match[2]}.${match[3]}` : date;
  };

  const newsRoot = document.querySelector("[data-crest-news]");

  if (newsRoot) {
    const source = newsRoot.dataset.newsSource;
    const base = newsRoot.dataset.siteBase || "";
    const list = newsRoot.querySelector("[data-crest-news-list]");
    const status = newsRoot.querySelector("[data-crest-news-status]");

    fetch(source)
      .then((response) => {
        if (!response.ok) throw new Error("News data could not be loaded.");
        return response.text();
      })
      .then((text) => {
        const entries = parseCsv(text)
          .filter((entry) => entry.date && entry.title)
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 5);

        if (!entries.length) {
          status.textContent = "現在、お知らせはありません。";
          return;
        }

        list.innerHTML = entries
          .map((entry) => {
            const content = `<time datetime="${escapeHtml(entry.date)}">${escapeHtml(formatDate(entry.date))}</time><b>${escapeHtml(entry.title)}</b><i aria-hidden="true">${entry.url ? "→" : ""}</i>`;
            const url = resolveUrl(entry.url, base);
            if (!url) return `<div class="crest-news-static">${content}</div>`;
            const external = isExternalUrl(url) ? ' target="_blank" rel="noopener noreferrer"' : "";
            return `<a href="${escapeHtml(url)}"${external}>${content}</a>`;
          })
          .join("");
        status.hidden = true;
      })
      .catch(() => {
        status.textContent = "お知らせを読み込めませんでした。";
      });
  }

  const resultsRoot = document.querySelector("[data-crest-results]");

  if (resultsRoot) {
    const source = resultsRoot.dataset.resultsSource;
    const list = resultsRoot.querySelector("[data-crest-results-list]");
    const status = resultsRoot.querySelector("[data-crest-results-status]");
    const filterButtons = [...resultsRoot.querySelectorAll("[data-result-filter]")];
    let entries = [];

    const labels = {
      publication: "論文",
      conference: "学会発表",
      technology: "技術・ソフトウェア",
      media: "報道・その他",
    };

    const renderResults = (filter = "all") => {
      const filtered = filter === "all" ? entries : entries.filter((entry) => entry.category === filter);

      if (!filtered.length) {
        list.innerHTML = "";
        status.hidden = false;
        status.textContent = entries.length ? "該当する研究成果はありません。" : "研究成果は順次掲載します。";
        return;
      }

      list.innerHTML = filtered
        .map((entry) => {
          const main = `<time datetime="${escapeHtml(entry.date)}">${escapeHtml(formatDate(entry.date))}</time><span>${escapeHtml(labels[entry.category] || entry.category || "成果")}</span><div><h3>${escapeHtml(entry.title)}</h3>${entry.description ? `<p>${escapeHtml(entry.description)}</p>` : ""}</div><i aria-hidden="true">${entry.url ? "→" : ""}</i>`;
          if (!entry.url) return `<article class="crest-result-item">${main}</article>`;
          const external = isExternalUrl(entry.url) ? ' target="_blank" rel="noopener noreferrer"' : "";
          return `<a class="crest-result-item" href="${escapeHtml(entry.url)}"${external}>${main}</a>`;
        })
        .join("");
      status.hidden = true;
    };

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filterButtons.forEach((candidate) => candidate.classList.remove("is-active"));
        button.classList.add("is-active");
        renderResults(button.dataset.resultFilter);
      });
    });

    fetch(source)
      .then((response) => {
        if (!response.ok) throw new Error("Results data could not be loaded.");
        return response.text();
      })
      .then((text) => {
        entries = parseCsv(text)
          .filter((entry) => entry.date && entry.title)
          .sort((a, b) => b.date.localeCompare(a.date));
        renderResults();
      })
      .catch(() => {
        status.textContent = "研究成果を読み込めませんでした。";
      });
  }
})();
