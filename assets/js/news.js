const newsList = document.querySelector("#newsList");

function parseCsv(text) {
  const rows = text.trim().split(/\r?\n/);
  const headers = rows.shift().split(",");
  return rows.map((row) => {
    const values = row.split(",");
    return headers.reduce((entry, header, index) => {
      entry[header.trim()] = (values[index] || "").trim();
      return entry;
    }, {});
  });
}

function renderNews(items) {
  const sortedItems = items
    .filter((item) => item.date && item.title)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 12);

  if (!sortedItems.length) {
    newsList.innerHTML = '<p class="news-loading">表示できるNEWSがありません。</p>';
    return;
  }

  newsList.innerHTML = sortedItems
    .map((item) => `
      <article class="news-item">
        <time class="news-date" datetime="${item.date}">${item.date}</time>
        <div>
          <h3 class="news-title">${item.title}</h3>
          <p class="news-text">${item.body || "NEWS本文をここに入れます。"}</p>
        </div>
      </article>
    `)
    .join("");
}

fetch("assets/data/news.csv")
  .then((response) => {
    if (!response.ok) {
      throw new Error("CSV load failed");
    }
    return response.text();
  })
  .then((text) => renderNews(parseCsv(text)))
  .catch(() => {
    newsList.innerHTML = '<p class="news-loading">assets/data/news.csv を読み込めませんでした。</p>';
  });
