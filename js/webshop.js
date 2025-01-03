var currency_precision = 2;

// HEADER: TOGGLE MOBILE MENU

$('#toggle-mobile-menu').click(function () {
  // Find the closest li element and then toggle its nested ul
  $('#mobile-nav-wrapper').slideToggle();
});

// HEADER: TOGGLE LANG MODAL
// Get the toggle button and the modal element
const toggleButtons = document.querySelectorAll('.toggle-lang-modal');
const langModal = document.getElementById('lang-modal');

// Add a click event listener to the toggle button
toggleButtons.forEach((button) => {
  button.addEventListener('click', function () {
    // Toggle the display of the lang-modal element
    if (langModal.style.display === 'none' || langModal.style.display === '') {
      langModal.style.display = 'block';
    } else {
      langModal.style.display = 'none';
    }
  });
});

// HEADER: FORCE CHANGE OF SHOWTAXES WHEN LOGGED IN
$('.btn-customer-type-cookie').click(function () {
  var value = $(this).data('value');
  document.cookie = 'showTaxes=' + value + '; path=/;';
  window.location.reload();
});

// GROUP SINGLE PAGE: READ MORE
// Get the height of each element
var groupEditableHeight = $('.group-editable').height();
var groupSingleEditableHeight = $('.group-single-editable').height();

// Compare the heights and display the read-more element if necessary
if (groupEditableHeight > groupSingleEditableHeight) {
  $('.read-more').show();
}

// Add click event listener to the read-more element
$('.read-more').click(function () {
  var $this = $(this); // Cache the clicked element

  // Check if the group is already expanded
  if ($this.hasClass('expanded')) {
    // If expanded, collapse it back
    $('.group-single-editable').animate({
      height: groupSingleEditableHeight // Collapse back to original height
    }, 500);

    // Remove the 'expanded' class and add 'collapsed'
    $this.removeClass('expanded').addClass('collapsed');
  } else {
    // If not expanded, expand it to full content height
    $('.group-single-editable').animate({
      height: $('.group-single-editable').get(0).scrollHeight
    }, 500);

    // Add the 'expanded' class and remove 'collapsed'
    $this.addClass('expanded').removeClass('collapsed');
  }
});

// PRODUCT SINGLE & CHECKOUT: UPDATE ITEM QUANTITY
$('.variant-quantity__wrapper').each(function () {
  var variantId = $(this).data('variant-id');

  $(this).find('.variant-quantity__decrement').on('click', function () {
    var quantityValue = $(this).siblings('.variant-quantity__value');
    var value = parseInt(quantityValue.text());
    if (value > 1) {
      value--;
      quantityValue.text(value);
      if ($(this).data('order') === 'update') {
        Shop.updateOrderItem(variantId, value, successCallback, errorCallback);
      }
    }
  });

  $(this).find('.variant-quantity__increment').on('click', function () {
    var quantityValue = $(this).siblings('.variant-quantity__value');
    var value = parseInt(quantityValue.val());
    value++;
    quantityValue.val(value);
    if ($(this).data('order') === 'update') {
      Shop.updateOrderItem(variantId, value, successCallback, errorCallback);
    }
  });
});

