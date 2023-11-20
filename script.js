import * as THREE from 'three';

let scene, camera, renderer, hypercube;

// on DOMload, initialize the hypercube
document.addEventListener('DOMContentLoaded', initHyperCube);

function initHyperCube() {
    // Set up the scene, camera, and renderer
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create the hypercube (placeholder with a simple cube for this example)
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    hypercube = new THREE.Mesh(geometry, material);
    scene.add(hypercube);

    // Position the camera
    camera.position.z = 5;

    // Add mouse move listener
    document.addEventListener('mousemove', onDocumentMouseMove, false);

    // Start the animation loop
    animate();
}

function onDocumentMouseMove(event) {
    // Update hypercube position based on mouse position
    // aka convert mouse position (2d) to 3d position
    event.preventDefault();
    hypercube.position.x = (event.clientX / window.innerWidth) * 2 - 1;
    hypercube.position.y = -(event.clientY / window.innerHeight) * 2 + 1;
    // and the rotation
    hypercube.rotation.x = (event.clientX / window.innerWidth) * 2 - 1;
    hypercube.rotation.y = -(event.clientY / window.innerHeight) * 2 + 1;
    // and then update the camera position based on the hypercube position
    camera.position.x = hypercube.position.x;
    camera.position.y = hypercube.position.y;
    // and then update the camera rotation based on the hypercube position
    camera.rotation.x = hypercube.position.x;
    camera.rotation.y = hypercube.position.y;
}

function animate() {
    requestAnimationFrame(animate);

    // Render the scene
    renderer.render(scene, camera);
}