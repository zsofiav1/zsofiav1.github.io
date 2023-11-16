document.addEventListener('DOMContentLoaded', drawPolygon);
document.addEventListener('input', drawPolygon);

function drawPolygon() {
    // log i am here
    console.log('i am here');
    const polygons = document.querySelectorAll('.polygon');

    polygons.forEach(function(polygon) {
        const sides = parseInt(polygon.dataset.sides, 10); // Number of sides as specified in data-sides attribute
        const radius = polygon.dataset.radius || 40; // Radius from data attribute, or default to 40 if not set
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
        polygonElement.setAttribute('fill', polygon.dataset.bodyColor || 'white');
        polygonElement.setAttribute('stroke', polygon.dataset.borderColor || 'black');
        polygonElement.setAttribute('stroke-width', polygon.dataset.borderThickness || '1');
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
            circle.setAttribute('r', 2);
            circle.setAttribute('fill', 'red');
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
        
        // Draw input fields at the polygon points
        const inputs = []; // Array to hold references to all input elements
        const numInputsPerSide = parseInt(polygon.dataset.numInputs) || 1;
        const inputSizePx = 20;

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
                input.style.width = `${inputSizePx}px`;
                input.style.height = `${inputSizePx}px`;

                // Store the input in the array
                inputs.push(input);
            
                // append to the body or a relative positioned container instead of the polygon
                document.body.appendChild(input); // or your specific container
            });
        });

        function getInputPositions(pointA, pointB) {
            let AinputX = (pointA.x * scaleX) + svgRect.left - (inputSizePx / 2);
            let AinputY = (pointA.y * scaleY) + svgRect.top - (inputSizePx / 2);
            let BinputX = (pointB.x * scaleX) + svgRect.left - (inputSizePx / 2);
            let BinputY = (pointB.y * scaleY) + svgRect.top - (inputSizePx / 2);
            let inputPositions = [];
            const inputXStep = (BinputX - AinputX) / (numInputsPerSide + 1);
            const inputYStep = (BinputY - AinputY) / (numInputsPerSide + 1);
            for (let i = 0; i < numInputsPerSide + 1; i++) {
                if (i === 0) { continue }
                let input = {
                    x: AinputX + (inputXStep * i),
                    y: AinputY + (inputYStep * i)
                };
                inputPositions.push(input);
            }
            return inputPositions;
        }

        // Add an input event listener to each input field
        inputs.forEach(function(input, index) {
            input.addEventListener('input', function() {
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
    var polygon = document.getElementById('polygon');
    polygon.setAttribute('data-sides', this.value);
});

document.getElementById('inputs-slider').addEventListener('input', function() {
    var polygon = document.getElementById('polygon');
    polygon.setAttribute('data-num-inputs', this.value);
});
