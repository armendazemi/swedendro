export default class CartButton extends HTMLElement {
  constructor() {
    super();

  }

  connectedCallback() {
    this.addListeners();
    this.countBadge = this.querySelector('.side-cart-button__count');
  }


  addListeners() {
    window.addEventListener('cart:items-change', (e) => {
      if (e.detail.count > 0) {
        this.countBadge.innerText = e.detail.count;
        this.countBadge.classList.remove('d-none');
      } else {
        this.countBadge.innerText = e.detail.count;
        this.countBadge.classList.add('d-none');
      }
    });
  }

}

customElements.define('cart-button', CartButton);
