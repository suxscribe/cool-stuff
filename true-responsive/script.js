class TrueResponsive {
  constructor() {
    this.authEl = document.querySelector('.auth-block');
    this.authElWrapper = document.querySelector('.auth-block__wrapper');
    this.authElContainer = document.querySelector('.auth-block__container');
    this.sidePadding = 16;

    this.debug = new Debug(this);

    this.init();
  }

  init() {
    this.debug.toggleDebugView(this.debug.controls.showDebug);
    this.initOrientation();

    window.addEventListener('resize', (event) => {
      console.log(event);
    });

    document.querySelectorAll('form > *').forEach((item) => {
      item.dataset.baseWidth = item.offsetWidth.toString();
      const debugDiv = document.createElement('div');
      debugDiv.classList.add('item-debug');
      item.appendChild(debugDiv);
    });

    this.rotateEl(0);
  }

  initOrientation() {
    if (typeof DeviceOrientationEvent !== 'undefined') {
      // Check if we need to request permission (iOS 13+ requirement)
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // Create a button for user interaction
        const button = document.createElement('button');
        button.innerHTML = 'Enable Device Orientation';
        button.addEventListener('click', async () => {
          try {
            const permission = await DeviceOrientationEvent.requestPermission();
            if (permission === 'granted') {
              this.debug.setDebugMessage('should work');
              window.addEventListener('deviceorientation', (e) => this.handleOrientation(e));
            }
          } catch (error) {
            console.error('Error requesting device orientation permission:', error);
          }
        });
        document.body.appendChild(button);
      } else {
        // For non-iOS devices or older iOS versions
        this.debug.setDebugMessage('should work');
        window.addEventListener('deviceorientation', (e) => this.handleOrientation(e));
      }
    } else {
      this.debug.setDebugMessage('Device Orientation API not supported');
    }
  }

  rotatedWidth(angle, container) {
    const angleRad = (angle * Math.PI) / 180;
    const containerWidth = container ? container.offsetWidth : window.innerWidth;
    const containerHeight = container ? container.offsetHeight : window.innerHeight;

    // Width needed for edge-to-edge horizontal span when rotated
    const width = Math.min(
      Math.abs(containerWidth * Math.cos(angleRad)) +
        Math.abs(containerHeight * Math.sin(angleRad)),
      Math.abs(containerWidth / Math.cos(angleRad))
    );
    return width;
  }

  handleOrientation(e) {
    console.log('handle orientation', e);
    const alpha = e.alpha.toFixed(2);
    const beta = e.beta.toFixed(2);
    const gamma = e.gamma.toFixed(2);
    const newWidth = this.rotatedWidth(alpha, null);

    this.debug.updateOrientationDebug(alpha, beta, gamma, newWidth);
    this.rotateEl(alpha);
  }

  rectRelativeTo(el, container) {
    const elBox = el.getBoundingClientRect();
    const containerBox = container.getBoundingClientRect();

    return {
      left: elBox.left - containerBox.left,
      top: elBox.top - containerBox.top,
      right: elBox.right - containerBox.left,
      bottom: elBox.bottom - containerBox.top,
      width: elBox.width,
      height: elBox.height,
    };
  }

  rotateEl(angle) {
    document.documentElement.style.setProperty('--rotation-angle', `${angle}deg`);

    if (!this.authEl || !this.authElContainer) return;

    this.authEl.querySelectorAll('form > *').forEach((item, index) => {
      // Reset transforms to measure Rect correctly
      item.style.transform = 'translateX(0px)';
      item.style.width = 'auto';

      const itemRect = this.rectRelativeTo(item, this.authElContainer);

      const currentTranslate = item.style.transform;
      const translateXMatch = currentTranslate.match(/translateX\(([^)]+)\)/);
      const currentTranslateX = translateXMatch ? parseFloat(translateXMatch[1]) : 0;

      // Calculate overshoot on all four sides (positive numbers only)
      const overshootL = Math.max(0, -itemRect.left);
      const overshootR = Math.max(0, itemRect.right - this.authElContainer.clientWidth);
      const overshootT = Math.max(0, -itemRect.top);
      const overshootB = Math.max(0, itemRect.bottom - this.authElContainer.clientHeight);

      this.debug.updateItemDebug(
        item,
        index,
        itemRect,
        overshootL,
        overshootR,
        overshootT,
        overshootB
      );

      const rad = (angle * Math.PI) / 180;
      const cosA = Math.cos(rad);
      const sinA = Math.sin(rad);

      const absCos = Math.abs(cosA) < 0.0001 ? 0.0001 : Math.abs(cosA);
      const absSin = Math.abs(sinA) < 0.0001 ? 0.0001 : Math.abs(sinA);

      // --------------------------------------------------
      // 1) Compute translation range that satisfies all sides
      // --------------------------------------------------
      let low = -Infinity; // minimum allowed Delta
      let high = Infinity; // maximum allowed Delta

      // Horizontal constraints (left / right)
      if (overshootL > 0) {
        if (cosA > 0) {
          low = Math.max(low, overshootL / cosA);
        } else if (cosA < 0) {
          high = Math.min(high, overshootL / cosA);
        }
      }

      if (overshootR > 0) {
        if (cosA > 0) {
          high = Math.min(high, -overshootR / cosA);
        } else if (cosA < 0) {
          low = Math.max(low, -overshootR / cosA);
        }
      }

      // Vertical constraints (top / bottom)
      if (overshootT > 0) {
        if (sinA > 0) {
          low = Math.max(low, overshootT / sinA);
        } else if (sinA < 0) {
          high = Math.min(high, overshootT / sinA);
        }
      }

      if (overshootB > 0) {
        if (sinA > 0) {
          high = Math.min(high, -overshootB / sinA);
        } else if (sinA < 0) {
          low = Math.max(low, -overshootB / sinA);
        }
      }

      // Pick a Delta that keeps element inside, prefer 0 if possible
      let delta = Math.max(low, Math.min(0, high));

      if (index === 0) {
        console.log('overshootL:', overshootL, 'overshootR:', overshootR);
        console.log('low:', low, 'high:', high);
      }

      // --------------------------------------------------
      // 2) Re-evaluate overshoot after translation, then compute slice
      // --------------------------------------------------
      const left2 = itemRect.left + delta * cosA;
      const right2 = itemRect.right + delta * cosA;
      const top2 = itemRect.top + delta * sinA;
      const bottom2 = itemRect.bottom + delta * sinA;

      const oL2 = Math.max(0, -left2);
      const oR2 = Math.max(0, right2 - this.authElContainer.clientWidth);
      const oT2 = Math.max(0, -top2);
      const oB2 = Math.max(0, bottom2 - this.authElContainer.clientHeight);

      const sliceH = (oL2 + oR2) / absCos;
      const sliceV = (oT2 + oB2) / absSin;
      const slice = Math.max(sliceH, sliceV);

      const baseWidth = parseFloat(item.dataset.baseWidth) || item.offsetWidth;
      item.dataset.baseWidth = baseWidth.toString();

      const newLogicalWidth = Math.max(0, baseWidth - slice);

      // --------------------------------------------------
      // 3) Apply
      // --------------------------------------------------
      item.style.width = newLogicalWidth + 'px';
      item.style.transform = `translateX(${delta}px)`;
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TrueResponsive();
});
