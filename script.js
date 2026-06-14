const stage = document.querySelector("#stage");
const buttons = document.querySelectorAll("[data-panel]");
const pages = document.querySelectorAll("[data-page]");
const photoInput = document.querySelector("#photo-input");
const photoGrid = document.querySelector("#photo-grid");

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

  photoInput.value = "";
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
