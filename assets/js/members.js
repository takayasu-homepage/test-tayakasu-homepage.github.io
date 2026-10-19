const memberImageBase = "data/images/member/";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];
    if (char === '"') {
      if (quoted && nextChar === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && nextChar === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  row.push(value);
  if (row.some((cell) => cell.trim())) rows.push(row);
  if (!rows.length) return [];

  const headers = rows.shift().map((header) => header.replace(/^\uFEFF/, "").trim());
  return rows.map((cells) => headers.reduce((entry, header, index) => {
    entry[header] = (cells[index] || "").trim();
    return entry;
  }, {}));
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));
}

function textWithBreaks(value) {
  return String(value || "").split(/<br\s*\/?\s*>/i).map(escapeHtml).join("<br>");
}

function safeExternalLink(value) {
  return /^https?:\/\//i.test(value || "") ? value : "";
}

function profileUrl(name) {
  if (name.includes("高安 美佐子")) return "misako.html";
  if (name.includes("高安 秀樹")) return "hideki.html";
  return "";
}

function memberCard(member) {
  const specialty = member.specialty.replace(/^専門[：:]\s*/, "");
  const profile = profileUrl(member.name);
  const homepage = safeExternalLink(member.homepage);
  return `
    <article class="former-card">
      <img src="${memberImageBase}${escapeHtml(member.photo)}" alt="${escapeHtml(member.name)}" loading="lazy" decoding="async">
      <div>
        <p class="member-category">${escapeHtml(member.category)}</p>
        <h4>${escapeHtml(member.name)}</h4>
        ${member.affiliation ? `<p class="member-affiliation">${escapeHtml(member.affiliation)}</p>` : ""}
        ${specialty ? `<p class="member-specialty">${escapeHtml(specialty)}</p>` : ""}
        ${member.email ? `<p class="member-contact"><span>Mail</span>${escapeHtml(member.email)}</p>` : ""}
        ${profile ? `<a class="member-detail-link" href="${profile}">詳細プロフィールを見る</a>` : ""}
        ${homepage ? `<a class="member-detail-link" href="${escapeHtml(homepage)}" target="_blank" rel="noopener">個人ページを見る</a>` : ""}
      </div>
    </article>`;
}

function renderCurrentFaculty(members) {
  const core = members.filter((member) => member.category === "コアメンバー");
  const visiting = members.filter((member) => member.category === "客員教員");
  document.querySelector("#coreMembers").innerHTML = core.map(memberCard).join("");
  document.querySelector("#visitingMembers").innerHTML = visiting.map(memberCard).join("");
  document.querySelector("#coreMembers").setAttribute("aria-busy", "false");
  document.querySelector("#visitingMembers").setAttribute("aria-busy", "false");
}

function personRow(member, secondaryLabel = "") {
  const homepage = safeExternalLink(member.homepage);
  return `
    <article class="member-list-row">
      <div>
        <h5>${escapeHtml(member.name)}</h5>
        ${secondaryLabel ? `<p>${textWithBreaks(secondaryLabel)}</p>` : ""}
      </div>
      <div class="member-list-contact">
        ${member.email ? `<p><span>Mail</span>${escapeHtml(member.email)}</p>` : ""}
        ${homepage ? `<a href="${escapeHtml(homepage)}" target="_blank" rel="noopener">個人ページ</a>` : ""}
      </div>
    </article>`;
}

function renderStudents(members) {
  const order = ["博士課程学生", "修士課程学生", "学部生", "秘書"];
  const groups = order.map((category) => {
    const entries = members.filter((member) => member.category === category);
    if (!entries.length) return "";
    return `
      <section class="member-list-group">
        <div class="member-list-group-title"><h4>${escapeHtml(category)}</h4></div>
        <div>${entries.map((member) => personRow(member, member.theme)).join("")}</div>
      </section>`;
  }).join("");
  document.querySelector("#studentGroups").innerHTML = groups;
  document.querySelector("#studentGroups").setAttribute("aria-busy", "false");
}

function formerFacultyCard(member) {
  const homepage = safeExternalLink(member.homepage);
  return `
    <article class="former-card">
      <img src="${memberImageBase}${escapeHtml(member.photo)}" alt="${escapeHtml(member.name)}" loading="lazy" decoding="async">
      <div>
        <p class="member-category">${escapeHtml(member.category)}</p>
        <h4>${escapeHtml(member.name)}</h4>
        <p>${textWithBreaks(member.period)}</p>
        ${homepage ? `<a href="${escapeHtml(homepage)}" target="_blank" rel="noopener">個人ページ</a>` : ""}
      </div>
    </article>`;
}

function renderFormerFaculty(members) {
  document.querySelector("#formerFaculty").innerHTML = members.map(formerFacultyCard).join("");
  document.querySelector("#formerFaculty").setAttribute("aria-busy", "false");
}

function renderAlumni(members) {
  const groups = [];
  members.forEach((member) => {
    let group = groups.find((entry) => entry.category === member.category);
    if (!group) {
      group = { category: member.category, members: [] };
      groups.push(group);
    }
    group.members.push(member);
  });
  document.querySelector("#alumniList").innerHTML = groups.map((group) => `
    <section class="alumni-group">
      <div class="member-list-group-title"><h4>${escapeHtml(group.category)}</h4></div>
      ${group.members.map((member) => personRow(member, member.destination ? `現在・転出先：${member.destination}` : "")).join("")}
    </section>`).join("");
  document.querySelector("#alumniList").setAttribute("aria-busy", "false");
}

function renderTheses(entries) {
  const years = [];
  entries.forEach((entry) => {
    let year = years.find((group) => group.year === entry.year);
    if (!year) {
      year = { year: entry.year, entries: [] };
      years.push(year);
    }
    year.entries.push(entry);
  });
  years.sort((a, b) => Number(b.year) - Number(a.year));
  document.querySelector("#thesisYears").innerHTML = years.map((group) => `
    <section class="thesis-year">
      <div class="thesis-year-heading"><h3>${escapeHtml(group.year)}年度</h3></div>
      <div class="thesis-table-wrap">
        <table class="thesis-table">
          <thead><tr><th scope="col">氏名</th><th scope="col">研究テーマ</th><th scope="col">学位</th></tr></thead>
          <tbody>
            ${group.entries.map((entry) => `<tr><td data-label="氏名">${escapeHtml(entry.name)}</td><td data-label="研究テーマ">${escapeHtml(entry.theme)}</td><td data-label="学位">${escapeHtml(entry.degree)}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
    </section>`).join("");
  document.querySelector("#thesisYears").setAttribute("aria-busy", "false");
}

async function loadCsv(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  return parseCsv(await response.text());
}

Promise.all([
  loadCsv("data/csv/member_unit_now.csv"),
  loadCsv("data/csv/member_now.csv"),
  loadCsv("data/csv/member_unit_old.csv"),
  loadCsv("data/csv/member_old.csv"),
  loadCsv("data/csv/member_paper.csv"),
]).then(([faculty, students, formerFaculty, alumni, theses]) => {
  renderCurrentFaculty(faculty);
  renderStudents(students);
  renderFormerFaculty(formerFaculty);
  renderAlumni(alumni);
  renderTheses(theses);
}).catch((error) => {
  console.error("Member data load failed", error);
  document.querySelectorAll("[aria-busy='true']").forEach((container) => {
    container.setAttribute("aria-busy", "false");
    container.innerHTML = '<p class="members-message members-error">データを読み込めませんでした。時間をおいて再読み込みしてください。</p>';
  });
});
