/* One CSV supplies both the latest updates and the full news archive. */
(() => {
  'use strict';

  function parseCsv(text) {
    const rows = [];
    let row = [], field = '', quoted = false, closed = false;
    function endField() { row.push(field); field = ''; closed = false; }
    function endRow() { endField(); if (row.some(cell => cell.trim())) rows.push(row); row = []; }
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quoted) {
        if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
        else if (c === '"') { quoted = false; closed = true; }
        else field += c;
      } else if (c === ',') endField();
      else if (c === '\r' || c === '\n') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        endRow();
      } else if (c === '"' && !field && !closed) quoted = true;
      else if (closed || c === '"') throw new Error('CSVの引用符を確認してください。');
      else field += c;
    }
    if (quoted) throw new Error('CSVの引用符が閉じられていません。');
    endRow();
    return rows;
  }

  function parseDate(value) {
    // Sort ranges by their start date, retaining the complete date for display.
    const match = value.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})(?=$|[-〜～])/);
    if (!match) throw new Error(`日付を確認してください: ${value}`);
    const [, y, m, d] = match;
    const date = new Date(Date.UTC(+y, +m - 1, +d));
    if (date.getUTCFullYear() !== +y || date.getUTCMonth() !== +m - 1 || date.getUTCDate() !== +d) {
      throw new Error(`存在しない日付です: ${value}`);
    }
    return { year:y, sort:date.getTime(), iso:`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}` };
  }

  function parseNews(text) {
    const input = text.replace(/^\ufeff/, '').trim();
    if (!input) return [];
    let rows;
    if (/^\d{4}[./-]\d{1,2}[./-]\d{1,2}(?:-\d{1,2})?,,/.test(input)) {
      // Legacy format: date,,body. Only the first two commas are separators.
      rows = input.split(/\r?\n/).filter(line => line.trim()).map((line, i) => {
        const match = line.match(/^([^,]+),,([\s\S]*)$/);
        if (!match) throw new Error(`CSVの${i + 1}行目を確認してください。`);
        return { date:match[1].trim(), body:match[2].replace(/,+\s*$/, '').trim() };
      });
    } else {
      const table = parseCsv(input);
      const headers = table.shift().map(value => value.trim());
      const dateIndex = headers.indexOf('date'), bodyIndex = headers.indexOf('body');
      if (dateIndex < 0 || bodyIndex < 0 || new Set(headers).size !== headers.length) {
        throw new Error('CSVにはdateとbodyの項目名が必要です。');
      }
      rows = table.map((values, i) => {
        if (values.length !== headers.length) throw new Error(`CSVの${i + 2}行目の列数を確認してください。`);
        return { date:values[dateIndex].trim(), body:values[bodyIndex].trim() };
      });
    }
    return rows.map((row, index) => {
      if (!row.body) throw new Error(`本文が空です: ${row.date}`);
      const date = parseDate(row.date);
      return { ...row, ...date, index, label:row.date.replace(/[-/]/g, '.'), id:`news-${index + 1}` };
    }).sort((a, b) => b.sort - a.sort || a.index - b.index);
  }

  function resolveNewsUrl(value, base) {
    const path = String(value || '').trim().replace(/^\.\//, '');
    if (!path) return '';
    try {
      let url;
      if (/^(?:pdf|images)\//i.test(path)) url = new URL(`data/${path}`, base);
      // Preserve links to the original PHP archive; these are not local Jekyll pages.
      else if (/^seminar_(?:econophys|dstructure)\.php$/.test(path)) url = new URL(path, 'https://takayasu-research-lab.com/');
      else url = new URL(path, base);
      return /^(https?:|mailto:)$/.test(url.protocol) ? url.href : '';
    } catch { return ''; }
  }

  function newsBody(html, base) {
    const source = document.createElement('template');
    source.innerHTML = html;
    const output = document.createDocumentFragment();
    const allowed = new Set(['BR', 'P', 'B', 'STRONG', 'EM', 'I', 'MARK', 'A', 'IMG', 'UL', 'OL', 'LI']);
    const blocked = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH']);
    function copy(node, parent) {
      if (node.nodeType === 3) { parent.append(document.createTextNode(node.textContent)); return; }
      if (node.nodeType !== 1 || blocked.has(node.tagName)) return;
      if (!allowed.has(node.tagName)) { node.childNodes.forEach(child => copy(child, parent)); return; }
      const el = document.createElement(node.tagName.toLowerCase());
      if (node.tagName === 'A') {
        const href = resolveNewsUrl(node.getAttribute('href'), base);
        if (href) { el.href = href; el.target = '_blank'; el.rel = 'noopener noreferrer'; }
      }
      if (node.tagName === 'IMG') {
        const src = resolveNewsUrl(node.getAttribute('src'), base);
        if (!/^https?:/.test(src)) return;
        el.src = src; el.alt = node.getAttribute('alt') || 'ニュースの関連写真';
        el.loading = 'lazy'; el.decoding = 'async';
      }
      node.childNodes.forEach(child => copy(child, el));
      parent.append(el);
    }
    source.content.childNodes.forEach(node => copy(node, output));
    return output;
  }

  function initNews() {
    const root = document.querySelector('[data-news]');
    if (!root) return;
    const list = root.querySelector('[data-news-list]');
    const status = root.querySelector('[data-news-status]');
    const select = root.querySelector('[data-news-year]');
    const archive = root.dataset.news === 'archive';
    const base = new URL(root.dataset.siteBase, location.href);
    let records = [];
    let resize;

    function createArticle(record) {
      const article = document.createElement('article');
      article.className = 'news-item';
      article.id = record.id;
      const time = document.createElement('time');
      time.className = 'news-date'; time.dateTime = record.iso;
      time.textContent = record.date.replace(/[/-]/g, '.');
      const content = document.createElement('div'); content.className = 'news-content';
      const full = document.createElement('div'); full.className = 'news-text'; full.id = `${record.id}-body`;
      full.append(newsBody(record.body, base));
      content.append(full); article.append(time, content);
      if (!archive) {
        const preview = document.createElement('p'); preview.className = 'news-excerpt';
        const plain = full.cloneNode(true);
        plain.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
        preview.textContent = plain.textContent.trim();
        const button = document.createElement('button');
        button.className = 'news-toggle'; button.type = 'button';
        button.textContent = '続きを読む'; button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-controls', full.id);
        button.setAttribute('aria-label', `${time.textContent}のお知らせを続きを読む`);
        full.hidden = true; content.prepend(preview); content.append(button);
        article.updateExcerpt = () => {
          if (button.getAttribute('aria-expanded') === 'true') return;
          preview.hidden = false;
          const overflow = preview.scrollHeight > preview.clientHeight + 1;
          preview.hidden = !overflow; full.hidden = overflow; button.hidden = !overflow;
        };
        button.addEventListener('click', () => {
          const expanded = button.getAttribute('aria-expanded') !== 'true';
          button.setAttribute('aria-expanded', String(expanded));
          button.textContent = expanded ? '閉じる' : '続きを読む';
          button.setAttribute('aria-label', `${time.textContent}のお知らせを${expanded ? '閉じる' : '続きを読む'}`);
          preview.hidden = expanded; full.hidden = !expanded;
          if (!expanded) article.updateExcerpt();
        });
      }
      return article;
    }

    function render() {
      resize?.disconnect();
      const year = select?.value || 'all';
      const filtered = archive ? records.filter(item => year === 'all' || item.year === year) : records.slice(0, 5);
      list.replaceChildren();
      if (archive) {
        let currentYear, yearList;
        for (const record of filtered) {
          if (record.year !== currentYear) {
            currentYear = record.year;
            const section = document.createElement('section'); section.className = 'news-year-group';
            const heading = document.createElement('h2'); heading.className = 'news-year-heading'; heading.id = `year-${currentYear}`; heading.textContent = `${currentYear}年`;
            section.setAttribute('aria-labelledby', heading.id);
            yearList = document.createElement('div'); yearList.className = 'news-year-list';
            section.append(heading, yearList); list.append(section);
          }
          yearList.append(createArticle(record));
        }
      } else {
        const articles = filtered.map(createArticle); list.append(...articles);
        const update = () => articles.forEach(article => article.updateExcerpt());
        requestAnimationFrame(update);
        if (typeof ResizeObserver !== 'undefined') { resize = new ResizeObserver(update); resize.observe(list); }
        document.fonts?.ready.then(update);
      }
      status.textContent = filtered.length ? (archive ? `${year === 'all' ? 'すべての年' : year + '年'} · ${filtered.length}件` : '') : 'お知らせはまだありません。';
    }

    async function load() {
      root.setAttribute('aria-busy', 'true');
      if (select) select.disabled = true;
      status.textContent = 'お知らせを読み込み中です。';
      try {
        const response = await fetch(new URL(root.dataset.newsSource, location.href));
        if (!response.ok) throw new Error(`CSV load failed: ${response.status}`);
        records = parseNews(await response.text());
        if (select) {
          select.replaceChildren(new Option('すべての年', 'all'));
          [...new Set(records.map(item => item.year))].forEach(year => select.add(new Option(`${year}年`, year)));
          const selected = new URL(location.href).searchParams.get('year');
          if ([...select.options].some(option => option.value === selected)) select.value = selected;
          select.disabled = false;
        }
        render();
      } catch (error) {
        console.error('NEWS:', error);
        status.textContent = 'お知らせを読み込めませんでした。';
        const retry = document.createElement('button'); retry.type = 'button'; retry.className = 'news-toggle'; retry.textContent = '再読み込み';
        retry.addEventListener('click', load); list.replaceChildren(retry);
      } finally { root.removeAttribute('aria-busy'); }
    }
    select?.addEventListener('change', () => {
      const url = new URL(location.href);
      if (select.value === 'all') url.searchParams.delete('year'); else url.searchParams.set('year', select.value);
      history.replaceState(null, '', url); render();
    });
    load();
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { parseNews, parseDate, resolveNewsUrl };
  if (typeof document !== 'undefined') initNews();
})();
