async function loadProductList() {
  const response = await fetch("products.json");
  const productList = await response.json();

  const firstProductFolder = productList[0].folder;
  const encodedFolder = encodeURIComponent(firstProductFolder);

  const productResponse = await fetch(
    `items/${encodedFolder}/info.json`
  );

  const productInfo = await productResponse.json();

  const productGrid = document.querySelector("#product-grid");
  const productModal = document.querySelector("#product-modal");
  const closeProductModalButton =
    document.querySelector("#close-product-modal");

  const mainProductImage = document.querySelector("#main-product-image");
  const thumbnailList = document.querySelector("#thumbnail-list");

  const fullImagePaths = Array.from(
    { length: productInfo.images },
    (_, index) => `items/${encodedFolder}/${index + 1}.jpg`
  );

  const thumbnailImagePaths = Array.from(
    { length: productInfo.images },
    (_, index) => `items/${encodedFolder}/${index + 1}-thumb.jpg`
  );

  const productCard = document.createElement("button");
  productCard.type = "button";
  productCard.className = "product-card";
  productCard.setAttribute(
    "aria-label",
    `Otevřít položku: ${productInfo.name}`
  );

  const productImage = document.createElement("img");
  productImage.src = thumbnailImagePaths[0];
  productImage.alt = productInfo.name;

  // Pokud náhled neexistuje, použije se automaticky velká fotografie.
  productImage.addEventListener(
    "error",
    () => {
      productImage.src = fullImagePaths[0];
    },
    { once: true }
  );

  productCard.appendChild(productImage);

  function showImage(index) {
    mainProductImage.src = fullImagePaths[index];
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

    thumbnailImagePaths.forEach((thumbnailPath, index) => {
      const thumbnailButton = document.createElement("button");
      thumbnailButton.type = "button";
      thumbnailButton.className = "thumbnail-button";
      thumbnailButton.setAttribute(
        "aria-label",
        `Zobrazit fotografii ${index + 1}`
      );

      const thumbnailImage = document.createElement("img");
      thumbnailImage.src = thumbnailPath;
      thumbnailImage.alt =
        `${productInfo.name}, fotografie ${index + 1}`;
      thumbnailImage.loading = "lazy";

      // Pokud miniatura neexistuje, použije se velká fotografie.
      thumbnailImage.addEventListener(
        "error",
        () => {
          thumbnailImage.src = fullImagePaths[index];
        },
        { once: true }
      );

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
