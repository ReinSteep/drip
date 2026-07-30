const productGrid = document.querySelector("#product-grid");
const productModal = document.querySelector("#product-modal");
const closeProductModalButton =
  document.querySelector("#close-product-modal");

const mainProductImage =
  document.querySelector("#main-product-image");
const thumbnailList =
  document.querySelector("#thumbnail-list");

let activeProduct = null;
let activeImageIndex = 0;
let allProducts = [];

const preloadedProducts = new Set();

/**
 * Vytvoří cestu ke složce produktu.
 */
function getProductFolderPath(folder) {
  return `items/${encodeURIComponent(folder)}`;
}

/**
 * Vytvoří cesty k velkým fotografiím a náhledům.
 */
function createImagePaths(folder, imageCount) {
  const folderPath = getProductFolderPath(folder);

  const fullImages = Array.from(
    { length: imageCount },
    (_, index) => `${folderPath}/${index + 1}.jpg`
  );

  const thumbnails = Array.from(
    { length: imageCount },
    (_, index) => `${folderPath}/${index + 1}-thumb.jpg`
  );

  return {
    fullImages,
    thumbnails
  };
}

/**
 * Předem načte velké fotografie produktu do cache prohlížeče.
 */
function preloadProductImages(product) {
  if (preloadedProducts.has(product.folder)) {
    return;
  }

  product.fullImages.forEach((imagePath) => {
    const image = new Image();
    image.src = imagePath;
  });

  preloadedProducts.add(product.folder);
}

/**
 * Načte products.json a info.json všech produktů.
 */
async function loadProducts() {
  try {
    const productListResponse = await fetch("products.json");

    if (!productListResponse.ok) {
      throw new Error("Nepodařilo se načíst products.json.");
    }

    const productList = await productListResponse.json();

    const products = await Promise.all(
      productList.map(async ({ folder }) => {
        const folderPath = getProductFolderPath(folder);

        const productResponse = await fetch(
          `${folderPath}/info.json`
        );

        if (!productResponse.ok) {
          throw new Error(
            `Nepodařilo se načíst info.json: ${folder}`
          );
        }

        const productInfo = await productResponse.json();
        const imagePaths = createImagePaths(
          folder,
          productInfo.images
        );

        return {
          ...productInfo,
          folder,
          ...imagePaths
        };
      })
    );

    allProducts = products;
    renderProductCards(allProducts);
  } catch (error) {
    console.error(error);

    productGrid.innerHTML =
      "<p>Nepodařilo se načíst katalog.</p>";
  }
}

/**
 * Vykreslí kartu každého produktu.
 */
function renderProductCards(products) {
  productGrid.innerHTML = "";

  products.forEach((product) => {
    const productCard = document.createElement("button");

    productCard.type = "button";
    productCard.className = "product-card";
    productCard.setAttribute(
      "aria-label",
      `Otevřít položku: ${product.name}`
    );

    if (product.available === false) {
      productCard.classList.add("is-unavailable");
    }

    const productImage = document.createElement("img");

    productImage.src = product.thumbnails[0];
    productImage.alt = product.name;
    productImage.loading = "lazy";

    // Pokud náhled neexistuje, načte se velká fotografie.
    productImage.addEventListener(
      "error",
      () => {
        productImage.src = product.fullImages[0];
      },
      { once: true }
    );

    productCard.appendChild(productImage);

    if (product.available === false) {
      const status = document.createElement("span");

      status.className = "product-card-status";
      status.textContent = "PRYČ";

      productCard.appendChild(status);
    }

    // Velké fotografie se začnou načítat už při najetí na kartu.
    productCard.addEventListener(
      "mouseenter",
      () => {
        preloadProductImages(product);
      },
      { once: true }
    );

    productCard.addEventListener(
      "focus",
      () => {
        preloadProductImages(product);
      },
      { once: true }
    );

    productCard.addEventListener("click", () => {
      openProductModal(product);
    });

    productGrid.appendChild(productCard);
  });
}

/**
 * Otevře detail konkrétního produktu.
 */
function openProductModal(product) {
  activeProduct = product;
  activeImageIndex = 0;

  preloadProductImages(product);

  document.querySelector("#product-name").textContent =
    product.name;

  document.querySelector("#product-size").textContent =
    product.size;

  document.querySelector("#product-brand").textContent =
    product.brand;

  document.querySelector("#product-description").textContent =
    product.description;

  const productPrice =
    document.querySelector("#product-price");

  if (product.available === false) {
    productPrice.textContent = "PRYČ – PRODÁNO";
    productPrice.classList.add("is-unavailable");
  } else {
    productPrice.textContent = `${product.price} CZK`;
    productPrice.classList.remove("is-unavailable");
  }

  createThumbnails();
  showImage(0);

  productModal.classList.add("is-open");
  productModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

/**
 * Vytvoří miniatury právě otevřeného produktu.
 */
function createThumbnails() {
  thumbnailList.innerHTML = "";

  activeProduct.thumbnails.forEach(
    (thumbnailPath, index) => {
      const thumbnailButton =
        document.createElement("button");

      thumbnailButton.type = "button";
      thumbnailButton.className = "thumbnail-button";
      thumbnailButton.setAttribute(
        "aria-label",
        `Zobrazit fotografii ${index + 1}`
      );

      const thumbnailImage =
        document.createElement("img");

      thumbnailImage.src = thumbnailPath;
      thumbnailImage.alt =
        `${activeProduct.name}, fotografie ${index + 1}`;
      thumbnailImage.loading = "lazy";

      // Pokud miniatura neexistuje, použije velkou fotografii.
      thumbnailImage.addEventListener(
        "error",
        () => {
          thumbnailImage.src =
            activeProduct.fullImages[index];
        },
        { once: true }
      );

      thumbnailButton.appendChild(thumbnailImage);

      // Na počítači stačí na miniaturu najet kurzorem.
      thumbnailButton.addEventListener("mouseenter", () => {
        showImage(index);
      });

      // Kliknutí zůstává pro mobil a klávesové ovládání.
      thumbnailButton.addEventListener("click", () => {
        showImage(index);
      });

      thumbnailList.appendChild(thumbnailButton);
    }
  );
}

/**
 * Zobrazí vybranou fotografii.
 */
function showImage(index) {
  activeImageIndex = index;

  mainProductImage.src =
    activeProduct.fullImages[index];

  mainProductImage.alt =
    `${activeProduct.name}, fotografie ${index + 1}`;

  const thumbnailButtons =
    thumbnailList.querySelectorAll(".thumbnail-button");

  thumbnailButtons.forEach((button, buttonIndex) => {
    button.classList.toggle(
      "active",
      buttonIndex === index
    );
  });
}

/**
 * Zavře detail produktu.
 */
function closeProductModal() {
  closeProductModalButton.blur();

  productModal.classList.remove("is-open");
  productModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  activeProduct = null;
  activeImageIndex = 0;
}

closeProductModalButton.addEventListener(
  "click",
  closeProductModal
);
const categoryButtons =
  document.querySelectorAll(".category-button");

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedCategory = button.dataset.category;

    categoryButtons.forEach((categoryButton) => {
      categoryButton.classList.toggle(
        "active",
        categoryButton === button
      );
    });

    if (selectedCategory === "all") {
      renderProductCards(allProducts);
      return;
    }

    const filteredProducts = allProducts.filter(
      (product) =>
        product.category
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") === selectedCategory
    );

    renderProductCards(filteredProducts);
  });
});

loadProducts();
