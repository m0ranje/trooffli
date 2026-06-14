const stage = document.querySelector("#stage");
const buttons = document.querySelectorAll("[data-panel]");
const pages = document.querySelectorAll("[data-page]");
const photoInput = document.querySelector("#photo-input");
const photoGrid = document.querySelector("#photo-grid");
const photoViewer = document.querySelector("#photo-viewer");
const viewerImage = document.querySelector("#viewer-image");
const viewerCaption = document.querySelector("#viewer-caption");
const viewerClose = document.querySelector(".viewer-close");
const viewerPrev = document.querySelector(".viewer-prev");
const viewerNext = document.querySelector(".viewer-next");
let activePhotoIndex = 0;

const preparePhotoCards = () => {
  photoGrid.querySelectorAll(".photo-card").forEach((card) => {
    const image = card.querySelector("img");
    const caption = card.querySelector("figcaption")?.textContent.trim();

    if (!image) return;

    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Открыть фото: ${caption || image.alt || "фотография"}`);
  });
};

const setPanel = (panelName) => {
  buttons.forEach((button) => {
    const isActive = button.dataset.panel === panelName;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  pages.forEach((page) => {
    page.classList.toggle("is-visible", page.dataset.page === panelName);
  });
};

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    setPanel(button.dataset.panel);
    history.replaceState(null, "", `#${button.dataset.panel}`);
  });
});

const updateFromHash = () => {
  const pageFromHash = location.hash.replace("#", "");

  if (pageFromHash === "about" || pageFromHash === "life") {
    setPanel(pageFromHash);
  } else {
    setPanel("home");
  }
};

window.addEventListener("hashchange", updateFromHash);
updateFromHash();

photoInput.addEventListener("change", () => {
  [...photoInput.files].forEach((file, index) => {
    if (!file.type.startsWith("image/")) return;

    const imageUrl = URL.createObjectURL(file);
    const card = document.createElement("figure");
    card.className = "photo-card";
    card.innerHTML = `
      <img src="${imageUrl}" alt="Фотография из моей жизни">
      <figcaption>Фото ${photoGrid.children.length + index + 1}</figcaption>
    `;
    photoGrid.append(card);
  });

  preparePhotoCards();
  photoInput.value = "";
});

const getPhotoItems = () => {
  return [...photoGrid.querySelectorAll(".photo-card")]
    .map((card) => {
      const image = card.querySelector("img");
      const caption = card.querySelector("figcaption");

      if (!image) return null;

      return {
        alt: image.alt,
        caption: caption?.textContent.trim() || image.alt || "Фотография",
        src: image.currentSrc || image.src,
      };
    })
    .filter(Boolean);
};

const showPhoto = (index) => {
  const photos = getPhotoItems();
  if (!photos.length) return;

  activePhotoIndex = (index + photos.length) % photos.length;
  const photo = photos[activePhotoIndex];

  viewerImage.src = photo.src;
  viewerImage.alt = photo.alt;
  viewerCaption.textContent = photo.caption;
};

const openPhotoViewer = (index) => {
  showPhoto(index);
  photoViewer.classList.add("is-open");
  photoViewer.setAttribute("aria-hidden", "false");
  viewerClose.focus();
};

const closePhotoViewer = () => {
  photoViewer.classList.remove("is-open");
  photoViewer.setAttribute("aria-hidden", "true");
  viewerImage.removeAttribute("src");
  viewerImage.alt = "";
};

photoGrid.addEventListener("click", (event) => {
  const card = event.target.closest(".photo-card");
  if (!card || !photoGrid.contains(card) || !card.querySelector("img")) return;

  const cards = [...photoGrid.querySelectorAll(".photo-card")];
  openPhotoViewer(cards.indexOf(card));
});

photoGrid.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;

  const card = event.target.closest(".photo-card");
  if (!card || !photoGrid.contains(card) || !card.querySelector("img")) return;

  event.preventDefault();
  const cards = [...photoGrid.querySelectorAll(".photo-card")];
  openPhotoViewer(cards.indexOf(card));
});

viewerClose.addEventListener("click", closePhotoViewer);
viewerPrev.addEventListener("click", () => showPhoto(activePhotoIndex - 1));
viewerNext.addEventListener("click", () => showPhoto(activePhotoIndex + 1));

photoViewer.addEventListener("click", (event) => {
  if (event.target === photoViewer) {
    closePhotoViewer();
  }
});

window.addEventListener("keydown", (event) => {
  if (!photoViewer.classList.contains("is-open")) return;

  if (event.key === "Escape") closePhotoViewer();
  if (event.key === "ArrowLeft") showPhoto(activePhotoIndex - 1);
  if (event.key === "ArrowRight") showPhoto(activePhotoIndex + 1);
});

stage.addEventListener("pointermove", (event) => {
  const rect = stage.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;

  stage.style.setProperty("--tilt-x", `${(-y * 1.4).toFixed(2)}deg`);
  stage.style.setProperty("--tilt-y", `${(x * 1.4).toFixed(2)}deg`);
});

stage.addEventListener("pointerleave", () => {
  stage.style.removeProperty("--tilt-x");
  stage.style.removeProperty("--tilt-y");
});

preparePhotoCards();
