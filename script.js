async function loadProductList() {
  const response = await fetch("products.json");
  const productList = await response.json();

  const firstProductFolder = productList[0].folder;

  const productResponse = await fetch(
    `items/${encodeURIComponent(firstProductFolder)}/info.json`
  );

  const productInfo = await productResponse.json();

  console.log(productInfo);
}

loadProductList();
