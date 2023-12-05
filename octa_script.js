// JavaScript to create a rotating octahedron
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(200, 200); // Match the size of the div
//set the renderer background color to transparent so that the background color of the web page shows through
//renderer.setClearColorHex( 0xffffff, 1 );
document.getElementById('octahedronCanvas').appendChild(renderer.domElement);

let geometry = new THREE.OctahedronGeometry(1, 0);
//let material be a light orange color
let material = new THREE.MeshBasicMaterial({color: 0xFFA500});
let octahedron = new THREE.Mesh(geometry, material);
scene.add(octahedron);

//add a wireframe to the octahedron
let wireframe = new THREE.WireframeGeometry(geometry);
let line = new THREE.LineSegments(wireframe);
line.material.depthTest = false;
line.material.opacity = 0.25;
line.material.transparent = true;
octahedron.add(line);

//unfoldAnimation = createUnfoldAnimation(octahedron.geometry);
let positions = octahedron.geometry.attributes.position;
console.log(positions);



//animate();






camera.position.z = 3;

function animate() {
    requestAnimationFrame(animate);
    octahedron.rotation.x += 0.01;
    octahedron.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();

function createUnfoldAnimation(geometry) {
    // Calculate the end positions of each vertex for the unfolded state
    let endPositions = [1,2,3,4,5,6,7,8,9,10,1,2,3,4,5,6,7,8,9,10]; // Fill this array with the calculated 2D positions of each vertex

    return (progress) => {
        // Update each vertex position based on the progress of the animation
        for (let i = 0; i < geometry.vertices.length; i++) {
            geometry.vertices[i].lerpVectors(geometry.vertices[i], endPositions[i], progress);
        }
        geometry.verticesNeedUpdate = true;
    };
}

// function animate() {
//     requestAnimationFrame(animate);

//     // Update the unfolding animation
//     unfoldAnimation(0.01); // Adjust the parameter to control the speed of the unfolding

//     renderer.render(scene, camera);
// }
