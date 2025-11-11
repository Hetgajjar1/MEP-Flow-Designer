# AutoCAD-Inspired Integration Guide

## Overview

This document outlines strategies for integrating CAD-like drawing capabilities into MEP Flow Designer. The goal is to provide a **web-based, lightweight 2D drawing tool** for creating MEP layouts, inspired by AutoCAD but optimized for browser performance.

---

## 1. Technical Approaches

### Option A: HTML5 Canvas (Recommended for Phase 4)

**Pros**:
- Native browser support, no plugins
- Excellent performance for 2D graphics
- Full control over rendering
- Easy to integrate with Firebase (save as JSON)

**Cons**:
- No built-in DOM elements (must handle all interactions)
- Requires custom hit-testing for object selection
- Text rendering less crisp than SVG

**Best For**: Performance-critical drawing with many objects (1000+ entities).

**Example Libraries**:
- **Fabric.js**: Canvas wrapper with object model, events, transformations
- **Konva.js**: High-performance canvas library with layers and animations
- **Paper.js**: Vector graphics scripting framework

**Implementation**:
```javascript
import { fabric } from 'fabric';

const canvas = new fabric.Canvas('drawing-canvas');

// Add a rectangle (e.g., room)
const rect = new fabric.Rect({
  left: 100,
  top: 100,
  width: 200,
  height: 150,
  fill: 'transparent',
  stroke: 'black',
  strokeWidth: 2
});
canvas.add(rect);

// Add text (e.g., room label)
const text = new fabric.Text('Conference Room', {
  left: 150,
  top: 160,
  fontSize: 14
});
canvas.add(text);

// Save to JSON (store in Firestore)
const json = canvas.toJSON();
await saveDrawingToFirestore(projectId, json);
```

---

### Option B: SVG (Scalable Vector Graphics)

**Pros**:
- Crisp rendering at any zoom level
- DOM-based, easy to manipulate with JavaScript
- Accessibility (screen readers can read text)
- CSS styling support

**Cons**:
- Performance degrades with many elements (>500-1000)
- More memory-intensive than Canvas

**Best For**: Simple drawings with fewer objects, or when accessibility is critical.

**Example Libraries**:
- **SVG.js**: Lightweight SVG manipulation
- **Snap.svg**: Adobe's SVG library (modern replacement for Raphaël)
- **D3.js**: Data-driven SVG (overkill for CAD, but powerful)

**Implementation**:
```javascript
import { SVG } from '@svgdotjs/svg.js';

const draw = SVG().addTo('#drawing-container').size(800, 600);

// Add a line (e.g., wall)
const line = draw.line(50, 50, 250, 50).stroke({ width: 3, color: '#000' });

// Add a circle (e.g., sprinkler head)
const sprinkler = draw.circle(10).move(100, 100).fill('#f00');

// Export to SVG string (save to Storage or Firestore)
const svgString = draw.svg();
```

---

### Option C: WebGL (Three.js / PixiJS)

**Pros**:
- Extremely high performance (GPU-accelerated)
- Can handle 10,000+ objects
- 3D capabilities (future-proofing)

**Cons**:
- Steep learning curve
- Overkill for 2D-only drawing
- Compatibility issues on older devices

**Best For**: 3D visualization or very large drawings.

**Recommendation**: Use Canvas (Fabric.js) for Phase 4, consider WebGL for Phase 6 (3D features).

---

## 2. Core Features Implementation

### 2.1 Drawing Tools

