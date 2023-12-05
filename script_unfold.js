import * as THREE from 'three';

let scene, camera, renderer;

// add rotating elements to this object
const ROTATION_CENTER = {
    x: 0,
    y: 0,
    z: 0,
};
let ROTATING_ELEMENTS = {};

let rotationSpeed = 1;          // scale
let rotationInterval = 10;      // ms
let rotationPaused = false;     // true = paused, false = not paused
let rotationDirection = true;   // true = clockwise, false = counterclockwise

// on DOMload, initialize the tetrahedron
document.addEventListener('DOMContentLoaded', initScene);

function initScene() {
    // Set up the scene, camera, and renderer
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, depth: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create the cube
    const cubeGeometry = new THREE.BoxGeometry();

    // Get the vertices of the cube
    const vertices = [];
    for (let i = 0; i < cubeGeometry.attributes.position.array.length; i += 3) {
        vertices.push(new THREE.Vector3(cubeGeometry.attributes.position.array[i], cubeGeometry.attributes.position.array[i + 1], cubeGeometry.attributes.position.array[i + 2]));
    }

    // get the sides of the cube and make them into squares
    const faces = [];
    for (let i = 0; i < vertices.length; i += 4) {
        faces.push([vertices[i], vertices[i + 1], vertices[i + 2], vertices[i + 3]]);
    }
    // log the faces
    console.log(faces);
    
    // draw the faces
    for (let i = 0; i < faces.length; i++) {
        // draw the face
        const faceGeometry = new THREE.BufferGeometry();
        const faceVertices = [];
        for (let j = 0; j < faces[i].length; j++) {
            faceVertices.push(faces[i][j].x);
            faceVertices.push(faces[i][j].y);
            faceVertices.push(faces[i][j].z);
        }
        const indices = [
            0, 1, 3,
            0, 2, 3,
        ];
        faceGeometry.setIndex(indices);
        faceGeometry.setAttribute('position', new THREE.Float32BufferAttribute(faceVertices, 3));
        const faceMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
        const faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);
        scene.add(faceMesh);
        ROTATING_ELEMENTS['square' + i] = faceMesh;
    }

    // log the rotating elements
    console.log(ROTATING_ELEMENTS);


    // set the camera back
    camera.position.z = 5;

    // Add mouse click listener
    document.addEventListener('click', onDocumentMouseClick, false);

    // Start the animation loop
    animate();
}

function onDocumentMouseClick(event) {
    // check if the mouse click was on a square (face of the cube)
    // if it was, unfold the 'cube' by rotating the squares appropriately
    // if it wasn't, do nothing
    // get the mouse position
    let mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // get the raycaster
    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // get the intersecting objects
    let intersects = raycaster.intersectObjects(scene.children);

    // if there are no intersecting objects, return
    if (intersects.length === 0) { return; }

    // if there are intersecting objects, rotate them backwards
    for (let i = 0; i < intersects.length; i++) {
        // get the intersecting object
        let intersect = intersects[i].object;
        
        // if it is any of the squares, call unfoldCube()
        for (let element in ROTATING_ELEMENTS) {
            if (ROTATING_ELEMENTS[element] === intersect && element.includes('square')) {
                unfoldCube();
                return;
            }
        }
    }
}

function unfoldCube() {
    // pause the rotation
    rotationPaused = true;

    // at random, choose a side and set it to be the unfolded side
    let unfoldedSide = ROTATING_ELEMENTS['square' + Math.floor(Math.random() * 6)];
    // get the vertices of the unfolded side
    const positions = unfoldedSide.geometry.attributes.position.array;
    // log the positions
    console.log(positions);

    // change the color of the unfolded side
    unfoldedSide.material.color.set(0xff0000);

    // print out each vertex of the unfolded side from the positions array (should be indices 0, 1, -1, -2)
    for (let i = 0; i < positions.length; i += 3) {
        console.log(positions[i], positions[i + 1], positions[i + 2]);
    }

    // log positions.length
    console.log(positions.length);

    // // draw dots at each vertex of the unfolded side, taking into account the current position/rotation of the cube
    // for (let i = 0; i < positions.length; i += 3) {
    //     // create the dot
    //     const dotGeometry = new THREE.SphereGeometry(0.1);
    //     const dotMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    //     const dotMesh = new THREE.Mesh(dotGeometry, dotMaterial);
    //     // get the current position of the vertices of the unfolded side, taking into account the current position/rotation of the cube
    //     let vector = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
    //     vector.applyMatrix4(unfoldedSide.matrixWorld);
    //     // set the dot's position to the vector
    //     dotMesh.position.set(vector.x, vector.y, vector.z);
    //     // add the dot to the scene
    //     scene.add(dotMesh);
    //     ROTATING_ELEMENTS['dot' + i] = dotMesh;
    // }

    // get the normal of the unfolded side
    unfoldedSide.geometry.computeVertexNormals();
    let unfoldedSideNormal = unfoldedSide.geometry.attributes.normal;
    // apply the current rotation of the cube to the unfolded side normal
    unfoldedSideNormal.applyMatrix4(unfoldedSide.matrixWorld);
    // print out the unfolded side normal
    console.log(unfoldedSideNormal);
    // get the default position the side should face (normal to the camera)
    let targetNormal = new THREE.Vector3(0, 0, 1);
    // print out the target normal
    console.log(targetNormal);

    // max rotation per any axis
    let MAX_ROTATION = 0.1;

    // get the full rotation from the unfolded side normal to the target normal
    let fullRotation = unfoldedSideNormal.angleTo(targetNormal);

    // get the rotation per axis
    let rotationX = Math.min(MAX_ROTATION, fullRotation);
    let rotationY = Math.min(MAX_ROTATION, fullRotation);

    
    





}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function rotateElements() {
    if (rotationPaused) { return; }
    let additionalRotation = getAdditionalRotation();
    // loop through ROTATING_ELEMENTS and rotate them along the y axis
    // ensure the rotation/orbit is about the ROTATION_CENTER
    for (let element in ROTATING_ELEMENTS) {
        if (ROTATING_ELEMENTS[element].rotation === undefined) { continue; }
        // get the vector from the ROTATION_CENTER to the element
        let vector = new THREE.Vector3();
        vector.subVectors(ROTATING_ELEMENTS[element].position, ROTATION_CENTER);
        // rotate the vector
        vector.applyAxisAngle(new THREE.Vector3(0, 1, 0), additionalRotation);
        // add the vector back to the ROTATION_CENTER
        vector.add(ROTATION_CENTER);
        // set the element's position to the vector
        ROTATING_ELEMENTS[element].position.set(vector.x, vector.y, vector.z);
        // rotate the element
        ROTATING_ELEMENTS[element].rotateOnAxis(new THREE.Vector3(0, 1, 0), additionalRotation);
    }
}

function getAdditionalRotation() {
    return 0.01 * (rotationDirection ? -1 : 1) * Math.abs(rotationSpeed);
}

setInterval(rotateElements, rotationInterval);
