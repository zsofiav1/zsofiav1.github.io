import init, { LetterShape, delim }  from './pkg/lettershape.js';
let DELIM = '';
let letterShapeObj = null;

async function init_wasm() {
    await init('./pkg/lettershape_bg.wasm');
    DELIM = delim();
    letterShapeObj = await LetterShape.new();
}

async function run() {
    // get the letters of my inputs
    const inputs = document.querySelectorAll('.polygon-input');
    const letters = [];
    let allLetters = true;
    // if input is '', set allLetters to false and break
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].value === '') {
            allLetters = false;
            break;
        }
        letters.push(inputs[i].value);
    }
    // if all letters are entered, get the number of sides and format the letters using the delim
    // for example
    // - sides=2
    // - number of inputs per side = 3
    // - letters = [a, b, c, d, e, f]
    // - DELIM = ';'
    // then the formatted letters = 'abc;def'
    let formattedLetters = '';
    if (allLetters) {
        const sides = parseInt(document.getElementById('sides-slider').value);
        const numInputsPerSide = parseInt(document.getElementById('inputs-slider').value);
        for (let i = 0; i < sides; i++) {
            for (let j = 0; j < numInputsPerSide; j++) {
                formattedLetters += letters[(i * numInputsPerSide) + j];
            }
            if (i < sides - 1) {
                formattedLetters += DELIM;
            }
        }
    }
    // print the formatted letters
    console.log(formattedLetters);
    let solutions = await letterShapeObj.solve(formattedLetters);
    console.log(solutions);
    // add solutions as <p> element to output div
    const output = document.getElementById('output');
    output.innerHTML = '';
    let p = document.createElement('p');
    p.innerHTML = solutions;
    output.appendChild(p);
}

// ---------------------------------------------------------------------------------------------
// constants
// ---------------------------------------------------------------------------------------------
const POLYGON_MIN_SIDES = 3;
const POLYGON_MAX_SIDES = 13;
const CIRCLE_RADIUS = 2;
const INPUT_SIZE_PX = 20;
const INPUT_ERROR_COLOR = '#ffb3b3';
const INPUT_VALID_COLOR = 'white';

// ---------------------------------------------------------------------------------------------
// default values
// ---------------------------------------------------------------------------------------------
const DEFAULT__NUM_INPUTS_PER_SIDE = 2;
const DEFAULT__POLYGON_RADIUS = 40;
const DEFAULT__POLYGON_BODY_COLOR = 'white';
const DEFAULT__POLYGON_BORDER_COLOR = 'black';
const DEFAULT__POLYGON_BORDER_WIDTH = 1;
const DEFAULT__CIRCLE_COLOR = DEFAULT__POLYGON_BORDER_COLOR;

// ---------------------------------------------------------------------------------------------
// event listeners
// ---------------------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', init_wasm);
document.addEventListener('DOMContentLoaded', loadSequence);
document.getElementById('polygon').addEventListener('input', drawPolygon);
document.getElementById('run-button').addEventListener('click', runButtonPressed);

// poll the window resize, and after 500ms, redraw the polygon
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        drawPolygon();
    }, 500);
});


// ---------------------------------------------------------------------------------------------
// load sequence
// ---------------------------------------------------------------------------------------------
function loadSequence() {
    setInputMax();
    drawPolygon();
}

function runButtonPressed() {
    run();
}

