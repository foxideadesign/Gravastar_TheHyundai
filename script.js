document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     아코디언 메뉴
  ========================= */
  const blocks = document.querySelectorAll(".menu-block");

  function syncOpenAccordionHeight() {
    const openBlock = document.querySelector(".menu-block.is-open");
    if (!openBlock) return;

    const openBody = openBlock.querySelector(".menu-body");
    if (!openBody) return;

    requestAnimationFrame(() => {
      openBody.style.maxHeight = `${openBody.scrollHeight}px`;
    });
  }

  blocks.forEach((block) => {
    const trigger = block.querySelector(".menu-head");
    const body = block.querySelector(".menu-body");

    if (!trigger || !body) return;

    trigger.addEventListener("click", (e) => {
      e.preventDefault();

      const isOpen = block.classList.contains("is-open");

      blocks.forEach((item) => {
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
     제품 팝업
  ========================= */
  const modal = document.getElementById("productModal");
  const modalTitle = document.getElementById("productModalTitle");
  const modalMainImage = document.getElementById("modalMainImage");
  const modalCount = document.getElementById("modalCount");
  const modalThumbs = document.getElementById("modalThumbs");
  const modalPrevBtn = document.getElementById("modalPrevBtn");
  const modalNextBtn = document.getElementById("modalNextBtn");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const modalDetailSection = document.getElementById("modalDetailSection");
  const modalDetailImages = document.getElementById("modalDetailImages");
  const modalSpecSection = document.getElementById("modalSpecSection");
  const modalSpecContent = document.getElementById("modalSpecContent");
  const modalScroll = modal
    ? modal.querySelector(".product-modal__scroll")
    : null;
  const productCards = document.querySelectorAll(".product-card");

  let currentImages = [];
  let currentIndex = 0;
  let currentTitle = "";

  function parseImageList(value) {
    return (value || "")
      .split("|")
      .map((src) => src.trim())
      .filter(Boolean);
  }

  function renderModalImage() {
    if (
      !modalMainImage ||
      !modalCount ||
      !modalThumbs ||
      !currentImages.length
    ) {
      return;
    }

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

  function renderDetailImages(detailImages) {
    if (!modalDetailSection || !modalDetailImages) return;

    modalDetailImages.innerHTML = "";

    if (!detailImages.length) {
      modalDetailSection.hidden = true;
      return;
    }

    detailImages.forEach((src, idx) => {
      const figure = document.createElement("figure");
      figure.className = "product-modal__detail-image";

      const img = document.createElement("img");
      img.src = src;
      img.alt = `${currentTitle} 상세 이미지 ${idx + 1}`;
      img.loading = "lazy";

      figure.appendChild(img);
      modalDetailImages.appendChild(figure);
    });

    modalDetailSection.hidden = false;
  }

  function renderSpecTemplate(card) {
    if (!modalSpecSection || !modalSpecContent) return;

    modalSpecContent.innerHTML = "";

    const selector = card.dataset.specTemplate;
    if (!selector) {
      modalSpecSection.hidden = true;
      return;
    }

    const template = document.querySelector(selector);
    if (!template) {
      modalSpecSection.hidden = true;
      return;
    }

    const fragment = template.content.cloneNode(true);
    modalSpecContent.appendChild(fragment);
    modalSpecSection.hidden = false;
  }

  function openModal(card) {
    if (!modal || !modalTitle) return;

    const title =
      card.dataset.title ||
      card.querySelector(".product-card__name")?.textContent?.trim() ||
      "제품 상세";

    const images = parseImageList(card.dataset.images);
    const detailImages = parseImageList(card.dataset.detailImages);

    if (!images.length) return;

    currentTitle = title;
    currentImages = images;
    currentIndex = 0;

    modalTitle.textContent = currentTitle;
    createThumbs();
    renderModalImage();
    renderDetailImages(detailImages.length ? detailImages : images);
    renderSpecTemplate(card);

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    if (modalScroll) {
      modalScroll.scrollTop = 0;
    }
  }

  function closeModal() {
    if (!modal) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    if (modalMainImage) {
      modalMainImage.src = "";
      modalMainImage.alt = "";
    }

    if (modalThumbs) modalThumbs.innerHTML = "";
    if (modalDetailImages) modalDetailImages.innerHTML = "";
    if (modalSpecContent) modalSpecContent.innerHTML = "";
    if (modalDetailSection) modalDetailSection.hidden = true;
    if (modalSpecSection) modalSpecSection.hidden = true;

    if (modalScroll) {
      modalScroll.scrollTop = 0;
    }

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
      openModal(card);
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

  window.addEventListener("resize", syncOpenAccordionHeight);
});
