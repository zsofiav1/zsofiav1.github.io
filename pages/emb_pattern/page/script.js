document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const coordinatesDisplay = document.getElementById('coordinates');
    const widthSlider = document.getElementById('width-slider');
    const heightSlider = document.getElementById('height-slider');
    const resetButton = document.getElementById('reset-button');
    const canvas = document.getElementById('line-canvas');
    const ctx = canvas.getContext('2d');
    const runPython = document.getElementById('run-python');
    const output = document.getElementById('output');
    let firstPoint = null;
    let isDrawing = false;
    let lines = [];

    function getPointCoordinates(element) {
        const rect = element.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        return {
            x: rect.left - canvasRect.left + rect.width / 2,
            y: rect.top - canvasRect.top + rect.height / 2
        };
    }

    function createGrid(width, height) {
        grid.innerHTML = ''; // Clear existing grid
        grid.style.gridTemplateColumns = `repeat(${width}, 80px)`;
        grid.style.gridTemplateRows = `repeat(${height}, 80px)`;
        canvas.width = grid.offsetWidth;
        canvas.height = grid.offsetHeight+20;

        for (let i = 0; i < width * height; i++) {
            const gridItem = document.createElement('div');
            gridItem.classList.add('grid-item');
            gridItem.dataset.coord = `${Math.floor(i / width)},${i % width}`;

            const point = document.createElement('div');
            point.classList.add('point');
            gridItem.appendChild(point);
            grid.appendChild(gridItem);
        }
    }

    function drawLine(startX, startY, endX, endY, isTemporary = false) {
        if (isTemporary) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            redrawLines();
        }
        ctx.strokeStyle = '#ff0000'; // Red color for the line
        ctx.lineWidth = 3;           // Increased line width
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }

    function redrawLines() {
        lines.forEach(line => drawLine(line.startX, line.startY, line.endX, line.endY));
    }

    grid.addEventListener('click', function(event) {
        if (event.target.classList.contains('point')) {
            const pointCoords = getPointCoordinates(event.target);
            coordinatesDisplay.textContent = `Clicked Coordinates: ${event.target.parentNode.dataset.coord}`;

            if (firstPoint) {
                lines.push({ startX: firstPoint.x, startY: firstPoint.y, endX: pointCoords.x, endY: pointCoords.y });
                redrawLines();
                firstPoint = pointCoords;
            } else {
                firstPoint = pointCoords;
                isDrawing = true;
            }
        }
    });

    grid.addEventListener('mousemove', function(event) {
        if (isDrawing && firstPoint) {
            const mouseX = event.clientX - canvas.getBoundingClientRect().left;
            const mouseY = event.clientY - canvas.getBoundingClientRect().top;
            drawLine(firstPoint.x, firstPoint.y, mouseX, mouseY, true);
        }
    });

    grid.addEventListener('contextmenu', function(event) {
        event.preventDefault();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawLines();
        firstPoint = null;
        isDrawing = false;
    });

    resetButton.addEventListener('click', () => {
        createGrid(widthSlider.value, heightSlider.value);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        firstPoint = null;
        isDrawing = false;
        lines = [];
        coordinatesDisplay.textContent = '';
    });

    widthSlider.addEventListener('input', () => {
        createGrid(widthSlider.value, heightSlider.value);
        redrawLines();
    });

    heightSlider.addEventListener('input', () => {
        createGrid(widthSlider.value, heightSlider.value);
        redrawLines();
    });


    // Initialize the grid
    createGrid(widthSlider.value, heightSlider.value);
});

