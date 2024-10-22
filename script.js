// DOM Elements
const widthSlider = document.getElementById('widthSlider');
const heightSlider = document.getElementById('heightSlider');
const rowsSlider = document.getElementById('rowsSlider');
const densitySlider = document.getElementById('densitySlider');
const widthValue = document.getElementById('widthValue');
const heightValue = document.getElementById('heightValue');
const rowsValue = document.getElementById('rowsValue');
const densityValue = document.getElementById('densityValue');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Initial Values
let widthCm = parseInt(widthSlider.value);
let heightCm = parseInt(heightSlider.value);
let rows = parseInt(rowsSlider.value);
let density = parseInt(densitySlider.value);
let scaledPixelsPerCm = 2.7; // Reduced by 30%

const minCellWidthCm = 10;
const maxCellWidthCm = 80;
const minRowHeightCm = 16;
const maxRowHeightCm = 60;

// Update values based on sliders
function updateValues() {
    widthCm = parseInt(widthSlider.value);
    heightCm = parseInt(heightSlider.value);
    rows = parseInt(rowsSlider.value);
    density = parseInt(densitySlider.value);

    widthValue.textContent = widthCm;
    heightValue.textContent = heightCm;
    rowsValue.textContent = rows;
    densityValue.textContent = density;

    adjustRowSliderLimits();
    drawFurniture();
}

// Adjust the slider limits for rows based on the total height and row constraints
function adjustRowSliderLimits() {
    const minRows = Math.ceil(heightCm / maxRowHeightCm); // Minimum rows to ensure each row is <= 60 cm
    const maxRows = Math.floor(heightCm / minRowHeightCm); // Maximum rows to ensure each row is >= 16 cm

    rowsSlider.min = minRows;
    rowsSlider.max = maxRows;

    if (rows < minRows) rows = minRows;
    if (rows > maxRows) rows = maxRows;

    rowsSlider.value = rows;
    rowsValue.textContent = rows;
}

// Calculate the number of columns based on the width and column density, while keeping column width within limits
function calculateNumberOfColumns() {
    // When the width is less than or equal to 80 cm, there should be a single cell at minimum density
    if (widthCm <= maxCellWidthCm && density === 0) {
        return 1;
    }

    // When density is 0%, use the minimum number of columns (i.e., the widest possible cell within constraints)
    const minColumns = Math.ceil(widthCm / maxCellWidthCm); // Minimum number of columns
    // When density is 100%, use the maximum number of columns (i.e., the narrowest possible cell within constraints)
    const maxColumns = Math.floor(widthCm / minCellWidthCm); // Maximum number of columns

    // Calculate number of columns based on the density (0-100%)
    let numColumns = Math.round(minColumns + ((maxColumns - minColumns) * (density / 100)));

    // Ensure column widths stay within the limits
    let columnWidth = widthCm / numColumns;
    while (columnWidth < minCellWidthCm && numColumns > 1) {
        numColumns--; // Reduce columns to ensure width is within limits
        columnWidth = widthCm / numColumns;
    }
    while (columnWidth > maxCellWidthCm) {
        numColumns++; // Increase columns to ensure width is within limits
        columnWidth = widthCm / numColumns;
    }

    return numColumns;
}

