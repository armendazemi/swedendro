'use strict';

/**
 * Dependencies:
 *    1. Bootstrap for validation
 */

export default class FormComponent extends HTMLElement {
  constructor () {
    super();
    this.style.display = 'block';
    this.form = this.querySelector('form') || null;
    this.modalSelector = this.getAttribute('modal');

    this.acceptJson = this.getAttribute('accept-json') || false;
    this.customEvent = this.getAttribute('event');
  }

  connectedCallback () {
    if (!this.checkForForm()) {
      this.addForm();
    }
    this.addListeners();
  }

  disconnectedCallback () {
    this.form.removeEventListener('submit', this.handleFormSubmit);
  }

  checkForForm () {
    return this.innerHTML.indexOf('<form') !== -1;
  }

  addForm () {
    const form = document.createElement('form');
    form.innerHTML = this.innerHTML;
    form.className = this.className;
    form.classList.add('needs-validation');
    form.action = this.getAttribute('action');
    form.method = this.getAttribute('method');
    form.enctype = this.getAttribute('enctype');
    form.setAttribute('novalidate', '');
    this.className = '';
    this.innerHTML = '';
    this.form = form;
    this.appendChild(form);
  }

  addListeners () {
    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!this.form.checkValidity()) {
        this.form.classList.add('was-validated');
      } else {
        this.form.classList.remove('was-validated');
        this.handleFormSubmit(event);
      }
    });
  }

  getRequestBody() {
    const formData = new FormData(this.form);
    const authToken = document.querySelector('meta[name="csrf-token"]').content;
    formData.append('authenticity_token', authToken);

    if (this.acceptJson) {
      // Check if we need to format the payload for order items
      if (this.hasAttribute('format-payload')) {
        const data = Object.fromEntries(formData);
        // Transform order_item[variant_id] and order_item[quantity] into the desired format
        if (data['order_item[variant_id]'] && data['order_item[quantity]']) {
          return JSON.stringify({
            order_items: [{
              variant_id: data['order_item[variant_id]'],
              quantity: Number(data['order_item[quantity]'])
            }]
          });
        }
      }

      // Default JSON format
      const data = Object.fromEntries(formData);
      return JSON.stringify(data);
    }

    return formData;
  }

  async handleFormSubmit (event) {
    // Set submitting state
    this.classList.add('submitting');

    try {
      if (window.hasRecaptcha) {
        await this.handleRecaptcha();
      } else {
        console.info('Recaptcha is not enabled, enable it by providing window.hasRecaptcha = true in the header');
      }

      const action = this.form.getAttribute('action');
      const method = this.form.getAttribute('method');

      const response = await fetch(action, {
        headers: {
          'Accept': this.acceptJson ? 'application/json' : 'text/html',
          'Content-Type': this.acceptJson ? 'application/json' : 'application/x-www-form-urlencoded',
        },
        method: method,
        body: this.getRequestBody(),
      });

      if (this.acceptJson) {
        const data = await response.json();

        if (this.customEvent) {
          this.dispatchCustomEvent(this.customEvent, data)
        }
      }
      // Remove submitting state
      this.classList.remove('submitting');

      if (this.modalSelector && response.ok && response.status === 200) {
        this.handleModalDisplay(this.modalSelector);
        this.form.reset();
      } else {
        this.form.reset();
      }

    } catch (error) {
      console.error('There was an error tying to submit the form:', error);
    }
  }

  dispatchCustomEvent (eventName, data) {
    window.dispatchEvent(
      new CustomEvent(eventName, {
        detail: {
          ...data,
        },
      })
    );
  }

  handleRecaptcha () {
    return new Promise((resolve, reject) => {
      grecaptcha.ready(() => {
        grecaptcha.execute('6LeAx20oAAAAAAcEYIFfx_DLItAAqgMxWDbSC9fp', { action: 'submit' }).then((token) => {
          const recaptcha = document.createElement('input');
          recaptcha.type = 'hidden';
          recaptcha.name = 'g-recaptcha-response-token';
          recaptcha.value = token;
          this.form.appendChild(recaptcha);

          resolve();
        }).catch(error => {
          reject(error);
        });
      });
    });
  }

  handleModalDisplay (modalSelector) {
    window.dispatchEvent(
      new CustomEvent('modalchange', {
        detail: {
          action: 'open',
          element: modalSelector,
          withOverlay: true,
        },
      })
    );
  }
}

customElements.define('form-component', FormComponent);
