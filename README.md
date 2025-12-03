# 3d-labs

A collection of interactive 3D sandboxes exploring **WebGL**, **CSS 3D transforms**, and various experimental rendering techniques.  
Each sandbox uses a **shared sidebar UI** and **unified pointer-interaction system**, making it easy to prototype visual ideas and add new 3D experiences over time.

This repo powers the embedded demos in my portfolio, but is also a growing playground for visual research, spatial UI design, and realtime rendering experiments.

---

## ✨ Features

- **Shared Sidebar UI**  
  A consistent control panel across all sandboxes (sliders, colors, toggles), styled via `shared/css/sandbox.css`.

- **Unified Interaction System**  
  Pointer-driven interactions handled globally in `shared/js/interactions.js`, providing normalized `{ x, y }` coordinates to each sandbox.

- **Modular Architecture**  
  Each sandbox lives in its own directory with isolated HTML, JS, textures, or SVG assets.

- **Supports WebGL + CSS 3D**  
  Both WebGL scenes (Three.js) and pure CSS-transform-based 3D experiences use the same UI/interaction engine.

---

## 📁 Folder Structure

```
3d-labs/
  shared/
    css/
      sandbox.css
    js/
      interactions.js

  webgl-typography/
    index.html
    js/
      topography.js
      threejs/
        three.js
        addons/
          OrbitControls.js
          BufferGeometryUtils.js
          NormalMapShader.js
          ShaderTerrain.js
          Detector.js
          stats.min.js
    textures/

  css-3d-map/
    index.html
    script.js
    controls.js
    images/
```

---

## 🧪 Live Sandboxes

### **WebGL Typography / Terrain**
Realtime procedural terrain and pseudo-3D typography experiments using Three.js.  
**Live demo:**  
https://pitzbro.github.io/3d-labs/webgl-typography/

### **CSS 3D Map**
A fully CSS-transformed 3D container with SVG overlays, annotations, and camera-style control.  
**Live demo:**  
https://pitzbro.github.io/3d-labs/css-3d-map/

---

## 🧩 Adding a New Sandbox

### 1. Create a directory

```
your-sandbox/
  index.html
  js/
    yourScript.js
  assets/
```

### 2. Use the shared sidebar

```html
<aside class="sidebar gui open">
  <button class="toggle-sidebar-btn"></button>

  <section>
    <h2>Parameter</h2>
    <label>
      <span>Default</span>
      <input class="gui-input" type="range" name="param" min="0" max="100" />
    </label>
  </section>
</aside>
```

### 3. Mark the pointer interaction target

```html
<div class="viewport" data-interactions-target></div>
```

### 4. Define a callback in your JS

```js
window.updateTypography = function ({ x, y }) {
  // handle normalized pointer coords here
};
```

### 5. Load the global interaction script

```html
<script src="../shared/js/interactions.js"></script>
```

Your new sandbox now inherits the shared UI + interaction system.

---

## 🛠 Technology Stack

- WebGL / Three.js  
- CSS 3D Transforms  
- Vanilla JavaScript  
- SVG overlays  
- Shared modular UI components  

---

## 📄 License

MIT License — feel free to fork or adapt.

---

## 👤 Author

**Asi Oren**  
Visual storyteller, cinematographer, interactive developer.