#### Line Tool
```javascript
class LineTool {
  constructor(canvas) {
    this.canvas = canvas;
    this.isDrawing = false;
    this.startPoint = null;
    this.line = null;
  }

  activate() {
    this.canvas.on('mouse:down', this.onMouseDown.bind(this));
    this.canvas.on('mouse:move', this.onMouseMove.bind(this));
    this.canvas.on('mouse:up', this.onMouseUp.bind(this));
  }

  onMouseDown(event) {
    this.isDrawing = true;
    const pointer = this.canvas.getPointer(event.e);
    this.startPoint = { x: pointer.x, y: pointer.y };
    
    this.line = new fabric.Line(
      [this.startPoint.x, this.startPoint.y, this.startPoint.x, this.startPoint.y],
      { stroke: 'black', strokeWidth: 2 }
    );
    this.canvas.add(this.line);
  }

  onMouseMove(event) {
    if (!this.isDrawing) return;
    const pointer = this.canvas.getPointer(event.e);
    this.line.set({ x2: pointer.x, y2: pointer.y });
    this.canvas.renderAll();
  }

  onMouseUp(event) {
    this.isDrawing = false;
    this.saveToHistory();
  }

  saveToHistory() {
    // Save state for undo/redo
    const state = this.canvas.toJSON();
    drawingHistory.push(state);
  }
}
```

---

#### Rectangle Tool
```javascript
class RectangleTool {
  constructor(canvas) {
    this.canvas = canvas;
    this.isDrawing = false;
    this.startPoint = null;
    this.rect = null;
  }

  activate() {
    this.canvas.on('mouse:down', this.onMouseDown.bind(this));
    this.canvas.on('mouse:move', this.onMouseMove.bind(this));
    this.canvas.on('mouse:up', this.onMouseUp.bind(this));
  }

  onMouseDown(event) {
    this.isDrawing = true;
    const pointer = this.canvas.getPointer(event.e);
    this.startPoint = { x: pointer.x, y: pointer.y };
    
    this.rect = new fabric.Rect({
      left: this.startPoint.x,
      top: this.startPoint.y,
      width: 0,
      height: 0,
      fill: 'transparent',
      stroke: 'black',
      strokeWidth: 2
    });
    this.canvas.add(this.rect);
  }

  onMouseMove(event) {
    if (!this.isDrawing) return;
    const pointer = this.canvas.getPointer(event.e);
    
    const width = pointer.x - this.startPoint.x;
    const height = pointer.y - this.startPoint.y;
    
    this.rect.set({
      width: Math.abs(width),
      height: Math.abs(height),
      left: width < 0 ? pointer.x : this.startPoint.x,
      top: height < 0 ? pointer.y : this.startPoint.y
    });
    this.canvas.renderAll();
  }

  onMouseUp(event) {
    this.isDrawing = false;
  }
}
```

---

### 2.2 Symbol Library

#### MEP Symbols Data Structure
```javascript
const mepSymbols = {
  hvac: {
    diffuser: {
      name: 'Supply Diffuser',
      svg: '<circle cx="10" cy="10" r="8" fill="none" stroke="black" /><text x="10" y="10">SD</text>',
      properties: { airflow: 0, size: '12x12' }
    },
    grille: {
      name: 'Return Grille',
      svg: '<rect x="0" y="0" width="20" height="20" fill="none" stroke="black" /><text x="10" y="10">RG</text>',
      properties: { airflow: 0, size: '24x24' }
    },
    ductwork: {
      name: 'Duct',
      svg: '<line x1="0" y1="10" x2="100" y2="10" stroke="blue" stroke-width="3" />',
      properties: { size: '12x12', cfm: 0 }
    }
  },
  electrical: {
    outlet: {
      name: 'Duplex Outlet',
      svg: '<circle cx="10" cy="10" r="8" /><line x1="6" y1="10" x2="14" y2="10" />',
      properties: { voltage: 120, amperage: 15 }
    },
    switch: {
      name: 'Single Pole Switch',
      svg: '<rect x="2" y="2" width="16" height="16" fill="none" stroke="black" /><text x="10" y="10">S</text>',
      properties: { voltage: 120 }
    },
    panel: {
      name: 'Electrical Panel',
      svg: '<rect x="0" y="0" width="30" height="40" fill="gray" stroke="black" /><text x="15" y="20">EP</text>',
      properties: { amperage: 200, circuits: 42 }
    }
  },
  plumbing: {
    sink: {
      name: 'Lavatory',
      svg: '<ellipse cx="10" cy="10" rx="8" ry="6" fill="white" stroke="black" />',
      properties: { fixtureUnits: 1, gpm: 2.2 }
    },
    toilet: {
      name: 'Water Closet',
      svg: '<rect x="2" y="2" width="16" height="20" fill="white" stroke="black" /><ellipse cx="10" cy="5" rx="6" ry="4" />',
      properties: { fixtureUnits: 3, gpf: 1.6 }
    },
    pipe: {
      name: 'Water Pipe',
      svg: '<line x1="0" y1="10" x2="100" y2="10" stroke="green" stroke-width="2" />',
      properties: { size: '3/4"', gpm: 0 }
    }
  },
  fire: {
    sprinkler: {
      name: 'Sprinkler Head',
      svg: '<circle cx="10" cy="10" r="6" fill="red" /><line x1="10" y1="4" x2="10" y2="16" stroke="black" />',
      properties: { k: 5.6, coverage: 130 }
    },
    pullStation: {
      name: 'Fire Alarm Pull Station',
      svg: '<rect x="0" y="0" width="20" height="30" fill="red" stroke="black" /><text x="10" y="15" fill="white">PULL</text>',
      properties: { addressable: false }
    }
  }
};
```

