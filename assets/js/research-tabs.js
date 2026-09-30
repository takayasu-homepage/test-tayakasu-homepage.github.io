const researchTabs = Array.from(document.querySelectorAll(".research-tabs [role='tab']"));
const researchPanels = Array.from(document.querySelectorAll(".research-panel"));

function selectResearchTheme(themeId, moveFocus = false) {
  const selectedTab = researchTabs.find((tab) => tab.dataset.theme === themeId) || researchTabs[0];
  const selectedId = selectedTab.dataset.theme;
  researchTabs.forEach((tab) => {
    const selected = tab === selectedTab;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  researchPanels.forEach((panel) => { panel.hidden = panel.id !== selectedId; });
  if (moveFocus) selectedTab.focus();
}

function selectThemeFromHash() { selectResearchTheme(window.location.hash.slice(1)); }

researchTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    history.replaceState(null, "", `#${tab.dataset.theme}`);
    selectResearchTheme(tab.dataset.theme);
  });
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? researchTabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + researchTabs.length) % researchTabs.length;
    const nextTab = researchTabs[nextIndex];
    history.replaceState(null, "", `#${nextTab.dataset.theme}`);
    selectResearchTheme(nextTab.dataset.theme, true);
  });
});

window.addEventListener("hashchange", selectThemeFromHash);
selectThemeFromHash();