//----------------------------------------------------------------
// PRODUCT SINGLE: HANDLE VARIANT CHANGE ONE SELECT
//----------------------------------------------------------------
var selectElement = document.getElementById('variantSelect');
if (selectElement) {
  var variantIdElement = document.getElementById('variant_id');
  var productSkuElement = document.getElementById('product-sku');
  var priceElement = document.getElementById('product-price');
  var salePriceElement = document.getElementById('product-sale-price');
  var originalPriceElement = document.getElementById('product-original-price');

  var inStockElement = document.getElementById('product-in-stock-state');
  var outOfStockElement = document.getElementById('product-not-in-stock-state');
  var backorderableStockElement = document.getElementById('product-backorderable-stock-state');

  var btnAddToCart = document.getElementById('btn-add-to-cart');

  var discountLabel = document.getElementById('discount-label');

  selectElement.addEventListener('change', function () {
    // GET SELECTED VARIANT
    var selectedOption = selectElement.options[selectElement.selectedIndex];

    // UPDATE VARIANT ID IN PRODUCT FORM
    var variantId = selectedOption.getAttribute('data-variant-id');
    variantIdElement.value = variantId;

    // UPDATE SKU ELEMENT
    var variantSku = selectedOption.getAttribute('data-variant-sku');
    productSkuElement.innerText = variantSku;

    // UPDATE PRODUCT PRICE ELEMENT
    var variantPrice = selectedOption.getAttribute('data-price');
    priceElement.innerText = variantPrice;
    originalPriceElement.innerText = variantPrice;

    // HANDLE VARIANT ON SALE PRICES
    var varianOnSale = selectedOption.getAttribute('data-on-sale');
    if (varianOnSale === 'true') {
      priceElement.style.display = 'none';
      salePriceElement.style.display = 'block';
      originalPriceElement.style.display = 'block';
    } else {
      priceElement.style.display = 'block';
      salePriceElement.style.display = 'none';
      originalPriceElement.style.display = 'none';
    }
    var varianSalePrice = selectedOption.getAttribute('data-sale-price');
    salePriceElement.innerText = varianSalePrice;

    // HANDLE STOCK STATE INFO
    var inStockState = selectedOption.getAttribute('data-in-stock');
    var backordarableState = selectedOption.getAttribute('data-backorderable');

    if (inStockState === 'true') {
      inStockElement.style.display = 'block';
      outOfStockElement.style.display = 'none';
      backorderableStockElement.style.display = 'none';
      backorderableStockElement.style.display = 'none';
      btnAddToCart.disabled = false;
    } else {
      if (backordarableState === 'true') {
        inStockElement.style.display = 'none';
        outOfStockElement.style.display = 'none';
        backorderableStockElement.style.display = 'block';
        btnAddToCart.disabled = false;
      } else {
        inStockElement.style.display = 'none';
        outOfStockElement.style.display = 'block';
        backorderableStockElement.style.display = 'none';
        btnAddToCart.disabled = true;
      }
    }
    if (inStockState === 'none') {
      inStockElement.style.display = 'none';
      outOfStockElement.style.display = 'none';
      backorderableStockElement.style.display = 'none';
      btnAddToCart.disabled = true;
    }

    // UPDATE STOCK MESSAGE
    var inStockMessageElement = document.getElementById('delivery-message-in-stock');
    var backorderableStockMessageElement = document.getElementById('delivery-message-backorderable-stock');
    var outOfStockMessageElement = document.getElementById('delivery-message-out-of-stock');

    var inStockMessage = selectedOption.getAttribute('data-in-stock-delivery-message');
    var backordarablemMessage = selectedOption.getAttribute('data-backorderable-delivery-message');
    var outOfStockMessage = selectedOption.getAttribute('data-out-of-stock-delivery-message');

    inStockMessageElement.innerText = inStockMessage;
    backorderableStockMessageElement.innerText = backordarablemMessage;
    outOfStockMessageElement.innerText = outOfStockMessage;

    // HANDLE SHOW DISCOUNT LABEL ON IMAGE
    var discountPrecentage = selectedOption.getAttribute('data-discount');
    if (discountPrecentage == 0) {
      discountLabel.style.display = 'none';
    } else {
      discountLabel.style.display = 'block';
      discountLabel.innerText = discountPrecentage + '%';
    }

    handleTableVisibility(variantId);
    handleVariantImageChange(variantId);
    const optionOne = selectedOption.innerText.trim();
    populateAddToCartModal(optionOne, null, variantSku);
  });
}

//----------------------------------------------------------------
// PRODUCT SINGLE: HANDLE VARIANT CHANGE TWO SELECTS
//----------------------------------------------------------------
var selectElement_1 = document.getElementById('selection-1');
if (selectElement_1) {
  selectElement_1.addEventListener('change', function () {

    // Get the selected value from selection-1
    let selectedValue = this.value;
    console.log('selection-1', selectedValue);
    // Get all options from variantSelect
    let variantOptions = document.querySelectorAll('#variantSelect option');

    // Get all options from selection-2
    let selection2Options = document.querySelectorAll('#selection-2 option');

    // Create an array to store matching values from data-alternativ2
    let enabledValues = [];

    // Loop through variantSelect options to find matching data-alternativ1
    variantOptions.forEach(function (variant) {
      if (variant.getAttribute('data-alternativ1') === selectedValue) {
        // Store the corresponding value from data-alternativ2
        let alternativ2Value = variant.getAttribute('data-alternativ2');
        enabledValues.push(alternativ2Value); // Collect data-alternativ2 value for enabling
      }
    });

    // Loop through options in selection-2 and enable/disable based on enabledValues
    selection2Options.forEach(function (option) {
      if (enabledValues.includes(option.value)) {
        option.disabled = false; // Enable matching options
      } else {
        option.disabled = true; // Disable non-matching options
      }
    });
  });
}

