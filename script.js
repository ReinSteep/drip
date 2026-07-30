async function loadProductList() {
  const response = await fetch("products.json");
  const productList = await response.json();

  console.log(productList);
}

loadProductList();
