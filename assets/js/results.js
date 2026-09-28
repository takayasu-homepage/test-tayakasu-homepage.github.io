/* Standard CSV with named headers; quoted commas, quotes and newlines are supported. */
const resultCategories = {
  publications: {
    label: "論文", placeholder: "タイトル・著者・雑誌名で検索",
    sources: [
      { file: "pub_EnPeer.csv", type: "en-peer", label: "英語・査読あり" },
      { file: "pub_JpPeer.csv", type: "jp-peer", label: "日本語・査読あり" },
      { file: "pub_JpNot.csv", type: "jp-other", label: "日本語・査読なし" },
    ],
  },
  conferences: { label: "招待講演・学会発表", placeholder: "題目・発表者・学会名で検索", sources: [{ file: "conference.csv", label: "招待講演・学会発表" }] },
  media: { label: "メディア掲載・その他", placeholder: "記事・番組名・媒体名で検索", sources: [{ file: "media.csv", label: "メディア掲載・その他" }] },
  visitors: { label: "研究来訪者", placeholder: "氏名・所属で検索", note: "2016年以降の研究来訪記録。年は来訪開始日を基準に表示しています。", sources: [{ file: "visitor.csv", label: "研究来訪者" }] },
};

function resultEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function resultPlain(value = "") {
  // Decode entities in an inert textarea only after removing legacy markup.
  const decoder = document.createElement("textarea");
  decoder.innerHTML = String(value).replace(/<br\s*\/?\s*>/gi, " ").replace(/<[^>]*>/g, "");
  return decoder.value.replace(/\ufeff/g, "").replace(/\s+/g, " ").trim();
}

function resultNormalize(value) {
  return value.normalize("NFKC").toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

function resultDate(value) {
  const parts = value.match(/^(\d{4})(?:[-./年](\d{1,2})(?!\d)(?:[-./月](\d{1,2})(?!\d))?)?/);
  if (!parts) return { year: "unknown", sort: 0 };
  const month = Number(parts[2] || 0);
  const day = Number(parts[3] || 0);
  return { year: parts[1], sort: Number(parts[1]) * 10000 + (month <= 12 ? month * 100 + (day <= 31 ? day : 0) : 0) };
}

function resultUrl(value) {
  if (!value) return "";
  try {
    // The original relative PDF links belong to the public laboratory archive.
    const url = new URL(value, "https://takayasu-research-lab.com/");
    return /^https?:$/.test(url.protocol) ? url.href : "";
  } catch { return ""; }
}

function parseResultCsv(text) {
  const rows = [];
  let row = [], value = "", quoted = false, closed = false;
  const input = text.replace(/^\ufeff/, "");
  function endField() { row.push(value); value = ""; closed = false; }
  function endRow() {
    endField();
    if (row.some(cell => cell.trim())) rows.push(row);
    row = [];
  }
  for (let index = 0; index < input.length; index++) {
    const char = input[index];
    if (quoted) {
      if (char === '"' && input[index + 1] === '"') { value += '"'; index++; }
      else if (char === '"') { quoted = false; closed = true; }
      else value += char;
    } else if (char === ',') endField();
    else if (char === '\r' || char === '\n') {
      if (char === '\r' && input[index + 1] === '\n') index++;
      endRow();
    } else if (char === '"' && !value && !closed) quoted = true;
    else if (closed || char === '"') throw new Error('Invalid CSV quoting');
    else value += char;
  }
  if (quoted) throw new Error('Unclosed CSV quote');
  endRow();
  if (!rows.length) return { headers: [], rows: [] };
  const headers = rows.shift().map(header => header.trim());
  if (headers.some(header => !header) || new Set(headers).size !== headers.length) throw new Error('Invalid CSV headers');
  return { headers, rows: rows.map(cells => {
    if (cells.length > headers.length) throw new Error('Too many CSV fields');
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
  }) };
}

function parseResults(text, category, source) {
  const parsed = parseResultCsv(text);
  if (!parsed.headers.length) return [];
  const required = category === "publications" ? ["year", "authors", "title", "journal", "volume", "issue", "pages", "url"]
    : category === "conferences" ? ["date", "authors", "event", "title"]
    : category === "media" ? ["date", "title", "url"] : ["date", "name_affiliation", "url"];
  if (required.some(key => !parsed.headers.includes(key))) throw new Error(`Missing CSV headers: ${source.file}`);
  return parsed.rows.map((raw, index) => {
    const fields = Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, resultPlain(value)]));
    const record = { id: `${source.file}-${index + 1}`, type: source.type || "", badge: "", title: "", authors: "", meta: "", date: "", url: "" };
    if (category === "publications") {
      if (!/^\d{4}$/.test(fields.year)) throw new Error(`Invalid publication year: ${source.file}:${index + 2}`);
      record.title = fields.title;
      record.authors = fields.authors;
      const volume = fields.volume.replace(/^[,\s]+/, "");
      const issue = fields.issue ? `(${fields.issue})` : "";
      record.meta = [fields.journal, volume + issue, fields.pages].filter(Boolean).join(", ");
      record.meta += ` (${fields.year})`;
      record.date = fields.year;
      record.badge = source.label;
      record.url = resultUrl(fields.url);
    } else if (category === "conferences") {
      record.date = fields.date;
      record.authors = fields.authors;
      record.title = fields.title || fields.event;
      record.meta = fields.title ? fields.event : "";
      const kindText = `${record.authors} ${record.title}`;
      record.badge = /基調|plenary|keynote/i.test(kindText) ? "基調講演"
        : /招待|invited/i.test(kindText) ? "招待講演"
        : /ポスター|poster/i.test(kindText) ? "ポスター発表"
        : /講義|lecture/i.test(kindText) ? "講義"
        : /oral presentation/i.test(kindText) ? "口頭発表" : "";
    } else {
      record.date = fields.date;
      record.title = category === "media" ? fields.title : fields.name_affiliation;
      record.url = resultUrl(fields.url);
    }
    if (!record.title) throw new Error(`Missing title or name: ${source.file}:${index + 2}`);
    Object.assign(record, resultDate(record.date));
    record.search = resultNormalize([record.title, record.authors, record.meta, record.date, record.badge].join(" "));
    return record;
  });
}

