document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     아코디언 메뉴
  ========================= */
  const blocks = document.querySelectorAll(".menu-block");

  blocks.forEach((block) => {
    const trigger = block.querySelector(".menu-head");
    const body = block.querySelector(".menu-body");

    if (!trigger || !body) return;

    trigger.addEventListener("click", (e) => {
      if (block.classList.contains("menu-block--link")) return;

      e.preventDefault();

      const isOpen = block.classList.contains("is-open");

      blocks.forEach((item) => {
        if (item.classList.contains("menu-block--link")) return;

        const itemTrigger = item.querySelector(".menu-head");
        const itemBody = item.querySelector(".menu-body");

        item.classList.remove("is-open");

        if (itemTrigger) {
          itemTrigger.setAttribute("aria-expanded", "false");
        }

        if (itemBody) {
          itemBody.style.maxHeight = null;
        }
      });

      if (!isOpen) {
        block.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
        body.style.maxHeight = `${body.scrollHeight}px`;
      }
    });
  });

  /* =========================
     1차 탭 (카테고리)
  ========================= */
  const categoryTabs = document.querySelectorAll(".category-tab");
  const categoryPanels = document.querySelectorAll(".category-panel");

  categoryTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.category;

      categoryTabs.forEach((btn) => {
        btn.classList.remove("is-active");
        btn.setAttribute("aria-selected", "false");
      });

      categoryPanels.forEach((panel) => {
        panel.classList.remove("is-active");
      });

      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");

      const panel = document.querySelector(`[data-category-panel="${target}"]`);
      if (panel) panel.classList.add("is-active");

      const openBody = document.querySelector(".menu-block.is-open .menu-body");
      if (openBody) {
        requestAnimationFrame(() => {
          openBody.style.maxHeight = `${openBody.scrollHeight}px`;
        });
      }
    });
  });

  /* =========================
     2차 탭 (제품 라인업)
  ========================= */
  const subTabs = document.querySelectorAll(".sub-tab");

  subTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const parentPanel = tab.closest(".category-panel");
      if (!parentPanel) return;

      const target = tab.dataset.target;

      const tabs = parentPanel.querySelectorAll(".sub-tab");
      const panels = parentPanel.querySelectorAll(".sub-panel");

      tabs.forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });

      panels.forEach((p) => {
        p.classList.remove("is-active");
      });

      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");

      const panel = parentPanel.querySelector(`[data-sub-panel="${target}"]`);
      if (panel) panel.classList.add("is-active");

      const openBody = document.querySelector(".menu-block.is-open .menu-body");
      if (openBody) {
        requestAnimationFrame(() => {
          openBody.style.maxHeight = `${openBody.scrollHeight}px`;
        });
      }
    });
  });

  /* =========================
     제품 팝업 슬라이더 + 썸네일
  ========================= */
  const modal = document.getElementById("productModal");
  const modalTitle = document.getElementById("productModalTitle");
  const modalMainImage = document.getElementById("modalMainImage");
  const modalCount = document.getElementById("modalCount");
  const modalThumbs = document.getElementById("modalThumbs");
  const modalPrevBtn = document.getElementById("modalPrevBtn");
  const modalNextBtn = document.getElementById("modalNextBtn");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const productCards = document.querySelectorAll(".product-card");

  let currentImages = [];
  let currentIndex = 0;
  let currentTitle = "";

  function renderModalImage() {
    if (!modalMainImage || !modalCount || !modalThumbs || !currentImages.length)
      return;

    modalMainImage.src = currentImages[currentIndex];
    modalMainImage.alt = `${currentTitle} 이미지 ${currentIndex + 1}`;
    modalCount.textContent = `${currentIndex + 1} / ${currentImages.length}`;

    const thumbs = modalThumbs.querySelectorAll(".product-modal__thumb");
    thumbs.forEach((thumb, idx) => {
      thumb.classList.toggle("is-active", idx === currentIndex);
    });
  }

  function createThumbs() {
    if (!modalThumbs) return;

    modalThumbs.innerHTML = "";

    currentImages.forEach((src, idx) => {
      const thumbBtn = document.createElement("button");
      thumbBtn.type = "button";
      thumbBtn.className = "product-modal__thumb";
      thumbBtn.setAttribute("aria-label", `${idx + 1}번째 이미지 보기`);

      const thumbImg = document.createElement("img");
      thumbImg.src = src;
      thumbImg.alt = `${currentTitle} 썸네일 ${idx + 1}`;

      thumbBtn.appendChild(thumbImg);

      thumbBtn.addEventListener("click", () => {
        currentIndex = idx;
        renderModalImage();
      });

      modalThumbs.appendChild(thumbBtn);
    });
  }

  function openModal(title, images) {
    if (!modal || !modalTitle || !images.length) return;

    currentTitle = title;
    currentImages = images;
    currentIndex = 0;

    modalTitle.textContent = currentTitle;
    createThumbs();
    renderModalImage();

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    if (!modal || !modalMainImage || !modalThumbs) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    modalMainImage.src = "";
    modalMainImage.alt = "";
    modalThumbs.innerHTML = "";

    currentImages = [];
    currentIndex = 0;
    currentTitle = "";
  }

  function showPrevImage() {
    if (!currentImages.length) return;
    currentIndex =
      (currentIndex - 1 + currentImages.length) % currentImages.length;
    renderModalImage();
  }

  function showNextImage() {
    if (!currentImages.length) return;
    currentIndex = (currentIndex + 1) % currentImages.length;
    renderModalImage();
  }

  productCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      e.preventDefault();

      const title =
        card.dataset.title ||
        card.querySelector(".product-card__name")?.textContent?.trim() ||
        "제품 상세";

      const images = (card.dataset.images || "")
        .split("|")
        .map((src) => src.trim())
        .filter(Boolean);

      if (!images.length) return;

      openModal(title, images);
    });
  });

  if (modalPrevBtn) {
    modalPrevBtn.addEventListener("click", showPrevImage);
  }

  if (modalNextBtn) {
    modalNextBtn.addEventListener("click", showNextImage);
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeModal);
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (
        e.target.classList.contains("product-modal__overlay") ||
        e.target.dataset.close === "modal"
      ) {
        closeModal();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (!modal || !modal.classList.contains("is-open")) return;

    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft") showPrevImage();
    if (e.key === "ArrowRight") showNextImage();
  });

  /* =========================
     터치 스와이프
  ========================= */
  let touchStartX = 0;
  let touchEndX = 0;

  if (modalMainImage) {
    modalMainImage.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].clientX;
    });

    modalMainImage.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].clientX;
      const diff = touchEndX - touchStartX;

      if (Math.abs(diff) < 40) return;

      if (diff > 0) {
        showPrevImage();
      } else {
        showNextImage();
      }
    });
  }

  /* =========================
     열려 있는 아코디언 높이 재계산
  ========================= */
  window.addEventListener("resize", () => {
    const openBlock = document.querySelector(".menu-block.is-open");
    if (!openBlock) return;

    const openBody = openBlock.querySelector(".menu-body");
    if (!openBody) return;

    openBody.style.maxHeight = `${openBody.scrollHeight}px`;
  });
});