function handleTableVisibility (variantID) {
  // Hide all tables and their associated sections by default
  const allTables = document.querySelectorAll('.section-product-details table');
  allTables.forEach(table => {
    table.style.display = 'none'; // Hide all tables
    const section = table.closest('.section-product-details');
    if (section) {
      section.style.display = 'none'; // Hide associated section
    }
  });

  // Find the matching table by variantID
  const matchingTable = document.querySelector(`table[data-id="${variantID}"]`);
  if (matchingTable) {
    // Show the matching table and its section if found
    matchingTable.style.display = 'block';
    const matchingSection = matchingTable.closest('.section-product-details');
    if (matchingSection) {
      matchingSection.style.display = 'block'; // Show associated section
    }
  }
}

// CHECKOUT: GENERAL HANDELNG CALLBACKS
function successCallback (data, txtStatus, jqXHR) {
  console.log('successCallback', data);
  Shop.getOrder(updateOrderFields, errorCallback);
}

function errorCallback (data, txtStatus, jqXHR) {
  console.log('errorCallback', data, txtStatus, jqXHR);
}

// CHECKOUT: UPDATE ORDER FIELDS
function updateOrderFields (data, txtStatus, jqXHR) {
  console.log('updateOrderFields', data, showTaxes);

  // UPDATE SUMMARY AND TOTALS
  var item_total = showTaxes ? data.order.item_total : data.order.item_pre_tax_total;
  var shipment_total = showTaxes ? data.order.shipment_total : data.order.shipment_pre_tax_total;
  var included_tax_total = data.order.included_tax_total;
  var total = data.order.total;

  $('[data-order=item_total]').html(Shop.number_to_currency(item_total, currency_precision));
  $('[data-order=shipment_total]').html(Shop.number_to_currency(shipment_total, currency_precision));
  $('[data-order=included_tax_total]').html(Shop.number_to_currency(included_tax_total, currency_precision));
  $('[data-order=total]').html(Shop.number_to_currency(total, currency_precision));

  // UPDATE ORDER QUANTITY IN TOP CART
  $('[data-order=item_number]').html(data.order.quantity);

  $.each(data.order_items, function (i, item) {
    console.log('item', item);
    // CHECK IF QUANTITY IS ZERO OR UNDEFINED, THEN FADEOUT
    if (item.quantity == 0 && item.quantity !== '') {
      $('[data-variant-id=' + item.variant_id + ']').fadeOut(300);
    }

    // UPDATE PRICES FOR EACH ITEM IN CART
    var item_price = showTaxes ? item.price : item.pre_tax_amount;
    var item_quantity = item.quantity;
    var item_amount = showTaxes ? item.amount : item.pre_tax_amount;
    $('[data-order-item=\'unit_price\'][data-variant-id=\'' + item.variant_id + '\']').html(Shop.number_to_currency(item_price, currency_precision));
    $('[data-order-item=\'amount\'][data-variant-id=\'' + item.variant_id + '\']').html(Shop.number_to_currency(item_amount, currency_precision));

    // IF ITEM HAS CAMPAIGN PRICE SHOW/HIDE ORIGINAL PRICES
    if (item.campaign_id != null) {
      //$("[data-order-item='original_unit_price'][data-variant-id='" + item.variant_id + "']").html(Shop.number_to_currency(item.original_unit_price, currency_precision)).show();
      $('[data-order-item=\'original_amount\'][data-variant-id=\'' + item.variant_id + '\']').html(Shop.number_to_currency(item.original_amount, currency_precision)).show();
    } else {
      //$("[data-order-item='original_unit_price'][data-variant-id='" + item.variant_id + "']").hide();
      $('[data-order-item=\'original_amount\'][data-variant-id=\'' + item.variant_id + '\']').hide();
    }

    // UPDATE TOP CART QUANTITY FOR ITEM
    $('[data-order-item=\'top_cart_quantity\'][data-variant-id=\'' + item.variant_id + '\']').html(item_quantity);
  });
}

// CHECKOUT: UPDATE CAMPAIGN
$('[data-order=update-campaign]').on('click', function (e) {
  e.preventDefault();
  console.log('update campaign');
  var code = $('input[data-order=campaign-code]').val();
  Shop.updateCampaignCode(code, successCallback, errorCallback);
});

// CHECKOUT: UPDATE SPECIAL INSTRUCTIONS
$('#orderMessage-form input').on('keyup', function (e) {
  $('#orderMessage-form').submit();
  console.log('orderMessage-form change');
});