---

#### Symbol Insertion
```javascript
function insertSymbol(canvas, symbolType, symbolName, position) {
  const symbol = mepSymbols[symbolType][symbolName];
  
  // Load SVG as Fabric object
  fabric.loadSVGFromString(symbol.svg, (objects, options) => {
    const group = fabric.util.groupSVGElements(objects, options);
    group.set({
      left: position.x,
      top: position.y,
      customProperties: symbol.properties,
      symbolType: symbolType,
      symbolName: symbolName
    });
    canvas.add(group);
  });
}

// Usage
insertSymbol(canvas, 'hvac', 'diffuser', { x: 200, y: 150 });
```

---

### 2.3 Layers Management

```javascript
class LayerManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.layers = {
      architectural: { visible: true, locked: false, color: '#000' },
      hvac: { visible: true, locked: false, color: '#00f' },
      electrical: { visible: true, locked: false, color: '#f00' },
      plumbing: { visible: true, locked: false, color: '#0f0' },
      fire: { visible: true, locked: false, color: '#f80' }
    };
  }

  setLayerVisibility(layerName, visible) {
    this.layers[layerName].visible = visible;
    this.canvas.getObjects().forEach(obj => {
      if (obj.layer === layerName) {
        obj.set('visible', visible);
      }
    });
    this.canvas.renderAll();
  }

  lockLayer(layerName) {
    this.layers[layerName].locked = true;
    this.canvas.getObjects().forEach(obj => {
      if (obj.layer === layerName) {
        obj.set('selectable', false);
      }
    });
  }

  addObjectToLayer(obj, layerName) {
    obj.set('layer', layerName);
    obj.set('stroke', this.layers[layerName].color);
    this.canvas.add(obj);
  }
}
```

---

### 2.4 Snap-to-Grid

```javascript
class GridManager {
  constructor(canvas, gridSize = 20) {
    this.canvas = canvas;
    this.gridSize = gridSize;
    this.enabled = true;
    this.drawGrid();
    this.enableSnapping();
  }

  drawGrid() {
    const grid = [];
    for (let i = 0; i < this.canvas.width / this.gridSize; i++) {
      grid.push(new fabric.Line(
        [i * this.gridSize, 0, i * this.gridSize, this.canvas.height],
        { stroke: '#ccc', selectable: false, evented: false }
      ));
      grid.push(new fabric.Line(
        [0, i * this.gridSize, this.canvas.width, i * this.gridSize],
        { stroke: '#ccc', selectable: false, evented: false }
      ));
    }
    grid.forEach(line => this.canvas.add(line));
    this.canvas.sendToBack(...grid);
  }

  enableSnapping() {
    this.canvas.on('object:moving', (event) => {
      if (!this.enabled) return;
      
      const obj = event.target;
      obj.set({
        left: Math.round(obj.left / this.gridSize) * this.gridSize,
        top: Math.round(obj.top / this.gridSize) * this.gridSize
      });
    });
  }

  toggleGrid() {
    this.enabled = !this.enabled;
  }
}
```