function resultYears(records) {
  return [...new Set(records.map(record => record.year))].sort((a, b) => (Number(b) || 0) - (Number(a) || 0));
}

function filterResults(records, { year = "all", type = "all", query = "" }) {
  const words = resultNormalize(query).split(" ").filter(Boolean);
  return records.filter(record => (year === "all" || record.year === year)
    && (type === "all" || record.type === type)
    && words.every(word => record.search.includes(word)));
}

function resultEntry(record, category) {
  const aside = `${category !== "publications" ? `<span class="result-date">${resultEscape(record.date)}</span>` : ""}${record.badge ? `<span class="result-tag">${resultEscape(record.badge)}</span>` : ""}`;
  const linkLabel = category === "publications" ? "論文を見る" : "記事・資料を見る";
  return `<article class="result-entry result-entry--${category}" data-result-id="${resultEscape(record.id)}">
    <div class="result-aside">${aside}</div>
    <div class="result-body"><h3>${resultEscape(record.title)}</h3>${record.authors ? `<p>${resultEscape(record.authors)}</p>` : ""}${record.meta ? `<p>${resultEscape(record.meta)}</p>` : ""}</div>
    ${record.url ? `<a class="result-link" href="${resultEscape(record.url)}" target="_blank" rel="noopener noreferrer" aria-label="${resultEscape(record.title)}：${linkLabel}（新しいタブ）">${linkLabel}<span aria-hidden="true">↗</span></a>` : ""}
  </article>`;
}

