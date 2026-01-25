**main.js**
```javascript
// Get references to our HTML elements
const canvasContainer = document.getElementById('canvas-container');
const canvas = document.getElementById('canvas');

// Set up Three.js
import * as THREE from 'three';

// Create the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});

// Set up the audio context
const audioContext = new AudioContext();

// Load a sound file (replace with your own media files)
const audioFile = 'path/to/your/sound/file.mp3';
fetch(audioFile).then(response => response.arrayBuffer()).then(buffer => {
  const audioSource = audioContext.createBufferSource();
  const analyser = audioContext.createAnalyser();

  // Set up the visualizer
  const frequencyData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(frequencyData);

  // Create a Three.js geometry and material for our visualization
  const geometry = new THREE.Geometry();
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5
  });

  // Add the visualization to the scene
  scene.add(new THREE.Mesh(geometry, material));

  // Update the visualization based on the audio frequency data
  function updateVisualization() {
    analyser.getByteFrequencyData(frequencyData);
    const vertices = [];
    for (let i = 0; i < frequencyData.length; i++) {
      vertices.push({
        x: Math.sin(i / 100) * frequencyData[i] / 255,
        y: Math.cos(i / 50) * frequencyData[i] / 255
      });
    }
    geometry.vertices = vertices;
  }

  // Update the visualization every frame
  function animate() {
    requestAnimationFrame(animate);
    updateVisualization();
    renderer.render(scene, camera);
  }
  animate();

  // Handle user interactions (e.g., mouse click to play/pause)
  canvas.addEventListener('click', () => {
    if (audioSource.start) {
      audioSource.stop();
    } else {
      audioSource.start();
    }
  });
});
