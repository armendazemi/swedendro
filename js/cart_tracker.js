'use strict';
const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'SEK',
});

document.addEventListener('DOMContentLoaded', () => {
  getAndStoreCartState();

  window.getCartState = getCartState;
  window.setCartState = setCartState;
  window.clearCartState = clearCartState;

  window.addEventListener('cart:updated', () => {
    displayCartItems();
    updateCartPrice();
  });

  window.addEventListener('cart:set', (event) => {
    setCartState(event.detail);
  });

  window.addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-variant')) {
      handleVariantRemove(event);
    }
  });
});

async function getAndStoreCartState () {
  const url = '/w/cart?associations[]=variant';
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    console.error('Failed to fetch cart state');
    return;
  }

  const data = await response.json();
  setCartState(data);
}

function setCartState (data) {
  if (typeof data === 'object') {
    sessionStorage.setItem('cartState', JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: data }));
    window.dispatchEvent(new CustomEvent('cart:items-change', { detail: { count: data.order_items.reduce((total, item) => total + item.quantity, 0) } }));
  }
}

function displayCartItems () {
  const cartState = getCartState();
  const sideCartItemsElement = document.getElementById('side-cart__items');
  const sideCartTotalItemsElement = document.getElementById('side-cart__total-items');

  if (!cartState || !sideCartItemsElement || !sideCartTotalItemsElement) {
    console.error('Failed to display cart items');
    return;
  }
  const totalItems = cartState.order_items.reduce((acc, item) => acc + item.quantity, 0);
  if (totalItems === 0) {
    sideCartTotalItemsElement.innerHTML = '0 produkter';
    return;
  } else if (totalItems === 1) {
    sideCartTotalItemsElement.innerHTML = '1 produkt';
  } else {
    sideCartTotalItemsElement.innerHTML = `${totalItems} produkter`;
  }

  const previewCardTemplate = `
  <div class="product-card-cart-preview">
    <div class="product-card-cart-preview__c-content d-flex flex-wrap-reverse flex-lg-nowrap justify-content-center">
      <div class="product-card-cart-preview__image">
        <img src="" alt="Product image">
      </div>
      <div class="product-card-cart-preview__info d-flex flex-column ">
        <div class="d-flex justify-content-between align-items-start align-items-lg-center">
          <a href="" class="product-card-cart-preview__title default-link text-decoration-none text-sm fw-medium"></a>
          <button
            type="button"
            class="text-md-semibold clear-button remove-variant flex-shrink-0">
              <span>Ta bort</span>
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </button>
        </div>
        <p class="product-card-cart-preview__sku text-xs text-secondary"></p>
        <p class="product-card-cart-preview__type text-xs text-secondary">
        </p>
        <p class="product-card-cart-preview__quantity text-xs text-secondary"></p>
      </div>
    </div>

    <div class="product-card-cart-preview__price d-flex flex-column">
      <div class="d-none flex-column discount justify-content-end">
        <p class="text-sm text-tertiary mb-0 text-decoration-line-through text-end"></p>
        <p class="text-sm fw-bold text-campaign mb-0 text-end"></p>
      </div>

      <div class="d-none flex-column regular">
      <p class="text-sm fw-bold mb-0 text-end"></p>
      </div>
    </div>
  </div>`;

  sideCartItemsElement.innerHTML = '';
  cartState.order_items.reverse().forEach((item) => {
    const template = document.createElement('template');
    template.innerHTML = previewCardTemplate;
    const clone = template.content.cloneNode(true);
    const productCardCartPreview = clone.querySelector('.product-card-cart-preview');
    const productCardCartPreviewImage = clone.querySelector('.product-card-cart-preview__image img');
    const productCardCartPreviewTitle = clone.querySelector('.product-card-cart-preview__title');
    const productCardCartPreviewSku = clone.querySelector('.product-card-cart-preview__sku');
    const productCardCartPreviewType = clone.querySelector('.product-card-cart-preview__type');
    const productCardCartPreviewQuantity = clone.querySelector('.product-card-cart-preview__quantity');
    const productCardCartPreviewPrice = clone.querySelector('.product-card-cart-preview__price');
    const productCardCartPreviewRemoveButton = clone.querySelector('.remove-variant');

    productCardCartPreview.setAttribute('data-variant-id', item.variant_id);
    productCardCartPreviewImage.src = item.image ? item.image.url_small : 'https://fakeimg.pl/600x400?text=Bild+saknas&font=noto';
    productCardCartPreviewImage.alt = item.name;
    productCardCartPreviewTitle.href = `${item.links.product.href}`;
    productCardCartPreviewTitle.textContent = item.name;
    productCardCartPreviewSku.textContent = item.sku;
    productCardCartPreviewQuantity.textContent = `Antal: ${item.quantity}`;
    productCardCartPreviewRemoveButton.setAttribute('data-variant-id', item.variant_id);

    if (item.options.length > 0) {
      productCardCartPreviewType.textContent = item.options[0].option_value.name;
    }

    if (item.amount < item.original_amount) {
      const discount = productCardCartPreviewPrice.querySelector('.discount');
      discount.classList.remove('d-none');
      discount.classList.add('d-flex');
      discount.querySelector('p').textContent = `${formatter.format(item.original_amount)}`;
      discount.querySelector('p:last-child').textContent = `${formatter.format(item.amount)}`;
    } else {
      const regular = productCardCartPreviewPrice.querySelector('.regular');
      regular.classList.remove('d-none');
      regular.classList.add('d-flex');
      regular.querySelector('p').textContent = `${formatter.format(item.amount)}`;
    }

    sideCartItemsElement.appendChild(clone);
  });
}

