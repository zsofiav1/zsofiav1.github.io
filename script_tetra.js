import * as THREE from 'three';

let scene, camera, renderer;

// add rotating elements to this object
const ROTATION_CENTER = {
    x: 4,
    y: 0,
    z: 0,
};
let ROTATING_ELEMENTS = {};

let rotationSpeed = 1;          // scale
let rotationInterval = 10;      // ms
let rotationPaused = false;     // true = paused, false = not paused
let rotationDirection = true;   // true = clockwise, false = counterclockwise

const links = [
    'https://www.google.com',
    'https://www.youtube.com',
    'https://www.wikipedia.org',
    'https://www.reddit.com',
    'https://www.facebook.com',
    'https://www.twitter.com',
    'https://www.instagram.com',
    'https://www.linkedin.com',
    'https://www.pinterest.com',
    'https://www.tumblr.com',
];

let faceToLinkIdx = [];
let currentLinkIdx = -1;
let currentBackFaceIdx = -1;

function updateBackLinkIndex() {
    currentLinkIdx = currentLinkIdx + 1 < links.length ? currentLinkIdx + 1 : 0;
}

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
    const material = new THREE.MeshBasicMaterial({ color: 0x800080 });
    ROTATING_ELEMENTS.tetrahedron = new THREE.Mesh(geometry, material);

    // add another tetrahedron
    ROTATING_ELEMENTS.tetrahedron2 = new THREE.Mesh(geometry, material);

    // Create a wireframe material and add it as a second material
    const wireframeMaterial = new THREE.LineBasicMaterial({
        color: 0x000000,
        // increase the width to see the wireframe better (linewidth does not work)
        // linewidth: 10,
        // make thicker
        // depthTest: false,
        // depthWrite: false,
        // transparent: true,
        // opacity: 0.5,
    }); // Black color
    // add another wireframe material
    const wireframeMaterial2 = new THREE.LineBasicMaterial({
        color: 0x000000,
        // increase the width to see the wireframe better (linewidth does not work)
        linewidth: 10,
    }); // Black color

    ROTATING_ELEMENTS.tetrahedronWireframe = new THREE.LineSegments(
        new THREE.WireframeGeometry(geometry),
        wireframeMaterial
    );

    ROTATING_ELEMENTS.tetrahedronWireframe2 = new THREE.LineSegments(
        new THREE.WireframeGeometry(geometry),
        wireframeMaterial2
    );

    // Add both the tetrahedron and the wireframe to the scene
    scene.add(ROTATING_ELEMENTS.tetrahedron);
    scene.add(ROTATING_ELEMENTS.tetrahedron2);
    scene.add(ROTATING_ELEMENTS.tetrahedronWireframe);
    scene.add(ROTATING_ELEMENTS.tetrahedronWireframe2);

    // Loop through each group of three vertices to represent a face
    const positionAttribute = ROTATING_ELEMENTS.tetrahedron.geometry.getAttribute('position');
    for (let i = 0; i < positionAttribute.count; i += 3) {
        // print out the face indices
        console.log(i, i + 1, i + 2);

        // if the faceToLinkIdx array is less than the number of faces, add int(i / 3) to it
        if (faceToLinkIdx.length < positionAttribute.count / 3) {
            // convert to integer
            let idx =  Math.round(i / 3);
            faceToLinkIdx.push(idx);
            updateBackLinkIndex();
        }

        // if (i == 0) {
        //     // draw an A on the first face
        //     // get the fontloader from three.js addons (import three/addons/)
        //     const loader = new FontLoader();
        //     loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        //         // create the text geometry
        //         const geometry = new TextGeometry('zsofia is website', {
        //             font: font,
        //             size: 0.1,
        //             height: 0.01,
        //             curveSegments: 12,
        //             bevelEnabled: false,
        //         });
        //         // create the text material
        //         const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
        //         // create the text mesh
        //         ROTATING_ELEMENTS.text = new THREE.Mesh(geometry, material);
        //         // position the text mesh in the center of the face
        //         ROTATING_ELEMENTS.text.position.x = (positionAttribute.getX(i) + positionAttribute.getX(i + 1) + positionAttribute.getX(i + 2)) / 3;
        //         ROTATING_ELEMENTS.text.position.y = (positionAttribute.getY(i) + positionAttribute.getY(i + 1) + positionAttribute.getY(i + 2)) / 3;
        //         ROTATING_ELEMENTS.text.position.z = (positionAttribute.getZ(i) + positionAttribute.getZ(i + 1) + positionAttribute.getZ(i + 2)) / 3;
        //         // // ever-so-slightly move the text mesh away from the face, so it doesn't clip
        //         // ROTATING_ELEMENTS.text.position.x += 0.01;
        //         // ROTATING_ELEMENTS.text.position.y += 0.01;
        //         // ROTATING_ELEMENTS.text.position.z += 0.01;
        //         // find the plane that defines the face
        //         const plane = new THREE.Plane();
        //         plane.setFromCoplanarPoints(
        //             new THREE.Vector3(positionAttribute.getX(i), positionAttribute.getY(i), positionAttribute.getZ(i)),
        //             new THREE.Vector3(positionAttribute.getX(i + 1), positionAttribute.getY(i + 1), positionAttribute.getZ(i + 1)),
        //             new THREE.Vector3(positionAttribute.getX(i + 2), positionAttribute.getY(i + 2), positionAttribute.getZ(i + 2)),
        //         );
        //         // // using the plane, find out the rotation of the text mesh
        //         // const quaternion = new THREE.Quaternion();
        //         // quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), plane.normal);
        //         // ROTATING_ELEMENTS.text.setRotationFromQuaternion(quaternion);

        //         // add the text mesh to the scene
        //         scene.add(ROTATING_ELEMENTS.text);
        //     });
        //   }
        }

    // Position the camera
    camera.position.z = 5;

    // THIS WORKS!
    // add a on-mouse click event, only if the THREE scene is clicked
    renderer.domElement.addEventListener('click', () => {
        // get the position of the mouse
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        // get the object that was clicked
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children);
        if (!intersects.length) { return; }
        // loop through intersects
        for (let i = 0; i < intersects.length; i++) {
            // if the object clicked is the tetrahedron, print out which face was clicked
            if (intersects[i].object === ROTATING_ELEMENTS.tetrahedron) {
                console.log(intersects[i].face);
                // get the face index
                let faceIdx = intersects[i].faceIndex;
                // get the link index
                let linkIdx = faceToLinkIdx[faceIdx];
                // get the link
                let link = links[linkIdx];
                // open the link in a new tab
                window.open(link, '_blank');

                // // change the color of the tetrahedron
                // tetrahedron.material.color.setHex(Math.random() * 0xffffff);
                return;
            }
        }
    });

    // // Add mouse move listener
    // document.addEventListener('mousemove', onDocumentMouseMove, false);

    // Start the animation loop
    animate();
}