function drawPolygon() {
    // log i am here
    console.log('i am here');
    const polygons = document.querySelectorAll('.polygon');

    polygons.forEach(function(polygon) {
        console.log('drawing polygon');
        const sides = parseInt(polygon.dataset.sides, 10); // Number of sides as specified in data-sides attribute
        const radius = polygon.dataset.radius || DEFAULT__POLYGON_RADIUS; // Radius from data attribute, or default to 40 if not set
        const points = createRegularPolygonPoints(sides, radius);

        // if any subelements of polygon exist (e.g. svg, circle, polygon, input), remove it
        if (polygon.children.length > 0) {
            polygon.innerHTML = '';
        }
        // remove all classes of polygon-input from the document, if it exists
        const polygonInputs = document.querySelectorAll('.polygon-input');
        if (polygonInputs.length > 0) {
            polygonInputs.forEach(function(input) {
                input.remove();
            });
        }

        // Create the SVG element
        const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgElement.setAttribute('width', '100%');
        svgElement.setAttribute('height', '100%');
        svgElement.setAttribute('viewBox', '0 0 200 200');

        // Create the polygon element
        const polygonElement = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygonElement.setAttribute('fill', polygon.dataset.bodyColor || DEFAULT__POLYGON_BODY_COLOR);
        polygonElement.setAttribute('stroke', polygon.dataset.borderColor || DEFAULT__POLYGON_BORDER_COLOR);
        polygonElement.setAttribute('stroke-width', polygon.dataset.borderThickness || DEFAULT__POLYGON_BORDER_WIDTH);
        polygonElement.setAttribute('points', points);

        // Append the polygon to the SVG
        svgElement.appendChild(polygonElement);

        // Append the SVG to the .polygon div
        polygon.appendChild(svgElement);

        // get the absolute position of the polygon points
        const polygonPoints = polygonElement.points;
        const polygonPointsArray = [];
        for (let i = 0; i < polygonPoints.numberOfItems; i++) {
            polygonPointsArray.push({
                x: polygonPoints.getItem(i).x,
                y: polygonPoints.getItem(i).y
            });
        }

        // draw circles at the polygon points
        polygonPointsArray.forEach(function(point) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', point.x);
            circle.setAttribute('cy', point.y);
            circle.setAttribute('r', CIRCLE_RADIUS);
            circle.setAttribute('fill', polygon.dataset.borderColor || DEFAULT__CIRCLE_COLOR);
            svgElement.appendChild(circle);
        });

        // Get the SVG element's viewbox size
        const viewBox = svgElement.viewBox.baseVal;
        const viewBoxWidth = viewBox.width;
        const viewBoxHeight = viewBox.height;

        // Get the SVG element's actual size in the document
        const svgRect = svgElement.getBoundingClientRect();
        const svgWidth = svgRect.width;
        const svgHeight = svgRect.height;

        // Calculate the scale factors based on viewbox and actual size
        const scaleX = svgWidth / viewBoxWidth;
        const scaleY = svgHeight / viewBoxHeight;
        console.log(`scaleX: ${scaleX}, scaleY: ${scaleY}`);
        
        // Draw input fields at the polygon points
        const inputs = []; // Array to hold references to all input elements
        const numInputsPerSide = parseInt(polygon.dataset.numInputs) || DEFAULT__NUM_INPUTS_PER_SIDE;

        // Draw input fields at the polygon points
        polygonPointsArray.forEach(function(point) {
            let inputPositions = [];
            // otherwise, if the last point, get the first point and handle last edge
            if (point === polygonPointsArray[polygonPointsArray.length - 1]) {
                // first point
                inputPositions = getInputPositions(point, polygonPointsArray[0]);

            } else {
                // next point
                inputPositions = getInputPositions(point, polygonPointsArray[polygonPointsArray.indexOf(point) + 1]);
            }

            // loop through the input positions and draw the inputs
            inputPositions.forEach(function(inputPosition) {
                let input = document.createElement('input');
                input.setAttribute('type', 'text');
                input.setAttribute('value', '');
                input.setAttribute('maxlength', '1');
                input.classList.add('polygon-input'); // Added a class for styling or selecting if needed
            
                input.style.position = 'absolute';
                input.style.left = `${inputPosition.x}px`;
                input.style.top = `${inputPosition.y}px`;
                input.style.transform = 'translate(-25%, -25%)';
                input.style.width = `${INPUT_SIZE_PX}px`;
                input.style.height = `${INPUT_SIZE_PX}px`;
                input.style.textAlign = 'center';

                // Store the input in the array
                inputs.push(input);
            
                // append to the body or a relative positioned container instead of the polygon
                document.body.appendChild(input); // or your specific container
            });
        });

        function getInputPositions(pointA, pointB) {
            let AinputX = (pointA.x * scaleX) + svgRect.left - (INPUT_SIZE_PX / 2);
            let AinputY = (pointA.y * scaleY) + svgRect.top - (INPUT_SIZE_PX / 2);
            let BinputX = (pointB.x * scaleX) + svgRect.left - (INPUT_SIZE_PX / 2);
            let BinputY = (pointB.y * scaleY) + svgRect.top - (INPUT_SIZE_PX / 2);
            let inputPositions = [];
            const inputXStep = (BinputX - AinputX) / (numInputsPerSide + 1);
            const inputYStep = (BinputY - AinputY) / (numInputsPerSide + 1);
            for (let i = 0; i < numInputsPerSide + 1; i++) {
                if (i === 0) { continue }
                let inputPos = {
                    x: AinputX + (inputXStep * i),
                    y: AinputY + (inputYStep * i)
                };
                inputPositions.push(inputPos);
            }
            return inputPositions;
        }

        let deleteKeyPressed = false;
        // Add an input event listener to each input field
        inputs.forEach(function(input, index) {

            // add an event listener for when the delete key is pressed
            input.addEventListener('keydown', function(e) {
                if (e.keyCode === 8) {
                    deleteKeyPressed = true;
                    input.value = '';
                    input.style.backgroundColor = INPUT_VALID_COLOR;
                    if (index > 0) {
                        inputs[index - 1].focus();
                        inputs[index - 1].select();
                    } else {
                        inputs[inputs.length - 1].focus();
                        inputs[inputs.length - 1].select();
                    }
                } else {
                    deleteKeyPressed = false;
                }
            });

            // add an event listener for when the input value changes
            input.addEventListener('input', function() {
                // get the value of the input
                let value = input.value;

                // if the delete key is pressed
                // - clear the value
                // - change the background color to white
                // - change the focus to the previous input
                // - if the previous input is the first input, change the focus to the last input
                // - return
                if (value === '' && !deleteKeyPressed) {
                    input.style.backgroundColor = INPUT_VALID_COLOR;
                    if (index > 0) {
                        inputs[index - 1].focus();
                        inputs[index - 1].select();
                    } else {
                        inputs[inputs.length - 1].focus();
                        inputs[inputs.length - 1].select();
                    }
                    return;
                } else if (deleteKeyPressed) {
                    return;
                }

                // lowercase the value
                value = value.toLowerCase();
                // if the value is not a letter, make the box the error color and clear the value
                if (!value.match(/[a-z]/i)) {
                    input.style.backgroundColor = INPUT_ERROR_COLOR;
                    input.value = '';
                    // display an error message point at the input saying only letters are allowed
                    this.setCustomValidity('Only letters are allowed');
                    return;
                } else {
                    input.style.backgroundColor = INPUT_VALID_COLOR;
                }
                // set the input to uppercase
                value = value.toUpperCase();
                input.value = value;

                // loop through the inputs and get all the values (except the current input)
                let values = [];
                inputs.forEach(function(input, index) { values.push(input.value); });
                // remove the current input value from the array
                values.splice(index, 1);
                // if the value is in the array, make the box the error color and clear the value
                if (values.includes(value)) {
                    input.style.backgroundColor = INPUT_ERROR_COLOR;
                    input.value = '';
                    // display a message to the user saying only unique values are allowed
                    return;
                }

                // Move focus to the next input field and highlight
                if(input.value.length === 1 && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                    inputs[index + 1].select();
                }
                // If the last input field is filled, move to the first
                if(input.value.length === 1 && index === inputs.length - 1) {
                    inputs[0].focus();
                    inputs[0].select();
                }
            });
        });

    });

    function createRegularPolygonPoints(sides, radius) {
        const offset = Math.PI / 4; // Set offset to 45 degrees to start at top right
        const step = 2 * Math.PI / sides; // Angle between vertices
        let points = [];
        for (let i = 0; i < sides; i++) {
            // Calculate vertex position
            const x = 50 + radius * Math.cos(step * i - offset);
            const y = 50 + radius * Math.sin(step * i - offset);
            points.push(`${x},${y}`);
        }
        return points.join(' ');
    }
}

