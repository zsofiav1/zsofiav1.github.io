import * as THREE from 'three';

let scene, camera, renderer, tetrahedron;

let rotationSpeed = 1;

// on DOMload, initialize the tetrahedron
document.addEventListener('DOMContentLoaded', initTetrahedron);

function initTetrahedron() {
    // Set up the scene, camera, and renderer
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create the tetrahedron
    const geometry = new THREE.TetrahedronGeometry(1, 0);
    const material = new THREE.MeshBasicMaterial({
        // color: 0x800080,
        // color: 0x00ff00,
        // wireframe: true,
        // wireframeLinewidth: 10
        // vertexColors: 0x000000,
    });
    tetrahedron = new THREE.Mesh(geometry, material);
    scene.add(tetrahedron);

    // add shading
    const light = new THREE.AmbientLight(0x000000); // soft white light
    scene.add(light);

    // make sure the tetrahedron reflects the light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    scene.add(directionalLight);

    // Position the camera
    camera.position.z = 5;

    // THIS WORKS!
    // // add a on-mouse click event, only if the THREE scene is clicked
    // renderer.domElement.addEventListener('click', () => {
    //     // get the position of the mouse
    //     const mouse = new THREE.Vector2();
    //     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    //     mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    //     // get the object that was clicked
    //     const raycaster = new THREE.Raycaster();
    //     raycaster.setFromCamera(mouse, camera);
    //     const intersects = raycaster.intersectObjects(scene.children);
    //     // if the object clicked is the tetrahedron, change its color
    //     if (intersects.length && intersects[0].object === tetrahedron) {
    //         // tetrahedron.material.color.setHex(0x0000ff);
    //         tetrahedron.material.color.setHex(Math.random() * 0xffffff);
    //     }
    // });

    // Add mouse move listener
    document.addEventListener('mousemove', onDocumentMouseMove, false);

    // Start the animation loop
    animate();
}

function onDocumentMouseMove(event) {
    // // Update tetrahedron rotation based on mouse position
    // const rotationSpeed = 5;
    // // create a 2d gaussian distribution over the screen
    let twoDGaussian = (x, y, x0, y0, sigma) => {
        return Math.exp(-((x - x0) ** 2 + (y - y0) ** 2) / (2 * sigma ** 2));
    }
    // get the mouse position
    let mouseX = event.clientX;
    let mouseY = event.clientY;

    // // based on the mouse position, calculate the rotation of the tetrahedron w.r.t the center of the screen
    let rotation = twoDGaussian(mouseX, mouseY, window.innerWidth / 2, window.innerHeight / 2, 100);
    const maxSpeed = 5;
    let rotationY = Math.abs(rotationSpeed / rotation) > maxSpeed ? maxSpeed : Math.abs(rotationSpeed / rotation);

    // increase rotation speed if the mouse is closer to the center of the screen
    if (mouseX < window.innerWidth / 2) {
        rotationY *= -1;
    }
    
    // incrementally apply this to my rotationSpeed
    rotationSpeed *= rotationY / 5;

    // console.log(rotationY)
    // tetrahedron.rotation.y += rotationY;
    // // tetrahedron.rotation.y = (event.clientX / window.innerWidth) * 2 * rotationSpeed;
    // // console.log((event.clientX / window.innerWidth) * 2 * rotationSpeed)



}

function animate() {
    requestAnimationFrame(animate);
    // Render the scene
    renderer.render(scene, camera);
}

function rotateTetrahedron() {
    // create an animation on my scene
    // tetrahedron.rotation.x += 0.01;
    tetrahedron.rotation.y += 0.01 * rotationSpeed;
    // tetrahedron.rotation.z += 0.01;

}

// rotate the tetrahedron every 10 ms
setInterval(rotateTetrahedron, 10);