// function onDocumentMouseMove(event) {
//     // // Update tetrahedron rotation based on mouse position
//     // const rotationSpeed = 5;
//     // // create a 2d gaussian distribution over the screen
//     let twoDGaussian = (x, y, x0, y0, sigma) => {
//         return Math.exp(-((x - x0) ** 2 + (y - y0) ** 2) / (2 * sigma ** 2));
//     }
//     // get the mouse position
//     let mouseX = event.clientX;
//     let mouseY = event.clientY;

//     // // based on the mouse position, calculate the rotation of the tetrahedron w.r.t the center of the screen
//     let rotation = twoDGaussian(mouseX, mouseY, window.innerWidth / 2, window.innerHeight / 2, 100);
//     const maxSpeed = 5;
//     let rotationY = Math.abs(rotationSpeed / rotation) > maxSpeed ? maxSpeed : Math.abs(rotationSpeed / rotation);

//     // increase rotation speed if the mouse is closer to the center of the screen
//     if (mouseX < window.innerWidth / 2) {
//         rotationY *= -1;
//     }
    
//     // incrementally apply this to my rotationSpeed
//     rotationSpeed *= rotationY / 5;

//     // console.log(rotationY)
//     // tetrahedron.rotation.y += rotationY;
//     // // tetrahedron.rotation.y = (event.clientX / window.innerWidth) * 2 * rotationSpeed;
//     // // console.log((event.clientX / window.innerWidth) * 2 * rotationSpeed)
// }

function updateBackLink() {
    // cast a ray from the camera to 0,0,0
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(scene.children);
    if (!intersects.length) { return; }
    // loop through intersects in reverse
    for (let i = intersects.length - 1; i >= 0; i--) {
        // if the object clicked is the tetrahedron, print out which face was clicked
        if (intersects[i].object === ROTATING_ELEMENTS.tetrahedron) {
            // // print out the face
            // console.log(intersects[i].face);
            // // print out intersects[i].faceIndex
            // console.log(intersects[i].faceIndex);
            // if intersects[i].faceIndex is not the same as currentBackFaceIdx, update the back link
            if (intersects[i].faceIndex != currentBackFaceIdx) {
                // update the current back face index
                currentBackFaceIdx = intersects[i].faceIndex;
                // update the back link index
                updateBackLinkIndex();
                // update the faceToLinkIdx
                faceToLinkIdx[intersects[i].faceIndex] = currentLinkIdx;
                // // print out the back link
                // console.log(getCurrentLink());
                // // print out the faceToLinkIdx
                console.log(faceToLinkIdx);
            }
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function rotateTetrahedron() {
    if (rotationPaused) { return; }

    // get the additional rotation
    let additionalRotation = 0.01 * (rotationDirection ? -1 : 1) * Math.abs(rotationSpeed);;

    // loop through ROTATING_ELEMENTS and rotate them along the y axis
    // ensure the rotation/orbit is about the ROTATION_CENTER
    for (let element in ROTATING_ELEMENTS) {
        // if it is the second wireframe, rotate it in the opposite direction
        if (element == 'tetrahedronWireframe2' || element == 'tetrahedron2') {
            additionalRotation *= -1;
        }
        // ROTATING_ELEMENTS[element].rotation.y += additionalRotation;
        ROTATING_ELEMENTS[element].position.x -= ROTATION_CENTER.x;
        ROTATING_ELEMENTS[element].position.y -= ROTATION_CENTER.y;
        ROTATING_ELEMENTS[element].position.z -= ROTATION_CENTER.z;
        ROTATING_ELEMENTS[element].rotation.y += additionalRotation;
        ROTATING_ELEMENTS[element].position.x += ROTATION_CENTER.x;
        ROTATING_ELEMENTS[element].position.y += ROTATION_CENTER.y;
        ROTATING_ELEMENTS[element].position.z += ROTATION_CENTER.z;
    }
}
setInterval(rotateTetrahedron, rotationInterval);
setInterval(updateBackLink, 250);
