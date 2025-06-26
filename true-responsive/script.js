const debugEl = document.querySelector('.debug');
const authEl = document.querySelector('.auth-block');
const authElWrapper = document.querySelector('.auth-block__wrapper');
const authElContainer = document.querySelector('.auth-block__container');

const sidePadding = 16;

// let screenWidth = 560; //window.innerWidth;
// let screenHeight = 800; //window.innerHeight;

// Detect if we're on desktop (no touch capability)
const isDesktop = !('ontouchstart' in window) && !navigator.maxTouchPoints;

// GUI controls
const controls = {
  rotationAngle: 0,
  manualControl: isDesktop, // Auto-enable manual control on desktop
  resetAngle: () => {
    rotationGui.reset();
  },
  showDebug: false,
};

const gui = new lil.GUI();
const rotationGui = gui
  .add(controls, 'rotationAngle', -90, 0)
  .name('Rotation Angle')
  .onChange((value) => {
    if (controls.manualControl) {
      rotateEl(value);
    }
  });
gui
  .add(controls, 'manualControl')
  .name('Manual Control')
  .onChange((value) => {
    if (!value) {
      // Reset to device orientation if available
      rotationGui.reset();
      rotateEl(0);
    }
  });
gui.add(controls, 'resetAngle');

gui.add(controls, 'showDebug').name('Show Debug').onChange(toggleDebugView);

function toggleDebugView(enabled) {
  document.body.classList.toggle('debug-view-enabled', enabled);
  if (enabled) {
    rotateEl(controls.rotationAngle);
  }
}

const initOrientation = () => {
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
            if (controls.showDebug) debugEl.innerHTML = 'should work';
            window.addEventListener('deviceorientation', handleOrientation);
          }
        } catch (error) {
          console.error('Error requesting device orientation permission:', error);
        }
      });
      document.body.appendChild(button);
    } else {
      // For non-iOS devices or older iOS versions
      debugEl.innerHTML = 'should work';
      window.addEventListener('deviceorientation', handleOrientation);
    }
  } else {
    if (controls.showDebug) debugEl.innerHTML = 'Device Orientation API not supported';
  }
};

const rotatedWidth = (angle, container = window) => {
  const angleRad = (angle * Math.PI) / 180;

  const containerWidth = container.innerWidth;
  const containerHeight = container.innerHeight;

  // Width needed for edge-to-edge horizontal span when rotated
  return Math.min(
    Math.abs(containerWidth * Math.cos(angleRad)) + Math.abs(containerHeight * Math.sin(angleRad)),
    Math.abs(containerWidth / Math.cos(angleRad))
  );
};

const handleOrientation = (e) => {
  console.log('handle orientation', e);
  const alpha = e.alpha.toFixed(2);
  const beta = e.beta.toFixed(2);
  const gamma = e.gamma.toFixed(2);
  const newWidth = rotatedWidth(alpha);

  if (controls.showDebug && debugEl) {
    debugEl.innerHTML = `
    Screen height: ${screenHeight}<br>
    Alpha: ${alpha}<br>
    Beta: ${beta}<br>
    Gamma: ${gamma}<br>
    Width: ${newWidth}
  `;
  }

  rotateEl(alpha);
};

// DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
  toggleDebugView(controls.showDebug);
  // First, check if the API is available
  initOrientation();
  window.addEventListener('resize', (event) => {
    console.log(event);
    // screenHeight = window.innerHeight;
    // screenWidth = window.innerWidth;
  });

  document.querySelectorAll('form > *').forEach((item) => {
    item.dataset.baseWidth = item.offsetWidth;
    const debugDiv = document.createElement('div');
    debugDiv.classList.add('item-debug');
    item.appendChild(debugDiv);
  });

  rotateEl(0);
});
// ========================

function rectRelativeTo(el, container) {
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

const rotateEl = (angle) => {
  document.documentElement.style.setProperty('--rotation-angle', `${angle}deg`);
  authElWrapper.style.width = `${rotatedWidth(angle, authElContainer)}px`;

  authEl?.querySelectorAll('form > *').forEach((item, index) => {
    // Temporarily reset the translateX to get a clean measurement
    item.style.transform = 'translateX(0px)';
    item.style.width = 'auto';

    const itemRect = rectRelativeTo(item, authElContainer);
    const debugDiv = item.querySelector('.item-debug');

    const currentTranslate = item.style.transform;
    const translateXMatch = currentTranslate.match(/translateX\(([^)]+)\)/);
    const currentTranslateX = translateXMatch ? parseFloat(translateXMatch[1]) : 0;

    // Calculate overshoot on all four sides (positive numbers only)
    const overshootL = Math.max(0, -itemRect.left);
    const overshootR = Math.max(0, itemRect.right - authElContainer.clientWidth);
    const overshootT = Math.max(0, -itemRect.top);
    const overshootB = Math.max(0, itemRect.bottom - authElContainer.clientHeight);

    if (controls.showDebug && debugDiv) {
      debugDiv.innerHTML = `
        L: ${itemRect.left.toFixed(1)} | T: ${itemRect.top.toFixed(1)} 
        | R: ${itemRect.right.toFixed(1)} | B: ${itemRect.bottom.toFixed(1)}
        | oL: ${overshootL.toFixed(1)} | oR: ${overshootR.toFixed(1)}
        | oT: ${overshootT.toFixed(1)} | oB: ${overshootB.toFixed(1)}
      `;
    } else if (debugDiv) {
      debugDiv.innerHTML = '';
    }
    const rad = (angle * Math.PI) / 180;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);

    const absCos = Math.abs(cosA) < 0.0001 ? 0.0001 : Math.abs(cosA);
    const absSin = Math.abs(sinA) < 0.0001 ? 0.0001 : Math.abs(sinA);

    const angle2 = 90 - angle;
    const angle2Rad = (angle2 * Math.PI) / 180;
    const cosB = Math.cos(angle2Rad);
    const sinB = Math.sin(angle2Rad);

    // --------------------------------------------------
    // 1) Compute translation range that satisfies all sides
    // --------------------------------------------------
    let low = -Infinity; // minimum allowed Delta
    let high = Infinity; // maximum allowed Delta

    // Horizontal constraints (left / right)
    if (overshootL > 0) {
      if (cosA > 0) {
        low = Math.max(low, overshootL / cosA);
        // low = Math.max(low, overshootL * sinB);
      } else if (cosA < 0) {
        high = Math.min(high, overshootL / cosA);
        // high = Math.min(high, overshootL * sinB);
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
    const oR2 = Math.max(0, right2 - authElContainer.clientWidth);
    const oT2 = Math.max(0, -top2);
    const oB2 = Math.max(0, bottom2 - authElContainer.clientHeight);

    const sliceH = (oL2 + oR2) / absCos;
    const sliceV = (oT2 + oB2) / absSin;
    const slice = Math.max(sliceH, sliceV);

    const baseWidth = parseFloat(item.dataset.baseWidth) || item.offsetWidth;
    item.dataset.baseWidth = baseWidth;

    const newLogicalWidth = Math.max(0, baseWidth - slice);

    // --------------------------------------------------
    // 3) Apply
    // --------------------------------------------------
    item.style.width = newLogicalWidth + 'px';
    item.style.transform = `translateX(${delta}px)`;
  });
};
