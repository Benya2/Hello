const colorsChoice = document.querySelector('#colorsChoice'); 
const game = document.querySelector('#game');
const cursor = document.querySelector('#cursor');

game.width = 1200;
game.height = 600;
const gridCellSize = 10;

const ctx = game.getContext('2d');

// Создаём отдельный canvas для рисования сетки
const gridCanvas = document.createElement('canvas');
gridCanvas.width = game.width;
gridCanvas.height = game.height;
const gridCtx = gridCanvas.getContext('2d');

game.parentElement.appendChild(gridCanvas);

const colorList = [
    "#FFEBEE", "#FCE4EC", "#F3E5F5", "#B39DDB", "#9FA8DA", "#90CAF9", "#81D4FA", "#80DEEA",
    "#4DB6AC", "#66BB6A", "#9CCC65", "#CDDC39", "#FFEB3B", "#FFC107", "#FF9800", "#FF5722",
    "#A1887F", "#E0E0E0", "#90A4AE", "#000"
];
let currentColorChoice = colorList[9];

const firebaseConfig = {
  apiKey: "AIzaSyB3pMyrMDTbsnWmRDsroSREHPhm1Eog144",
  authDomain: "warrrr-5674a.firebaseapp.com",
  projectId: "warrrr-5674a",
  storageBucket: "warrrr-5674a.firebasestorage.app",
  messagingSenderId: "762690248667",
  appId: "1:762690248667:web:67bcb5b327346647eb11fe"
};

const app = initializeApp(firebaseConfig);
const db = firebase.firestore();

colorList.forEach(color => {
    const colorItem = document.createElement('div');
    colorItem.style.backgroundColor = color;
    colorsChoice.appendChild(colorItem);

    colorItem.addEventListener('click', () => {
        currentColorChoice = color;
        colorItem.innerHTML = `<i class="fa-solid fa-check"></i>`;
        setTimeout(() => colorItem.innerHTML = "", 1000);
    });
});

function createPixel(x, y, color) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.fillRect(x, y, gridCellSize, gridCellSize);
}

function addPixelIntoGame() {
    const x = cursor.offsetLeft;
    const y = cursor.offsetTop - game.offsetTop;

    const pixelRef = db.collection('pixels').doc(`${x}-${y}`);
    pixelRef.get().then(doc => {
        createPixel(x, y, currentColorChoice);
        pixelRef.set({ x, y, color: currentColorChoice }, { merge: true });
    });
}

let isShiftPressed = false;
let isDrawing = false;

document.addEventListener("keydown", (event) => {
    if (event.key === "Shift") {
        isShiftPressed = true;
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "Shift") {
        isShiftPressed = false;
        isDrawing = false;
    }
});

game.addEventListener("mousedown", () => {
    if (isShiftPressed) {
        isDrawing = true;
    } else {
        addPixelIntoGame();
    }
});

game.addEventListener("mouseup", () => {
    isDrawing = false;
});

game.addEventListener("mousemove", () => {
    if (isShiftPressed && isDrawing) {
        addPixelIntoGame();
    }
});

function drawGrids(ctx, width, height, cellWidth, cellHeight) {
    ctx.beginPath();
    ctx.strokeStyle = "#ccc";

    for (let i = 0; i <= width; i += cellWidth) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
    }

    for (let i = 0; i <= height; i += cellHeight) {
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
    }
    ctx.stroke();
}

drawGrids(gridCtx, game.width, game.height, gridCellSize, gridCellSize);

game.addEventListener('mousemove', function (event) {
    const cursorLeft = event.clientX - (cursor.offsetWidth / 2);
    const cursorTop = event.clientY - (cursor.offsetHeight / 2);
    cursor.style.left = Math.floor(cursorLeft / gridCellSize) * gridCellSize + "px";
    cursor.style.top = Math.floor(cursorTop / gridCellSize) * gridCellSize + "px";
});

db.collection('pixels').onSnapshot(querySnapshot => {
    querySnapshot.docChanges().forEach(change => {
        const { x, y, color } = change.doc.data();
        createPixel(x, y, color);
    });
});