// Draw the furniture based on current settings
function drawFurniture() {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Calculate furniture dimensions in pixels
    const scaledWidth = widthCm * scaledPixelsPerCm;
    const rowHeight = Math.min(maxRowHeightCm, heightCm / rows) * scaledPixelsPerCm;

    // Position the bottom row at the bottom of the canvas
    const offsetX = (canvasWidth - scaledWidth) / 2;
    const offsetY = canvasHeight - rowHeight * rows; // The bottom row's position remains fixed at the bottom

    // Calculate number of columns based on the total width and density
    const numColumns = calculateNumberOfColumns();
    const columnWidth = scaledWidth / numColumns;

    // Draw horizontal lines (rows)
    ctx.strokeStyle = 'blue';
    for (let i = 0; i <= rows; i++) {
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY + i * rowHeight);
        ctx.lineTo(offsetX + scaledWidth, offsetY + i * rowHeight);
        ctx.stroke();
    }

    // Draw vertical lines (columns)
    for (let i = 0; i <= numColumns; i++) {
        ctx.beginPath();
        ctx.moveTo(offsetX + i * columnWidth, offsetY);
        ctx.lineTo(offsetX + i * columnWidth, offsetY + rowHeight * rows);
        ctx.stroke();
    }

    // Draw cell width labels and measurement lines
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < numColumns; col++) {
            const xPos = offsetX + col * columnWidth;
            const yPos = offsetY + row * rowHeight;

            const cellWidthCm = (columnWidth / scaledPixelsPerCm).toFixed(1); // Calculate width in cm

            // Draw the width text in smaller font
            ctx.fillStyle = 'grey';
            ctx.font = '10px Arial'; // Smaller font size
            ctx.textAlign = 'center';
            ctx.fillText(cellWidthCm + ' cm', xPos + columnWidth / 2, yPos + rowHeight / 2 - 5); // Slightly higher than the center

            // Draw yellow background for the line below the text
            const lineWidth = columnWidth * 0.7;
            const lineStartX = xPos + (columnWidth - lineWidth) / 2;
            const lineY = yPos + rowHeight / 2 + 10;

            ctx.fillStyle = 'yellow'; // Yellow background below the text
            ctx.fillRect(lineStartX - 3, lineY - 7, lineWidth + 6, 14);

            // Draw the width measurement line with two arrows
            ctx.strokeStyle = 'lightgrey';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(lineStartX, lineY);
            ctx.lineTo(lineStartX + lineWidth, lineY);
            ctx.stroke();

            // Draw two arrows (left and right)
            drawArrow(ctx, lineStartX, lineY, true); // Left arrow
            drawArrow(ctx, lineStartX + lineWidth, lineY, false); // Right arrow
        }
    }

    // Draw row height labels next to each row
    drawRowHeightLabels(offsetX, offsetY, rowHeight);
}

// Draw row height labels
function drawRowHeightLabels(offsetX, offsetY, rowHeight) {
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let row = 0; row < rows; row++) {
        const rowHeightCm = (rowHeight / scaledPixelsPerCm).toFixed(1);
        const yPos = offsetY + row * rowHeight + rowHeight / 2;

        // Draw yellow background for the row height
        const textWidth = ctx.measureText(rowHeightCm + ' cm').width;
        ctx.fillStyle = 'yellow';
        ctx.fillRect(offsetX - 50 - textWidth - 6, yPos - 8, textWidth + 6, 16);

        // Draw the row height text
        ctx.fillStyle = 'grey';
        ctx.fillText(`${rowHeightCm} cm`, offsetX - 55, yPos);
    }
}

// Function to draw an arrow
function drawArrow(ctx, x, y, left = true) {
    ctx.beginPath();
    if (left) {
        ctx.moveTo(x + 5, y - 3);
        ctx.lineTo(x, y);
        ctx.lineTo(x + 5, y + 3);
    } else {
        ctx.moveTo(x - 5, y - 3);
        ctx.lineTo(x, y);
        ctx.lineTo(x - 5, y + 3);
    }
    ctx.stroke();
}

// Resize the canvas to fit the window
function resizeCanvas() {
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;
    drawFurniture();
}

// Event listeners for sliders
widthSlider.addEventListener('input', updateValues);
heightSlider.addEventListener('input', updateValues);
rowsSlider.addEventListener('input', updateValues);
densitySlider.addEventListener('input', updateValues);

// Initialize on load
window.onload = function() {
    resizeCanvas();
    updateValues();
};

// Redraw on window resize
window.addEventListener('resize', resizeCanvas);
