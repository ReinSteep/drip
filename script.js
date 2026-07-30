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
productGrid.appendChild(productCard);
}

loadProductList();