document.getElementById('sides-slider').addEventListener('input', function() {
    setInputMax();
    var polygon = document.getElementById('polygon');
    polygon.setAttribute('data-sides', this.value);
    polygon.setAttribute('data-num-inputs', document.getElementById('inputs-slider').value);
    drawPolygon();
});

document.getElementById('inputs-slider').addEventListener('input', function() {
    setInputMax();
    var polygon = document.getElementById('polygon');
    polygon.setAttribute('data-num-inputs', this.value);
    polygon.setAttribute('data-sides', document.getElementById('sides-slider').value);
    drawPolygon();
});

function setInputMax() {
    // get the number of sides
    let sides = document.getElementById('sides-slider').value;
    // get the number of inputs
    let inputs = document.getElementById('inputs-slider').value;
    // get the max potential value of the inputs slider (floor(26 / sides))
    let max = Math.floor(26 / sides);
    // if the max of the inputs slider is less than the current value, set the value to the max
    if (max < inputs) {
        document.getElementById('inputs-slider').value = max;
    }
    // if the max of the inputs slider is not equal to the max attribute, set the max attribute
    if (max !== parseInt(document.getElementById('inputs-slider').getAttribute('max'))) {
        document.getElementById('inputs-slider').setAttribute('max', max);
        scaleSliderAccordingToValue();
    }
    // if the max is 1, grey out the inputs slider
    if (max === 1) {
        document.getElementById('inputs-slider').setAttribute('disabled', 'disabled');
    } else {
        document.getElementById('inputs-slider').removeAttribute('disabled');
    }
}

function scaleSliderAccordingToValue() {
    // default range for input slider is 1-13
    // default size of the input slider is 300px
    const maxPx = 300;
    // get the slider limit (max)
    let limitIter = document.getElementById('inputs-slider').getAttribute('max');    
    // get the percentage of the value in pixels
    let percent = (limitIter / POLYGON_MAX_SIDES) * maxPx;
    // set the width of the slider to the percentage
    document.getElementById('inputs-slider').style.width = `${percent}px`;
}