---

### 2.5 Measurement Tools

```javascript
class MeasurementTool {
  constructor(canvas) {
    this.canvas = canvas;
    this.scale = 1; // 1 pixel = 1 foot (adjust based on project units)
  }

  measureDistance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const pixels = Math.sqrt(dx * dx + dy * dy);
    const feet = pixels * this.scale;
    return feet.toFixed(2);
  }

  addDimensionLine(point1, point2) {
    const line = new fabric.Line(
      [point1.x, point1.y, point2.x, point2.y],
      { stroke: 'red', strokeWidth: 1, selectable: false }
    );
    
    const distance = this.measureDistance(point1, point2);
    const midX = (point1.x + point2.x) / 2;
    const midY = (point1.y + point2.y) / 2;
    
    const text = new fabric.Text(`${distance} ft`, {
      left: midX,
      top: midY - 20,
      fontSize: 12,
      fill: 'red',
      selectable: false
    });
    
    this.canvas.add(line, text);
  }
}
```

---

## 3. Data Persistence

### Save Drawing to Firestore

```javascript
async function saveDrawing(projectId, canvas) {
  const drawingData = {
    version: '1.0',
    canvas: canvas.toJSON(['layer', 'customProperties', 'symbolType', 'symbolName']),
    layers: layerManager.layers,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  };

  await admin.firestore()
    .collection('projects').doc(projectId)
    .collection('drawings').doc('main')
    .set(drawingData, { merge: true });
}
```

---

### Load Drawing from Firestore

```javascript
async function loadDrawing(projectId, canvas) {
  const drawingDoc = await admin.firestore()
    .collection('projects').doc(projectId)
    .collection('drawings').doc('main')
    .get();

  if (!drawingDoc.exists) return;

  const data = drawingDoc.data();
  canvas.loadFromJSON(data.canvas, () => {
    canvas.renderAll();
  });
}
```

---

## 4. Real-Time Collaboration

### Firestore-Based Sync

```javascript
class CollaborationManager {
  constructor(projectId, canvas) {
    this.projectId = projectId;
    this.canvas = canvas;
    this.userId = auth.currentUser.uid;
    this.cursors = new Map();
    this.setupListeners();
  }

  setupListeners() {
    // Listen for cursor updates
    const cursorsRef = admin.firestore()
      .collection('projects').doc(this.projectId)
      .collection('cursors');

    onSnapshot(cursorsRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          this.updateCursor(change.doc.id, change.doc.data());
        } else if (change.type === 'removed') {
          this.removeCursor(change.doc.id);
        }
      });
    });

    // Broadcast own cursor position
    this.canvas.on('mouse:move', (event) => {
      const pointer = this.canvas.getPointer(event.e);
      this.broadcastCursor(pointer);
    });
  }

  async broadcastCursor(position) {
    await admin.firestore()
      .collection('projects').doc(this.projectId)
      .collection('cursors').doc(this.userId)
      .set({
        x: position.x,
        y: position.y,
        userName: auth.currentUser.displayName,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
  }

  updateCursor(userId, data) {
    if (userId === this.userId) return; // Don't show own cursor

    let cursor = this.cursors.get(userId);
    if (!cursor) {
      cursor = new fabric.Circle({
        radius: 5,
        fill: this.getUserColor(userId),
        selectable: false,
        evented: false
      });
      this.canvas.add(cursor);
      this.cursors.set(userId, cursor);
    }

    cursor.set({ left: data.x, top: data.y });
    this.canvas.renderAll();
  }

  removeCursor(userId) {
    const cursor = this.cursors.get(userId);
    if (cursor) {
      this.canvas.remove(cursor);
      this.cursors.delete(userId);
    }
  }

  getUserColor(userId) {
    const colors = ['#f00', '#0f0', '#00f', '#f80', '#f0f'];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }
}
```