async function handleVariantRemove (event) {
  const target = event.target;
  const variantId = target.getAttribute('data-variant-id');
  const cards = document.querySelectorAll('.product-card-cart-preview[data-variant-id="' + variantId + '"]');
  const url = '/w/cart/order_items?associations[]=variant';

  if (window._klarnaCheckout && window.location.href.includes('/w/checkout')) {
    window._klarnaCheckout((api) => {
      api.suspend();
    });
  }

  // Add loading state to button while request is being made
  target.classList.add('loading');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      order_items: [
        {
          variant_id: variantId,
          quantity: 0,
        },
      ],
    }),
  });

  if (!response.ok) {
    console.error('Failed to remove item from cart');
    return;
  }

  // Remove loading state
  target.classList.remove('loading');

  const data = await response.json();

  // Update Klarna widget and redirect to cart page (if empty) only if we are on the checkout page
  if (window.location.href.includes('/w/checkout')) {

    if (data.order_items.length === 0) {
      window.location.href = '/w/cart';
      return;
    }

    const paymentResponse = await fetch('/w/checkout/payment', {
      mehtod: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!paymentResponse.ok) {
      console.error('Failed to update payment');
      return;
    }

    if (window._klarnaCheckout) {
      _klarnaCheckout((api) => {
        api.resume();
      });
    }
  }

  cards.forEach((card) => {
    card.remove();
  });
  setCartState(data);
  checkForPotentialCartRedirect(data);
}

function checkForPotentialCartRedirect (data) {
  if (data.order_items.length === 0 && window.location.href.includes('checkout')) {
    window.location.href = '/w/cart';
  }
}

function getCartState () {
  return JSON.parse(sessionStorage.getItem('cartState'));
}

function clearCartState () {
  sessionStorage.removeItem('cartState');
}

