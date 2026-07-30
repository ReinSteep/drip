async function loadProductList() {
  const response = await fetch("products.json");
  const productList = await response.json();

  const firstProductFolder = productList[0].folder;

  const productResponse = await fetch(
    `items/${encodeURIComponent(firstProductFolder)}/info.json`
  );

  const productInfo = await productResponse.json();

const productGrid = document.querySelector("#product-grid");

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
productCard.addEventListener("click", () => {
  const productModal = document.querySelector("#product-modal");
  const mainProductImage = document.querySelector("#main-product-image");

  document.querySelector("#product-name").textContent = productInfo.name;
  document.querySelector("#product-size").textContent = productInfo.size;
  document.querySelector("#product-brand").textContent = productInfo.brand;
  document.querySelector("#product-description").textContent =
    productInfo.description;
  document.querySelector("#product-price").textContent =
    `${productInfo.price} CZK`;

  mainProductImage.src =
    `items/${encodeURIComponent(firstProductFolder)}/1.jpg`;
  mainProductImage.alt = productInfo.name;

  productModal.classList.add("is-open");
  productModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
});

productGrid.appendChild(productCard);
}

const closeProductModalButton =
  document.querySelector("#close-product-modal");

closeProductModalButton.addEventListener("click", () => {
  const productModal = document.querySelector("#product-modal");

  productModal.classList.remove("is-open");
  productModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
});

loadProductList();
