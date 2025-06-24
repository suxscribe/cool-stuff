const debugEl = document.querySelector('.debug');
const authEl = document.querySelector('.auth-block');
const authElWrapper = document.querySelector('.auth-block__wrapper');
const authElContainer = document.querySelector('.auth-block__container');

let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;

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
            debugEl.innerHTML = 'should work';
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
    debugEl.innerHTML = 'Device Orientation API not supported';
  }
};

const rotatedWidth = (angle) => {
  const angleRad = (angle * Math.PI) / 180;

  // Width needed for edge-to-edge horizontal span when rotated
  return Math.min(
    Math.abs(screenWidth * Math.cos(angleRad)) + Math.abs(screenHeight * Math.sin(angleRad)),
    Math.abs(screenWidth / Math.cos(angleRad))
  );
};

const handleOrientation = (e) => {
  console.log('handle orientation', e);
  const alpha = e.alpha.toFixed(2);
  const beta = e.beta.toFixed(2);
  const gamma = e.gamma.toFixed(2);
  const newWidth = rotatedWidth(alpha);

  debugEl.innerHTML = `
    Screen height: ${screenHeight}<br>
    Alpha: ${alpha}<br>
    Beta: ${beta}<br>
    Gamma: ${gamma}<br>
    Width: ${newWidth}
  `;

  rotateEl(alpha);
};

document.addEventListener('DOMContentLoaded', function () {
  // First, check if the API is available
  initOrientation();
  window.addEventListener('resize', (event) => {
    console.log(event);
    screenHeight = window.innerHeight;
    screenWidth = window.innerWidth;
  });

  // authEl.style.rotate = '30deg';
});

const rotateEl = (angle) => {
  // authEl.style.rotate = `${angle}deg`;

  authEl?.querySelectorAll('form > *').forEach((item) => {
    item.style.rotate = `${angle}deg`;
  });

  authElWrapper.style.width = `${rotatedWidth(angle)}px`;
};