function initResults() {
  const panel = document.querySelector("#resultsPanel");
  if (!panel) return;
  const tabs = [...document.querySelectorAll("[data-category]")];
  const form = document.querySelector("#resultsFilters");
  const year = document.querySelector("#resultsYear");
  const search = document.querySelector("#resultsSearch");
  const types = document.querySelector("#resultsTypes");
  const count = document.querySelector("#resultsCount");
  const list = document.querySelector("#resultsList");
  const note = document.querySelector("#resultsNote");
  const warning = document.querySelector("#resultsWarning");
  const cache = new Map();
  let category = "publications";
  let current = null;
  let selectedType = "all";
  let request = 0;

  function setType(type) {
    selectedType = type;
    types.querySelectorAll("button").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.type === type)));
  }

  function render() {
    if (!current) return;
    const records = filterResults(current.records, { year: year.value, query: search.value, type: selectedType });
    const partial = current.failed.length ? "（一部のデータを表示）" : "";
    count.textContent = `${resultCategories[category].label}：${records.length}件${partial}`;
    if (!records.length) {
      list.innerHTML = `<p class="results-message">${current.records.length ? "条件に一致する記録がありません。年やキーワードを変更してください。" : "掲載されている記録はありません。"}</p>`;
      return;
    }
    // A Map retains the descending order of the sorted records, including years.
    const groups = new Map();
    records.forEach(record => {
      if (!groups.has(record.year)) groups.set(record.year, []);
      groups.get(record.year).push(record);
    });
    list.innerHTML = [...groups].map(([groupYear, entries]) => `<section class="results-year-group" aria-labelledby="year-${category}-${groupYear}"><h2 class="results-year-heading" id="year-${category}-${groupYear}">${groupYear === "unknown" ? "年不明" : groupYear}</h2>${entries.map(record => resultEntry(record, category)).join("")}</section>`).join("");
  }

  async function load(nextCategory) {
    category = nextCategory;
    current = null;
    const ticket = ++request;
    const config = resultCategories[category];
    tabs.forEach(tab => {
      const active = tab.dataset.category === category;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panel.setAttribute("aria-labelledby", `tab-${category}`);
    form.reset();
    setType("all");
    year.innerHTML = '<option value="all">すべての年</option>';
    search.placeholder = config.placeholder;
    types.hidden = category !== "publications";
    note.hidden = !config.note;
    note.textContent = config.note || "";
    warning.hidden = true;
    warning.replaceChildren();
    list.setAttribute("aria-busy", "true");
    list.innerHTML = '<p class="results-message">業績を読み込み中です。</p>';
    count.textContent = `${config.label}を読み込み中です。`;
    form.querySelectorAll("button, input, select").forEach(control => { control.disabled = true; });
    if (!cache.has(category)) {
      const loadingCategory = category;
      const pending = Promise.allSettled(config.sources.map(async source => {
        const response = await fetch(`data/csv/${source.file}`, { cache: "no-cache" });
        if (!response.ok) throw new Error(`Could not load ${source.file}`);
        return parseResults(await response.text(), loadingCategory, source);
      })).then(results => ({
        records: results.flatMap(result => result.status === "fulfilled" ? result.value : []).sort((a, b) => b.sort - a.sort),
        failed: results.flatMap((result, i) => result.status === "rejected" ? [config.sources[i].label] : []),
      }));
      cache.set(category, pending);
    }
    const loaded = await cache.get(category);
    if (ticket !== request) return;
    current = loaded;
    list.setAttribute("aria-busy", "false");
    if (loaded.failed.length) {
      warning.hidden = false;
      const message = document.createElement("p");
      message.textContent = `${loaded.failed.join("、")}を読み込めませんでした。`;
      const retry = document.createElement("button");
      retry.type = "button";
      retry.className = "results-retry";
      retry.textContent = "もう一度読み込む";
      retry.addEventListener("click", () => { cache.delete(category); load(category); });
      warning.append(message, retry);
    }
    if (loaded.failed.length === config.sources.length) {
      count.textContent = `${config.label}を読み込めませんでした。`;
      list.innerHTML = '<p class="results-message">時間をおいて、もう一度読み込んでください。</p>';
      return;
    }
    year.innerHTML += resultYears(loaded.records).map(value => `<option value="${value}">${value === "unknown" ? "年不明" : `${value}年`}</option>`).join("");
    form.querySelectorAll("button, input, select").forEach(control => { control.disabled = false; });
    render();
  }

  function categoryFromHash() {
    const hash = window.location.hash.slice(1);
    return Object.hasOwn(resultCategories, hash) ? hash : "publications";
  }

  function activate(next) {
    if (next === category) return;
    window.history.pushState(null, "", `#${next}`);
    load(next);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(tab.dataset.category));
    tab.addEventListener("keydown", event => {
      let target;
      if (event.key === "ArrowRight") target = tabs[(index + 1) % tabs.length];
      if (event.key === "ArrowLeft") target = tabs[(index + tabs.length - 1) % tabs.length];
      if (event.key === "Home") target = tabs[0];
      if (event.key === "End") target = tabs[tabs.length - 1];
      if (target) { event.preventDefault(); target.focus(); activate(target.dataset.category); }
    });
  });
  window.addEventListener("popstate", () => { const next = categoryFromHash(); if (next !== category) load(next); });
  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.slice(1);
    if (Object.hasOwn(resultCategories, hash) && hash !== category) load(hash);
  });
  form.addEventListener("submit", event => event.preventDefault());
  form.addEventListener("reset", event => {
    event.preventDefault();
    year.value = "all";
    search.value = "";
    setType("all");
    render();
  });
  year.addEventListener("change", render);
  search.addEventListener("input", render);
  types.querySelectorAll("button").forEach(button => button.addEventListener("click", () => { setType(button.dataset.type); render(); }));
  document.querySelector("#resultsTop").addEventListener("click", () => document.querySelector("#pageTop").scrollIntoView());
  load(categoryFromHash());
}

initResults();
