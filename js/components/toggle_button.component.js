// Paste in two svgs in the component to be used as the toggle button:


export default class ToggleButton extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.button = this.querySelector('button');
    this.icons = this.querySelectorAll('svg, img, i');

    const toggleAttributes = this.getAttribute('toggle-attributes');
    this.togglableAttributes = toggleAttributes ? toggleAttributes.split(';') : [];

    this.controlIcons(this.icons)
    this.addListeners();
  }


  addListeners() {
    if (this.button) {
      this.button.addEventListener('click', this.handleToggle.bind(this));
    } else {
      this.addEventListener('click', this.handleToggle.bind(this));
    }
  }

  controlIcons(icons) {
    if (icons.length > 2) {
      console.error('Too many icons');
      this.remove();
      return
    }
    this.icons[1].classList.add('d-none');

  }

  handleToggle() {
    this.icons.forEach(icon => {
      icon.classList.toggle('d-none');
    });


    if (this.togglableAttributes) {
      this.togglableAttributes.forEach(attribute => {
        this.toggleAttribute(attribute);
      });
    }
  }

  toggleAttribute(attribute) {
    const [name, values] = attribute.split(':');
    if (this.button.hasAttribute(name)) {
      const currentValue = this.button.getAttribute(name);
      const newValue = values.split(',').find(value => value !== currentValue);

      // Set the new value after the event has been delegated to the window
      // See handleModalActions in modal.component.js
      setTimeout(() => {
        this.button.setAttribute(name, newValue);
      }, 0)
    }
  }

}

customElements.define('toggle-button', ToggleButton);