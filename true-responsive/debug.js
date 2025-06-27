class Debug {
  constructor(trueResponsive) {
    this.trueResponsive = trueResponsive;
    this.debugEl = document.querySelector('.debug');
    this.screenHeight = window.innerHeight;

    // GUI controls
    this.controls = {
      rotationAngle: 0,
      manualControl: !('ontouchstart' in window) && !navigator.maxTouchPoints,
      resetAngle: () => {
        this.rotationGui.reset();
      },
      showDebug: false,
    };

    this.initGUI();
  }

  initGUI() {
    this.gui = new lil.GUI();
    this.gui.close(); // Collapse GUI by default

    this.rotationGui = this.gui
      .add(this.controls, 'rotationAngle', -90, 0)
      .name('Rotation Angle')
      .onChange((value) => {
        if (this.controls.manualControl) {
          this.trueResponsive.rotateEl(value);
        }
      });

    this.gui
      .add(this.controls, 'manualControl')
      .name('Manual Control')
      .onChange((value) => {
        if (!value) {
          // Reset to device orientation if available
          this.rotationGui.reset();
          this.trueResponsive.rotateEl(0);
        }
      });

    this.gui.add(this.controls, 'resetAngle');
    this.gui
      .add(this.controls, 'showDebug')
      .name('Show Debug')
      .onChange((enabled) => {
        this.toggleDebugView(enabled);
      });
  }

  toggleDebugView(enabled) {
    document.body.classList.toggle('debug-view-enabled', enabled);
    if (enabled) {
      this.trueResponsive.rotateEl(this.controls.rotationAngle);
    }
  }

  updateOrientationDebug(alpha, beta, gamma, newWidth, spin) {
    if (this.controls.showDebug && this.debugEl) {
      this.debugEl.innerHTML = `
        Screen height: ${this.screenHeight}<br>
        Alpha: ${alpha}<br>
        Beta: ${beta}<br>
        Gamma: ${gamma}<br>
        Width: ${newWidth.toFixed(2)}<br>
        Spin: ${spin}
      `;
    }
  }

  updateItemDebug(item, index, itemRect, overshootL, overshootR, overshootT, overshootB) {
    const debugDiv = item.querySelector('.item-debug');
    if (this.controls.showDebug && debugDiv) {
      debugDiv.innerHTML = `${index}: 
        L: ${itemRect.left.toFixed(1)} | T: ${itemRect.top.toFixed(1)} 
        | R: ${itemRect.right.toFixed(1)} | B: ${itemRect.bottom.toFixed(1)}
        | oL: ${overshootL.toFixed(1)} | oR: ${overshootR.toFixed(1)}
        | oT: ${overshootT.toFixed(1)} | oB: ${overshootB.toFixed(1)}
      `;
    } else if (debugDiv) {
      debugDiv.innerHTML = '';
    }
  }

  setDebugMessage(message) {
    if (this.controls.showDebug && this.debugEl) {
      this.debugEl.innerHTML = message;
    }
  }
}
