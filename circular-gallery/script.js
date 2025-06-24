class RangeSlider {
  constructor(container) {
    this.elements = {
      slider: container.querySelector('.range-slider'),
      inner: container.querySelector('.range-slider__inner'),
      fill: container.querySelector('.range-slider__inner-fill'),
      thumb: container.querySelector('.range-slider__inner-thumb'),
      value: container.querySelector('.range-slider__value'),
    };

    this.state = {
      isDragging: false,
      startX: 0,
      sliderLeft: 0,
    };
    this.unit = '';

    this.init();
  }

  init() {
    document.documentElement.style.setProperty('--range-value', '0');
    this.bindEvents();
  }

  updateSlider(clientX) {
    const sliderRect = this.elements.inner.getBoundingClientRect();
    const position = clientX - sliderRect.left;
    const percentage = Math.min(Math.max((position / sliderRect.width) * 100, 0), 100);

    this.elements.fill.style.width = `${percentage}%`;
    this.elements.thumb.style.left = `${percentage}%`;
    this.elements.value.textContent = Math.round(percentage);

    // Set both rotation and scale values
    document.documentElement.style.setProperty('--range-value', `${percentage}${this.unit}`);
    document.documentElement.style.setProperty('--range-scale', `${percentage / 100}${this.unit}`);

    return percentage;
  }

  bindEvents() {
    this.elements.thumb?.addEventListener('mousedown', (e) => {
      this.state.isDragging = true;
      this.state.startX = e.clientX - this.elements.thumb.offsetLeft;
      this.state.sliderLeft = this.elements.inner.getBoundingClientRect().left;
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.state.isDragging) return;
      e.preventDefault();
      this.updateSlider(e.clientX);
    });

    document.addEventListener('mouseup', () => {
      this.state.isDragging = false;
    });

    this.elements.inner?.addEventListener('click', (e) => {
      if (e.target === this.elements.thumb) return;
      this.updateSlider(e.clientX);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new RangeSlider(document);
});
