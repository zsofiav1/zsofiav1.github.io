// ---------------------------------------------------------------------------------------------
// imports
// ---------------------------------------------------------------------------------------------
import init, { LetterShape, delim }  from './pkg/lettershape.js';

// ---------------------------------------------------------------------------------------------
// constants
// ---------------------------------------------------------------------------------------------
const POLYGON_MIN_SIDES = 3;
const POLYGON_MAX_SIDES = 13;
const CIRCLE_RADIUS = 2;
const INPUT_SIZE_PX = 20;
const INPUT_ERROR_COLOR = '#ffb3b3';
const INPUT_VALID_COLOR = 'white';
const SLIDER_MAX_WIDTH_PX = 300;

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
// global variables
// ---------------------------------------------------------------------------------------------
let DELIM = '';
let letterShapeObj = null;
let lettersBuffer = Array(26).fill('');
let resizeTimer;

// ---------------------------------------------------------------------------------------------
// event listeners
// ---------------------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', init_wasm);
document.addEventListener('DOMContentLoaded', loadSequence);
document.getElementById('polygon').addEventListener('input', drawPolygon);
document.getElementById('run-button').addEventListener('click', solve);
document.getElementById('sides-slider').addEventListener('input', function() {
    setSidesRange();
    setInputMax();
    var polygon = document.getElementById('polygon');
    polygon.setAttribute('data-sides', this.value);
    polygon.setAttribute('data-num-inputs', document.getElementById('inputs-slider').value);
    drawPolygon();
});
document.getElementById('inputs-slider').addEventListener('input', function() {
    setSidesRange();
    setInputMax();
    var polygon = document.getElementById('polygon');
    polygon.setAttribute('data-num-inputs', this.value);
    polygon.setAttribute('data-sides', document.getElementById('sides-slider').value);
    drawPolygon();
});
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        drawPolygon();
    }, 10);
});

// ---------------------------------------------------------------------------------------------
// init wasm
// ---------------------------------------------------------------------------------------------
async function init_wasm() {
    await init('./pkg/lettershape_bg.wasm');
    DELIM = delim();
    letterShapeObj = await LetterShape.new();
}

// ---------------------------------------------------------------------------------------------
// solves the lettershape puzzle
// ---------------------------------------------------------------------------------------------
async function solve() {
    const inputs = document.querySelectorAll('.polygon-input');
    const letters = [];
    let allLettersPresent = true;
    // ---------------------------------------------------------------------------------------------
    // if input is '', set allLettersPresent to false and break
    // ---------------------------------------------------------------------------------------------
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].value === '') {
            allLettersPresent = false;
            break;
        }
        letters.push(inputs[i].value);
    }
    let formattedLetters = allLettersPresent ? formatLetters(letters) : '';
    // ---------------------------------------------------------------------------------------------
    // add a loading gif while waiting and redraw the polygon
    // ---------------------------------------------------------------------------------------------
    let output = document.getElementById('output');
    output.innerHTML = '';
    let img = document.createElement('img');
    img.src = `${window.location.origin}/media/loading.gif`;
    output.appendChild(img);
    drawPolygon();
    await new Promise(r => setTimeout(r, 100));
    // ---------------------------------------------------------------------------------------------
    // solve for solutions
    // ---------------------------------------------------------------------------------------------
    let solutions = await letterShapeObj.solve(formattedLetters);
    // ---------------------------------------------------------------------------------------------
    // display the solutions and redraw the polygon
    // ---------------------------------------------------------------------------------------------
    output.innerHTML = '';
    let p = document.createElement('p');
    p.innerHTML = solutions;
    output.appendChild(p);
    drawPolygon();
}


// ---------------------------------------------------------------------------------------------
// load sequence
// ---------------------------------------------------------------------------------------------
function loadSequence() {
    setSidesRange();
    setInputMax();
    drawPolygon();
}

/**
 * Sets the range of sides for a polygon.
 */
function setSidesRange() {
    document.getElementById('sides-slider').setAttribute('min', POLYGON_MIN_SIDES);
    document.getElementById('sides-slider').setAttribute('max', POLYGON_MAX_SIDES);
}

/**
 * Formats the letters based on the number of sides and inputs per side.
 * 
 * @param {Array} letters - The array of letters to be formatted.
 * @returns {string} The formatted letters.
 * @example 
 * // sides = 2
 * // number of inputs per side = 3
 * formatLetters(['a', 'b', 'c', 'd', 'e', 'f']);
 * // returns 'abc;def'
 */
function formatLetters(letters) {
    let formattedLetters = '';
    const sides = parseInt(document.getElementById('sides-slider').value);
    const numInputsPerSide = parseInt(document.getElementById('inputs-slider').value);
    for (let i = 0; i < sides; i++) {
        for (let j = 0; j < numInputsPerSide; j++) { formattedLetters += letters[(i * numInputsPerSide) + j]; }
        if (i < sides - 1) { formattedLetters += DELIM; }
    }
    return formattedLetters;
}

