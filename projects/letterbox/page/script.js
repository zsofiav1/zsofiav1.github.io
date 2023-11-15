document.addEventListener('DOMContentLoaded', function() {
    const polygons = document.querySelectorAll('.polygon');

    polygons.forEach(function(polygon) {
        const sides = parseInt(polygon.dataset.sides, 10); // Number of sides as specified in data-sides attribute
        const radius = polygon.dataset.radius || 40; // Radius from data attribute, or default to 40 if not set
        const points = createRegularPolygonPoints(sides, radius);

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
        // log them
        console.log(polygonPointsArray);

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
        
        // // Draw input fields at the polygon points
        // const inputs = []; // Array to hold references to all input elements

        // // Draw input fields at the polygon points
        // polygonPointsArray.forEach(function(point) {
        //     const input = document.createElement('input');
        //     input.setAttribute('type', 'text');
        //     input.setAttribute('value', '');
        //     input.setAttribute('maxlength', '1');
        //     input.classList.add('polygon-input'); // Added a class for styling or selecting if needed
            
        //     // Scale the point positions to the actual size of the SVG in the document
        //     const inputX = (point.x * scaleX) + svgRect.left;
        //     const inputY = (point.y * scaleY) + svgRect.top;
            
        //     // Adjust for the input field dimensions to center them
        //     const inputOffsetX = inputX - 10; // half of the input width
        //     const inputOffsetY = inputY - 10; // half of the input height
            
        //     input.style.position = 'absolute';
        //     input.style.left = `${inputOffsetX}px`;
        //     input.style.top = `${inputOffsetY}px`;
        //     input.style.transform = 'translate(-25%, -25%)';
        //     input.style.width = '20px';
        //     input.style.height = '20px';

        //     // Store the input in the array
        //     inputs.push(input);
            
        //     // append to the body or a relative positioned container instead of the polygon
        //     document.body.appendChild(input); // or your specific container
        // });

        function splitSideIntoSections(pointA, pointB, sections, container) {
            const deltaX = (pointB.x - pointA.x) / sections;
            const deltaY = (pointB.y - pointA.y) / sections;
            const inputs = [];

            for (let i = 1; i < sections; i++) {
                const inputX = pointA.x + deltaX * i;
                const inputY = pointA.y + deltaY * i;

                const input = document.createElement('input');
                input.setAttribute('type', 'text');
                input.setAttribute('value', '');
                input.setAttribute('maxlength', '1');
                input.style.position = 'absolute';
                input.style.left = `${inputX}px`;
                input.style.top = `${inputY}px`;
                input.style.transform = 'translate(-50%, -50%)';
                input.style.width = '20px';
                input.style.height = '20px';

                container.appendChild(input);
                inputs.push(input);
            }
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
});
