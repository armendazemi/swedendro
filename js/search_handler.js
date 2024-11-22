/*
This file handles the search functionality
 */

const searchWithInput = createSearchHandler();

// MOBILE SEARCH

const searchResultMobileContainer = document.querySelector('.search-result--mobile');
const mobileProductsContainer = document.querySelector('.search-mobile-tab-content--products');
const mobileCategoryContainer = document.querySelector('.search-mobile-tab-content--categories');
const searchFieldMobile = document.querySelector('.navbar-mobile input');
searchFieldMobile.addEventListener('input', searchWithInput);

// DESKTOP SEARCH
const searchResultDesktopContainer = document.querySelector('.search-result--desktop');
const desktopProductsContainer = document.querySelector('.search-result__products .products');
const desktopCategoryContainer = document.querySelector('.search-result__categories .categories');
const searchFieldDesktop = document.querySelector('.navbar-desktop input');
searchFieldDesktop.addEventListener('input', searchWithInput);

// SEARCH FORM INPUTS (Desktop / Mobile)
const searchForms = document.querySelectorAll('.search-form');

// set search limit based on screen size, on mobile it's 6
const SEARCH_LIMIT = window.innerWidth < 992 ? 6 : 8;

// Close search result container on blur
document.addEventListener('click', closeSearchResultContainerOnBlur);

/**
 * Creates and returns a function that handles input events for search functionality.
 * The returned function, when attached to an input event, listens for user input and,
 * if the input is at least 3 characters long, initiates a search action with a delay
 * to avoid excessive function calls during user input.
 *
 *
 * @example
 * const searchWithInput = createSearchHandler();
 * searchField.addEventListener('input', searchWithInput);
 *
 * @returns {Function} The search input event handler.
 */
function createSearchHandler () {
  let timeout;

  return async function searchWithInput (event) {
    let query = event.target.value;

    // Clear the existing timeout
    if (timeout) {
      clearTimeout(timeout);
    }
    clearSearchResultContainer();

    if (query.length >= 3) {
      timeout = setTimeout(() => {
        getResultsWithSearch(query);

      }, 500);
    } else {
      searchResultDesktopContainer.classList.remove('open');
      //searchResultMobileContainer.classList.remove('open');
    }
  };
}

function closeSearchResultContainerOnBlur (event) {
  if (!searchResultDesktopContainer.classList.contains('open') && !searchResultMobileContainer.classList.contains('open')) {
    return;
  }

  if (!event.target.closest('.search-result--desktop') && !event.target.closest('.search-result--mobile')) {
    searchResultDesktopContainer.classList.remove('open');
    searchResultMobileContainer.classList.remove('open');
    searchFieldDesktop.value = '';
    searchFieldMobile.value = '';
    clearSearchResultContainer();

  }
}

async function getResultsWithSearch (query) {
  // GET /api/v1/search
  let response = await fetch(`/api/v1/shop/search?products=true&groups=true&term=${query}&limit=${SEARCH_LIMIT}`, {
    method: 'GET',
  });

  if (response.ok) {
    const json = await response.json();
    populateSearchResultContainer(json);
    searchResultDesktopContainer.classList.add('open');
    //searchResultMobileContainer.classList.add('open');

    // Set the input value of the search form input to the query
    searchForms.forEach(form => {
      form.querySelector('input').value = query;
    });
  }
}

function populateSearchResultContainer (data) {
  const { groups, products } = data;

  if (products.length > 0) {
    for (let i = 0; i < products.length; i++) {
      createProductSearchCard(products[i]);
      products.length == SEARCH_LIMIT ? handleSearchFormDisplay(true) : handleSearchFormDisplay(false);
    }
  } else {
    desktopProductsContainer.innerHTML = `<p> Inga produkter matchade sökordet </p>`;
    //mobileProductsContainer.innerHTML = `<p> Inga produkter matchade sökordet </p>`
  }

  if (groups.length > 0) {
    for (let i = 0; i < groups.length; i++) {
      createCategorySearchLink(groups[i]);
    }
  } else {
    desktopCategoryContainer.innerHTML = `<p>Inga kategorier matchade sökordet </p>`;
    //mobileCategoryContainer.innerHTML = `<p>Inga kategorier matchade sökordet </p>`
  }
}

function createProductSearchCard (product) {

  const card = document.createElement('div');
  card.classList.add('product-search-card', 'col-12', 'col-lg-3');

  const link = document.createElement('a');
  link.classList.add('d-flex', 'flex-lg-column');
  link.href = `/catalog/products/${product.url}`;

  const wrapper = document.createElement('div');
  wrapper.classList.add('product-search-card-img-wrap');

  const productImage = document.createElement('img');
  productImage.classList.add('product-search-card__image');
  if (product.product_image) {
    productImage.src = product.product_image.url;
  } else {
    productImage.src = 'https://s3-eu-west-1.amazonaws.com/static.wm3.se/sites/563/media/254285_medium_placeholder_produktbild.png?1546508140';
  }

  const productContent = document.createElement('div');
  productContent.classList.add('product-search-card__content', 'd-flex', 'flex-column', 'justify-content-between', 'py-2');

  const productName = document.createElement('p');
  productName.classList.add('product-search-card__name');
  productName.innerText = product.name;

  //const productPrice = document.createElement('p');
  //productPrice.classList.add('product-search-card__price');
  //productPrice.innerText = Math.floor(product.master.best_price.after_tax_amount).toLocaleString() + ' Kr';

  productContent.append(productName);
  link.append(wrapper, productContent);
  wrapper.append(productImage);
  card.appendChild(link);

  desktopProductsContainer.appendChild(card);

}

function createCategorySearchLink (category) {
  console.log(category);
  const link = document.createElement('a');
  link.href = `/catalog/groups/${category.url}`;
  link.classList.add('category-result-link');
  link.innerText = category.name;

  desktopCategoryContainer.appendChild(link);
}

function handleSearchFormDisplay (show) {
  searchForms.forEach(form => {
    if (show) {
      form.classList.remove('d-none');
      form.classList.add('d-flex');
    } else {
      form.classList.add('d-none');
      form.classList.remove('d-flex');
    }
  });
}

function clearSearchResultContainer () {
  desktopProductsContainer.innerHTML = '';
  desktopCategoryContainer.innerHTML = '';

  //mobileProductsContainer.innerHTML = '';
  //mobileCategoryContainer.innerHTML = ''
}