/**
 * Draws a polygon element with specified sides and radius.
 */
function drawPolygon() {
    // ---------------------------------------------------------------------------------------------
    // get the polygon element and loop through them all
    // ---------------------------------------------------------------------------------------------
    const polygons = document.querySelectorAll('.polygon');
    polygons.forEach(function(polygon) {
    // ---------------------------------------------------------------------------------------------
    // get the number of sides and radius from the data attributes
    // ---------------------------------------------------------------------------------------------
        const sides = parseInt(polygon.dataset.sides, 10);
        const radius = polygon.dataset.radius || DEFAULT__POLYGON_RADIUS;
        const points = createRegularPolygonPoints(sides, radius);
    // ---------------------------------------------------------------------------------------------
    // if any subelements of polygon exist (e.g. svg, circle, polygon, input), remove it
    // ---------------------------------------------------------------------------------------------
        if (polygon.children.length > 0) {
            polygon.innerHTML = '';
        }
        const polygonInputs = document.querySelectorAll('.polygon-input');
        if (polygonInputs.length > 0) {
            polygonInputs.forEach(function(input) { input.remove(); });
        }
    // ---------------------------------------------------------------------------------------------
    // create the SVG element for the polygon
    // ---------------------------------------------------------------------------------------------
        const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgElement.setAttribute('width', '100%');
        svgElement.setAttribute('height', '100%');
        svgElement.setAttribute('viewBox', '0 0 200 200');
        const polygonElement = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygonElement.setAttribute('fill', polygon.dataset.bodyColor || DEFAULT__POLYGON_BODY_COLOR);
        polygonElement.setAttribute('stroke', polygon.dataset.borderColor || DEFAULT__POLYGON_BORDER_COLOR);
        polygonElement.setAttribute('stroke-width', polygon.dataset.borderThickness || DEFAULT__POLYGON_BORDER_WIDTH);
        polygonElement.setAttribute('points', points);
        svgElement.appendChild(polygonElement);
        polygon.appendChild(svgElement);
    // ---------------------------------------------------------------------------------------------
    // get the absolute position of the polygon points
    // ---------------------------------------------------------------------------------------------
        const polygonPoints = polygonElement.points;
        const polygonPointsArray = [];
        for (let i = 0; i < polygonPoints.numberOfItems; i++) {
            polygonPointsArray.push({
                x: polygonPoints.getItem(i).x,
                y: polygonPoints.getItem(i).y
            });
        }
    // ---------------------------------------------------------------------------------------------
    // draw circles at the polygon points
    // ---------------------------------------------------------------------------------------------
        polygonPointsArray.forEach(function(point) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', point.x);
            circle.setAttribute('cy', point.y);
            circle.setAttribute('r', CIRCLE_RADIUS);
            circle.setAttribute('fill', polygon.dataset.borderColor || DEFAULT__CIRCLE_COLOR);
            svgElement.appendChild(circle);
        });
    // ---------------------------------------------------------------------------------------------
    // calculate the scale factors and draw the input fields
    // ---------------------------------------------------------------------------------------------
        const viewBox = svgElement.viewBox.baseVal;
        const viewBoxWidth = viewBox.width;
        const viewBoxHeight = viewBox.height;
        const svgRect = svgElement.getBoundingClientRect();
        const svgWidth = svgRect.width;
        const svgHeight = svgRect.height;
        const scaleX = svgWidth / viewBoxWidth;
        const scaleY = svgHeight / viewBoxHeight;
        const inputs = []; // Array to hold references to all input elements
        const numInputsPerSide = parseInt(polygon.dataset.numInputs) || DEFAULT__NUM_INPUTS_PER_SIDE;
        let letterBufferIndex = 0;
        polygonPointsArray.forEach(function(point) {
            let otherPointIndex = (point === polygonPointsArray[polygonPointsArray.length - 1]) ? 0 : polygonPointsArray.indexOf(point) + 1;
            let otherPoint = polygonPointsArray[otherPointIndex];
            let inputPositions = getInputPositions(point, otherPoint);
            inputPositions.forEach(function(inputPosition, index) {
                let input = document.createElement('input');
                input.setAttribute('type', 'text');
                input.setAttribute('value', lettersBuffer[letterBufferIndex]);
                letterBufferIndex++;
                input.setAttribute('maxlength', '1');
                input.classList.add('polygon-input');
                input.style.position = 'absolute';
                input.style.left = `${inputPosition.x}px`;
                input.style.top = `${inputPosition.y}px`;
                input.style.transform = 'translate(-25%, -25%)';
                input.style.width = `${INPUT_SIZE_PX}px`;
                input.style.height = `${INPUT_SIZE_PX}px`;
                input.style.textAlign = 'center';
                inputs.push(input);
                document.body.appendChild(input);
            });
        });
    // ---------------------------------------------------------------------------------------------
    // add an input event listener to each input field
    // ---------------------------------------------------------------------------------------------
        let deleteKeyPressed = false;
        inputs.forEach(function(input, index) {
    // ---------------------------------------------------------------------------------------------
    // check if delete key is pressed
    // ---------------------------------------------------------------------------------------------
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
    // ---------------------------------------------------------------------------------------------
    // check if input is valid and handle if delete key is pressed
    // ( if the delete key is pressed )
    // - clear the value
    // - change the background color to white
    // - change the focus to the previous input
    // - if the previous input is the first input, change the focus to the last input
    // - return
    // ---------------------------------------------------------------------------------------------
            input.addEventListener('input', function() {
                let value = input.value;
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
                } else if (deleteKeyPressed) return;
    // ---------------------------------------------------------------------------------------------
    // if delete key is not pressed, check if the input is valid
    // ---------------------------------------------------------------------------------------------
                value = value.toLowerCase();
                if (!value.match(/[a-z]/i)) {
                    input.style.backgroundColor = INPUT_ERROR_COLOR;
                    input.value = '';
                    // display an error message point at the input saying only letters are allowed
                    // this.setCustomValidity('Only letters are allowed');
                    return;
                } else input.style.backgroundColor = INPUT_VALID_COLOR;
    // ---------------------------------------------------------------------------------------------
    // check if the letter appears more than once
    // ---------------------------------------------------------------------------------------------
                value = value.toUpperCase();
                input.value = value;
                let values = [];
                inputs.forEach(function(input, index) { values.push(input.value); });
                values.splice(index, 1);
                if (values.includes(value)) {
                    input.style.backgroundColor = INPUT_ERROR_COLOR;
                    input.value = '';
                    // display a message to the user saying only unique values are allowed
                    return;
                }
    // ---------------------------------------------------------------------------------------------
    // the character is valid, so
    // - set the letterBuffer at index to the value
    // - if the input is the last input, set the first input to be focused
    // - otherwise, set the next input to be focused
    // ---------------------------------------------------------------------------------------------
                lettersBuffer[index] = value;
                if(input.value.length === 1 && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                    inputs[index + 1].select();
                }
                if(input.value.length === 1 && index === inputs.length - 1) {
                    inputs[0].focus();
                    inputs[0].select();
                }
            });
        });
        /**
         * Calculates the positions of input points between two given points.
         * @param {Object} pointA - The starting point.
         * @param {Object} pointB - The ending point.
         * @returns {Array} - An array of input positions.
         */
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
    });
}