function updateCartPrice () {
  const cartState = getCartState();
  const sideCartTotalPriceElement = document.getElementById('side-cart__total-price');

  if (!cartState || !sideCartTotalPriceElement) {
    return;
  }

  const sideCartHasItemsElement = document.querySelector('.side-cart__subtotal--has-items');
  const sideCartNoItemsElement = document.querySelector('.side-cart__subtotal--empty');
  if (cartState.order_items.length === 0) {
    sideCartHasItemsElement.classList.add('d-none');
    sideCartNoItemsElement.classList.remove('d-none');
  } else {
    sideCartHasItemsElement.classList.remove('d-none');
    sideCartNoItemsElement.classList.add('d-none');

  }

  const originalCombinedArticlePrice = cartState.order_items.reduce((acc, item) => acc + Number(item.original_amount), 0);
  const currentCombinedArticlePrice = cartState.order_items.reduce((acc, item) => acc + Number(item.amount), 0);
  const totalDiscountValue = Number(cartState.order.discount_total);

  let totalPrice;
  if (originalCombinedArticlePrice === currentCombinedArticlePrice) {
    totalPrice = currentCombinedArticlePrice - totalDiscountValue;
  } else {
    totalPrice = originalCombinedArticlePrice - currentCombinedArticlePrice - totalDiscountValue;
  }
  const formattedPrice = formatter.format(totalPrice);

  sideCartTotalPriceElement.textContent = `${formattedPrice}`;

  if (window.location.href.includes('checkout')) {
    updateCheckoutPrice(cartState);
    updateCheckoutItems(cartState);
  }
}

function updateCheckoutPrice (cartState) {
  const productCountElement = document.getElementById('checkout-product-count');
  const combinedArticlePriceElement = document.getElementById('combined-article-price');
  const discountPriceElement = document.getElementById('discount-price');
  const shippingPriceElement = document.getElementById('shipping-price');
  const taxPriceElement = document.getElementById('tax-price');
  const totalPriceElement = document.getElementById('total-price');

  if (!combinedArticlePriceElement || !taxPriceElement || !totalPriceElement) {
    console.error('Failed to update checkout price, one or more elements are missing');
    return;
  }

  const productCount = cartState.order_items.reduce((acc, item) => acc + item.quantity, 0);
  const taxTotal = Number(cartState.order.included_tax_total);
  const shippingTotal = Number(cartState.order.shipment_total);
  const originalCombinedArticlePrice = cartState.order_items.reduce((acc, item) => acc + Number(item.original_amount), 0);
  const currentCombinedArticlePrice = cartState.order_items.reduce((acc, item) => acc + Number(item.amount), 0);

  let totalDiscountValue;

  if (originalCombinedArticlePrice === currentCombinedArticlePrice) {
    totalDiscountValue = Number(cartState.order.discount_total);
  } else {
    totalDiscountValue = originalCombinedArticlePrice - currentCombinedArticlePrice - Number(cartState.order.discount_total);
  }

  productCountElement.textContent = productCount > 1 || productCount === 0 ? `${productCount} produkter` : `${productCount} produkt`;
  combinedArticlePriceElement.textContent = formatter.format(originalCombinedArticlePrice);
  taxPriceElement.textContent = formatter.format(taxTotal);
  discountPriceElement.textContent = formatter.format(totalDiscountValue);

  if (shippingPriceElement) {
    shippingPriceElement.textContent = formatter.format(shippingTotal);
  }

  const totalPrice = (currentCombinedArticlePrice + shippingTotal) - Math.abs(totalDiscountValue);
  totalPriceElement.textContent = formatter.format(totalPrice);
}

function updateCheckoutItems (cartState) {
  const checkoutItemsElement = document.querySelectorAll('.checkout-wrapper__items .product-card-cart-preview');

  if (!checkoutItemsElement) {
    return;
  }
  cartState.order_items.forEach((item) => {
    const variantId = item.variant_id;

    const checkoutItem = Array.from(checkoutItemsElement).find((element) => {
      return Number(element.getAttribute('data-variant-id')) === variantId;
    });

    if (!checkoutItem) {
      return;
    }

    const checkoutItemPrice = checkoutItem.querySelector('.product-card-cart-preview__price');
    // Check if the item has a discount by comparing the amount to the original amount

    if (Number(item.original_amount) > Number(item.amount)) {
      const discountPrice = checkoutItemPrice.querySelector('.product-card-cart-preview__price-discount');
      const originalPrice = checkoutItemPrice.querySelector('.product-card-cart-preview__price-original');
      originalPrice.textContent = formatter.format(item.original_amount);
      discountPrice.textContent = formatter.format(item.amount);
    } else {
      const originalPrice = checkoutItemPrice.querySelector('.product-card-cart-preview__price-original');
      originalPrice.textContent = formatter.format(item.original_amount);
    }
  });
}
