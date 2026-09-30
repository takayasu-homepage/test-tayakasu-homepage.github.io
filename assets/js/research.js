const researchDetailModalElement = document.querySelector("#researchDetailModal");
const researchDetailModalTitle = document.querySelector("#researchDetailModalTitle");
const researchDetailModalBody = document.querySelector("#researchDetailModalBody");

if (researchDetailModalElement && researchDetailModalTitle && researchDetailModalBody) {
  const researchDetailModal = new bootstrap.Modal(researchDetailModalElement);
  document.querySelectorAll("[data-research-detail]").forEach((button) => {
    button.addEventListener("click", () => {
      const detailId = button.dataset.researchDetail;
      const template = document.querySelector(`#detail-${detailId}`);
      if (!template) return;
      researchDetailModalTitle.textContent = button.dataset.researchTitle || "研究紹介";
      researchDetailModalBody.replaceChildren(template.content.cloneNode(true));
      researchDetailModal.show();
    });
  });
}