// CHECKOUT: UPDATE PAYMENT METHOD
$('[data-payment-update]').on('click', function () {
  console.log('payment click');
  Shop.orderUpdate({
    payment_method_id: $(this).data('id')
  }, function (data, txtStatus, jqXHR) {
    console.log('Payment method updated');
  }, function (jqXHR, txtStatus, errorThrown) {
    console.log('Something went wrong, payment method did not update');
  });
});

// CHECKOUT: UPDATE SHIPMENT METHOD
$('[data-shipment-update]').on('click', function () {
  console.log('shipment click');
  Shop.orderUpdate({
    shipping_method_id: $(this).data('id')
  }, function (data, txtStatus, jqXHR) {
    console.log('Shipping method updated');
    Shop.getOrder(updateOrderFields, errorCallback);
  }, function (jqXHR, txtStatus, errorThrown) {
    console.log('Something went wrong, shipping method did not update');
  });
});

document.addEventListener('DOMContentLoaded', function () {
  // Get all the option selection elements
  const optionSelectors = document.querySelectorAll('.handle-option-selection');

  // Function to get the selected option values
  function getSelectedOptions () {
    const selectedOptions = {};
    optionSelectors.forEach(selector => {
      const dataOption = selector.getAttribute('data-option');
      const selectedValue = selector.options[selector.selectedIndex].value;
      selectedOptions[dataOption] = selectedValue;

    });
    return selectedOptions;
  }

  // Function to match the variant
  function matchVariant () {
    const selectedOptions = getSelectedOptions();
    const variantSelect = document.querySelector('.handle-variant-selection');
    const variantOptions = variantSelect.querySelectorAll('option');
    let matchedVariant = null; // Store the matched variant if found

    variantOptions.forEach(option => {
      let allMatch = true; // Assume all options match initially

      // Check each data option against the selected options
      for (const dataOption in selectedOptions) {
        const dataOptionValue = option.getAttribute(`data-${dataOption}`);
        if (dataOptionValue !== selectedOptions[dataOption]) {
          allMatch = false; // If any option does not match, set to false
          break; // Exit the loop early since we know it's not a match
        }
      }

      if (allMatch) {
        matchedVariant = option; // This option matches all selected options
      }
    });

    // If a matched variant is found, select it; otherwise, select the first option
    if (matchedVariant) {
      matchedVariant.selected = true;
      const selectedOptionsPresentation = matchedVariant.innerText.split('|');
      const optionOne = selectedOptionsPresentation[0] ? selectedOptionsPresentation[0].trim() : null;
      const optionTwo = selectedOptionsPresentation[1] ? selectedOptionsPresentation[1].trim() : null;
      const sku = matchedVariant.getAttribute('data-variant-sku');
      populateAddToCartModal(optionOne, optionTwo, sku);
    } else {
      console.log('No matching variant found. Selecting the first option.');
      variantOptions[0].selected = true; // Select the first option if no match
    }
    variantSelect.dispatchEvent(new Event('change'));
  }

  // Add event listener to each option selector
  optionSelectors.forEach(selector => {
    selector.addEventListener('change', function () {
      matchVariant(); // Trigger matching on each change
    });
  });
});

function populateAddToCartModal (optionOne, optionTwo, sku, imageSource) {
  if (optionOne) {
    const modalTextForOptionOne = document.querySelector('.modal-option-1');
    modalTextForOptionOne.innerText = optionOne;
    modalTextForOptionOne.classList.remove('d-none');
  }
  if (optionTwo) {
    const modalTextForOptionTwo = document.querySelector('.modal-option-2');
    modalTextForOptionTwo.innerText = optionTwo;
    modalTextForOptionTwo.classList.remove('d-none');
  }
  if (sku) {
    const modalTextForSku = document.querySelector('.modal-sku');
    modalTextForSku.innerText = sku;
    modalTextForSku.classList.remove('d-none');
  }

  if (imageSource) {
    console.log('srouce image', imageSource);
    const modalImage = document.querySelector('.modal-image');
    modalImage.src = imageSource;
    modalImage.classList.remove('d-none');
  }
}

function handleVariantImageChange (variantID) {
  // thumbswiper and mainSwiper are defined in product_images_slider.inc
  // Simpler selector that just looks for the data attribute
  const matchingImage = document.querySelector(`img[data-variant-id="${variantID}"]`);
  if (!matchingImage) {
    return;
  }
  const imageSource = matchingImage.getAttribute('src');
  populateAddToCartModal(null, null, null, imageSource);

  const slideIndex = Array.from(thumbsSwiper.slides).indexOf(matchingImage.closest('.swiper-slide'));
  mainSwiper.slideTo(slideIndex);
}