---

## 5. Import/Export

### Export to DXF (Basic)

```javascript
// Use a library like dxf-writer
import DxfWriter from 'dxf-writer';

function exportToDXF(canvas) {
  const dxf = new DxfWriter();
  
  canvas.getObjects().forEach(obj => {
    if (obj.type === 'line') {
      dxf.addLine(obj.x1, obj.y1, obj.x2, obj.y2);
    } else if (obj.type === 'rect') {
      dxf.addRectangle(obj.left, obj.top, obj.width, obj.height);
    } else if (obj.type === 'circle') {
      dxf.addCircle(obj.left + obj.radius, obj.top + obj.radius, obj.radius);
    }
  });

  const dxfString = dxf.toDxfString();
  downloadFile('drawing.dxf', dxfString);
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'application/dxf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

---

### Import DWG/DXF (External Service)

**Option 1**: Use Autodesk Forge API (cloud conversion)
**Option 2**: Use a paid service like CloudConvert
**Option 3**: Server-side conversion with `node-dxf` or similar

```javascript
async function importDXF(file, canvas) {
  // Upload to Cloud Storage
  const storageRef = ref(storage, `imports/${file.name}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  // Call Cloud Function to parse DXF
  const parseDXFFn = httpsCallable(functions, 'parseDXF');
  const result = await parseDXFFn({ fileURL: downloadURL });

  // Load parsed entities onto canvas
  result.data.entities.forEach(entity => {
    if (entity.type === 'LINE') {
      const line = new fabric.Line(
        [entity.x1, entity.y1, entity.x2, entity.y2],
        { stroke: entity.color }
      );
      canvas.add(line);
    }
    // Handle other entity types...
  });
}
```

---

## 6. Performance Optimization

### Large Drawing Strategies

1. **Object Pooling**: Reuse objects instead of creating/destroying
2. **Viewport Culling**: Only render objects in visible area
3. **Level of Detail (LOD)**: Show simplified symbols when zoomed out
4. **Lazy Loading**: Load symbols on-demand from library

```javascript
class ViewportManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.setupViewportCulling();
  }

  setupViewportCulling() {
    this.canvas.on('after:render', () => {
      const vpt = this.canvas.viewportTransform;
      const zoom = this.canvas.getZoom();
      
      this.canvas.getObjects().forEach(obj => {
        const isInViewport = this.isObjectInViewport(obj, vpt, zoom);
        obj.set('visible', isInViewport);
      });
    });
  }

  isObjectInViewport(obj, vpt, zoom) {
    const bounds = obj.getBoundingRect();
    const canvasWidth = this.canvas.width / zoom;
    const canvasHeight = this.canvas.height / zoom;
    
    return !(
      bounds.left > canvasWidth ||
      bounds.top > canvasHeight ||
      bounds.left + bounds.width < 0 ||
      bounds.top + bounds.height < 0
    );
  }
}
```

---

## 7. UI/UX Patterns

### Toolbar

```html
<div class="cad-toolbar">
  <button id="select-tool" class="tool-btn active">
    <i class="icon-cursor"></i> Select
  </button>
  <button id="line-tool" class="tool-btn">
    <i class="icon-line"></i> Line
  </button>
  <button id="rect-tool" class="tool-btn">
    <i class="icon-rect"></i> Rectangle
  </button>
  <button id="circle-tool" class="tool-btn">
    <i class="icon-circle"></i> Circle
  </button>
  <div class="divider"></div>
  <button id="symbol-tool" class="tool-btn">
    <i class="icon-symbols"></i> Symbols
  </button>
  <button id="measure-tool" class="tool-btn">
    <i class="icon-ruler"></i> Measure
  </button>
  <div class="divider"></div>
  <button id="undo" class="tool-btn">
    <i class="icon-undo"></i>
  </button>
  <button id="redo" class="tool-btn">
    <i class="icon-redo"></i>
  </button>
</div>
```

### Properties Panel

```html
<div class="properties-panel">
  <h3>Object Properties</h3>
  <div class="property-group">
    <label>Type:</label>
    <span id="prop-type">-</span>
  </div>
  <div class="property-group">
    <label>Layer:</label>
    <select id="prop-layer">
      <option value="hvac">HVAC</option>
      <option value="electrical">Electrical</option>
      <option value="plumbing">Plumbing</option>
      <option value="fire">Fire</option>
    </select>
  </div>
  <div class="property-group">
    <label>Stroke Width:</label>
    <input type="number" id="prop-stroke-width" value="2">
  </div>
  <div class="property-group custom-props">
    <!-- Dynamic properties based on object type -->
  </div>
</div>
```

---

## 8. Mobile Considerations

### Touch Gestures

```javascript
// Pinch to zoom
let initialDistance = 0;

canvas.on('touch:gesture', (event) => {
  if (event.e.touches.length === 2) {
    const touch1 = event.e.touches[0];
    const touch2 = event.e.touches[1];
    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );

    if (initialDistance === 0) {
      initialDistance = distance;
    } else {
      const scale = distance / initialDistance;
      canvas.setZoom(canvas.getZoom() * scale);
      initialDistance = distance;
    }
  }
});

canvas.on('touch:drag', (event) => {
  // Pan gesture
  const delta = event.self.deltaX || 0;
  canvas.relativePan({ x: delta, y: 0 });
});
```

---

## 9. Integration with Calculations

### Link Drawing Objects to Calculations

```javascript
// When user places an HVAC diffuser
function onDiffuserPlaced(diffuser) {
  // Prompt for airflow
  const airflow = prompt('Enter airflow (CFM):');
  diffuser.set('customProperties', {
    ...diffuser.customProperties,
    airflow: parseFloat(airflow)
  });

  // Auto-update project calculations
  updateProjectCalculations();
}

async function updateProjectCalculations() {
  const diffusers = canvas.getObjects().filter(obj => 
    obj.symbolName === 'diffuser'
  );

  const totalCFM = diffusers.reduce((sum, d) => 
    sum + (d.customProperties.airflow || 0), 0
  );

  // Call calculation function
  const calcHVAC = httpsCallable(functions, 'calculateHVACLoad');
  const result = await calcHVAC({
    projectId: currentProjectId,
    inputs: {
      ventilationCFM: totalCFM,
      // ... other inputs
    }
  });

  displayCalculationResults(result.data.results);
}
```

---

## 10. Recommended Libraries & Tools

### Core Libraries
- **Fabric.js** (Canvas): Drawing engine
- **Panzoom**: Pan & zoom controls
- **dxf-writer**: Export to DXF
- **node-dxf**: Parse DXF (server-side)

### UI Components
- **Lucide Icons**: Icon library for toolbar
- **TipTap** or **Quill**: Rich text for annotations
- **ColorPicker.js**: Color selection for objects

### Utilities
- **uuid**: Generate unique IDs for objects
- **lodash**: Utility functions (debounce, throttle)
- **date-fns**: Timestamp formatting

---

## Conclusion

Building a CAD-inspired editor for MEP Flow Designer is achievable with modern web technologies. By using **Fabric.js on HTML5 Canvas**, we can create a performant, user-friendly drawing tool that integrates seamlessly with Firebase and our existing calculation system.

**Next Steps**:
1. Build a proof-of-concept with Fabric.js (2-3 weeks)
2. Create a basic symbol library (1 week)
3. Implement layers and measurement tools (1 week)
4. Add Firestore persistence (3 days)
5. Beta test with 10 users (2 weeks)
6. Refine based on feedback and launch (Phase 4)

See [ROADMAP.md](./ROADMAP.md) for Phase 4 timeline.