/**
 * Sets the maximum value for the inputs-slider based on the sides-slider value.
 * If the maximum value is less than the current inputs-slider value, it updates the inputs-slider value.
 * If the maximum value has changed, it updates the max attribute of the inputs-slider and scales the slider accordingly.
 * If the maximum value is 1, it disables the inputs-slider, otherwise, it enables it.
 */
function setInputMax() {
    let sides = document.getElementById('sides-slider').value;
    let inputs = document.getElementById('inputs-slider').value;
    let max = Math.floor(26 / sides);
    if (max < inputs) document.getElementById('inputs-slider').value = max;
    if (max !== parseInt(document.getElementById('inputs-slider').getAttribute('max'))) {
        document.getElementById('inputs-slider').setAttribute('max', max);
        scaleSliderAccordingToValue();
    }
    if (max === 1) document.getElementById('inputs-slider').setAttribute('disabled', 'disabled');
    else document.getElementById('inputs-slider').removeAttribute('disabled');
}

/**
 * Scales the slider width according to the value of the limitIter variable.
 */
function scaleSliderAccordingToValue() {
    let limitIter = document.getElementById('inputs-slider').getAttribute('max');    
    let percent = (limitIter / POLYGON_MAX_SIDES) * SLIDER_MAX_WIDTH_PX;
    document.getElementById('inputs-slider').style.width = `${percent}px`;
}

/**
 * Creates an array of points that form a regular polygon.
 * 
 * @param {number} sides - The number of sides of the polygon.
 * @param {number} radius - The radius of the polygon.
 * @returns {string} - The points of the polygon as a string.
 */
function createRegularPolygonPoints(sides, radius) {
    const offset = Math.PI / 4; // Set offset to 45 degrees to start at top right
    const step = 2 * Math.PI / sides; // Angle between vertices
    let points = [];
    for (let i = 0; i < sides; i++) {
        const x = 50 + radius * Math.cos(step * i - offset);
        const y = 50 + radius * Math.sin(step * i - offset);
        points.push(`${x},${y}`);
    }
    return points.join(' ');
}