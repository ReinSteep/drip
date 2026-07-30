async function loadProductList() {
  const response = await fetch("products.json");
  const productList = await response.json();

  const firstProductFolder = productList[0].folder;

  const productResponse = await fetch(
    `items/${encodeURIComponent(firstProductFolder)}/info.json`
  );

  const productInfo = await productResponse.json();

  const productGrid = document.querySelector("#product-grid");
  const productModal = document.querySelector("#product-modal");
  const closeProductModalButton =
    document.querySelector("#close-product-modal");

  const mainProductImage = document.querySelector("#main-product-image");
  const thumbnailList = document.querySelector("#thumbnail-list");

  const productCard = document.createElement("button");
  productCard.type = "button";
  productCard.className = "product-card";
  productCard.setAttribute(
    "aria-label",
    `Otevřít položku: ${productInfo.name}`
  );

  const productImage = document.createElement("img");
  productImage.src =
    `items/${encodeURIComponent(firstProductFolder)}/1.jpg`;
  productImage.alt = productInfo.name;

  productCard.appendChild(productImage);

  const imagePaths = Array.from(
    { length: productInfo.images },
    (_, index) =>
      `items/${encodeURIComponent(firstProductFolder)}/${index + 1}.jpg`
  );

  function showImage(index) {
    mainProductImage.src = imagePaths[index];
    mainProductImage.alt =
      `${productInfo.name}, fotografie ${index + 1}`;

    const thumbnailButtons =
      thumbnailList.querySelectorAll(".thumbnail-button");

    thumbnailButtons.forEach((button, buttonIndex) => {
      button.classList.toggle("active", buttonIndex === index);
    });
  }

  function createThumbnails() {
    thumbnailList.innerHTML = "";

    imagePaths.forEach((imagePath, index) => {
      const thumbnailButton = document.createElement("button");
      thumbnailButton.type = "button";
      thumbnailButton.className = "thumbnail-button";
      thumbnailButton.setAttribute(
        "aria-label",
        `Zobrazit fotografii ${index + 1}`
      );

      const thumbnailImage = document.createElement("img");
      thumbnailImage.src = imagePath;
      thumbnailImage.alt =
        `${productInfo.name}, fotografie ${index + 1}`;

      thumbnailButton.appendChild(thumbnailImage);

      thumbnailButton.addEventListener("click", () => {
        showImage(index);
      });

      thumbnailList.appendChild(thumbnailButton);
    });
  }

  productCard.addEventListener("click", () => {
    document.querySelector("#product-name").textContent =
      productInfo.name;

    document.querySelector("#product-size").textContent =
      productInfo.size;

    document.querySelector("#product-brand").textContent =
      productInfo.brand;

    document.querySelector("#product-description").textContent =
      productInfo.description;

    document.querySelector("#product-price").textContent =
      `${productInfo.price} CZK`;

    createThumbnails();
    showImage(0);

    productModal.classList.add("is-open");
    productModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  });

  closeProductModalButton.addEventListener("click", () => {
    productModal.classList.remove("is-open");
    productModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  });

  productGrid.appendChild(productCard);
}

loadProductList();
