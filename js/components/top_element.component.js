export default class TopElement extends HTMLElement {
  constructor () {
    super();
    this.debounceTimer = null;
    this.headerHeight = 0; // Initialize marginTop
    this.shouldBeFullHeight = this.getAttribute('data-full-height') === 'true';

    // Add event listener with debouncing
    window.addEventListener('resize', this.debouncedHandleResize.bind(this));
  }

  connectedCallback () {
    setTimeout(() => {
      this.calculateMarginTop();
      this.style.display = 'block';
    }, 0);
  }

  calculateMarginTop () {
    // Get the height of the header
    const header = document.querySelector('header');
    if (header) {
      this.headerHeight = header.getBoundingClientRect().height + 'px';
      const computedStyle = getComputedStyle(this.firstElementChild);

      if (computedStyle.position === 'static' || computedStyle.position === 'relative') {
        this.style.marginTop = this.headerHeight;
      } else {
        this.firstElementChild.style.top = this.headerHeight;
        this.shouldBeFullHeight && (this.firstElementChild.style.height = `calc(100dvh - ${this.headerHeight})`);
      }
    }
  }

  debouncedHandleResize () {
    clearTimeout(this.debounceTimer);

    // Set a new timeout
    this.debounceTimer = setTimeout(() => {
      this.handleResize();
    }, 200);
  }

  handleResize () {
    // Recalculate marginTop on resize
    this.calculateMarginTop();
  }
}

customElements.define('top-element', TopElement);
