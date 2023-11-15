const sidesSlider = document.getElementById('sidesSlider');
const lettersSlider = document.getElementById('lettersSlider');
const sidesValue = document.getElementById('sidesValue');
const lettersValue = document.getElementById('lettersValue');
const shapeContainer = document.getElementById('shapeContainer');

let sides = sidesSlider.value;
let lettersPerSide = lettersSlider.value;

const updateMaxLetters = () => {
    const maxLetters = Math.floor(26 / sides);
    lettersSlider.max = maxLetters;
    if (lettersPerSide > maxLetters) {
        lettersPerSide = maxLetters;
        lettersSlider.value = maxLetters;
    }
    lettersValue.textContent = lettersSlider.value;
};

const handleInput = (e) => {
    e.target.value = e.target.value.toUpperCase();
    document.querySelectorAll('.inputLetter').forEach(input => {
        if (input !== e.target && input.value === e.target.value) {
            e.target.value = '';
            alert('Duplicate characters are not allowed.');
        }
    });
};

sidesSlider.oninput = () => {
    sides = sidesSlider.value;
    sidesValue.textContent = sides;
    sides = parseInt(sides);
    updateMaxLetters();
    createShape();
};

lettersSlider.oninput = () => {
    lettersPerSide = lettersSlider.value;
    lettersValue.textContent = lettersPerSide;
    lettersPerSide = parseInt(lettersPerSide);
    createShape();
};

const createShape = () => {
    shapeContainer.innerHTML = '';
    const shape = document.createElement('div');
    shape.className = 'shape';
    shapeContainer.appendChild(shape);

    const radius = 100; // Radius of the circumcircle of the polygon
    const vertices = [];
    const lettersPerSideIter = parseInt(lettersPerSide) + 2;

    // Calculate vertices of the polygon
    for (let i = 0; i < sides; i++) {
        const angle = 2 * Math.PI * i / sides - Math.PI / 2; // Offset by -90 degrees to start from top
        const x = radius * Math.cos(angle) + radius;
        const y = radius * Math.sin(angle) + radius;
        vertices.push({ x, y });
    }

    // // Position inputs along each side
    // for (let i = 0; i < sides; i++) {
    //     const startVertex = vertices[i];
    //     const endVertex = vertices[(i + 1) % sides];

    //     for (let j = 0; j < lettersPerSideIter; j++) {
    //         if (j == 0 || j == lettersPerSide + 1) { continue; }

    //         const x = startVertex.x + (endVertex.x - startVertex.x) * (j / (lettersPerSideIter - 1 || 1));
    //         const y = startVertex.y + (endVertex.y - startVertex.y) * (j / (lettersPerSideIter - 1 || 1));

    //         const input = document.createElement('input');
    //         input.type = 'text';
    //         input.maxLength = 1;
    //         input.className = 'inputLetter';
    //         input.oninput = handleInput;
    //         input.style.left = `${x - 10}px`; // Adjust for input width
    //         input.style.top = `${y - 10}px`; // Adjust for input height
    //         input.style.color = 'transparent';
    //         shapeContainer.appendChild(input);
    //     }
    // }

    updateShape();
};

const updateShape = () => {
    const shape = document.querySelector('.shape');
    const points = [];
    const angleStep = 2 * Math.PI / sides;
    const angleOffset = Math.PI / 2; // Offset by -90 degrees to start from top

    for (let i = 0; i < sides; i++) {
        const angle = angleStep * i - angleOffset;
        const x = 50 + 50 * Math.cos(angle); // Percentage-based
        const y = 50 + 50 * Math.sin(angle); // Percentage-based
        points.push(`${x}% ${y}%`);
    }

    shape.style.clipPath = `polygon(${points.join(', ')})`;
};

// updateMaxLetters();
// createShape();