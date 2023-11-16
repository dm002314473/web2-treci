var myGamePiece;
var asteroids = [];
var startTime;
var bestTime = localStorage.getItem('bestTime' || Infinity);
var bestPlayer = localStorage.getItem('bestPlayer') || 'Duje';
var starfield = createStars();

function startGame() {
    var pieceSize = Math.min(window.innerWidth, window.innerHeight) * 0.035;
    myGamePiece = new component(pieceSize, pieceSize, "red", window.innerWidth / 2 - 15, window.innerHeight / 2 - 15);
    generateAsteroids(7);
    if (!myGameArea.interval) {
        startTime = new Date().getTime();
    }
    myGameArea.start();
}

function createStars() {
    var stars = [];
    for (var i = 0; i < 100; i++) {
        var size = Math.random() * 2;
        var x = Math.random() * window.innerWidth;
        var y = Math.random() * window.innerHeight;
        var speed = 0.5;

        stars.push({
            x: x,
            y: y,
            size: size,
            speed: speed,
            direction: 1,
        })
    }
    return stars;
}

function generateAsteroid() {
    var minSize = Math.min(window.innerWidth, window.innerHeight) * 0.02;
    var maxSize = Math.min(window.innerWidth, window.innerHeight) * 0.06;
    var asteroidSize = Math.random() * (maxSize - minSize) + minSize;

    var side = Math.floor(Math.random() * 4);
    var x, y;

    var speed_x, speed_y;

    switch (side) {
        case 0:
            x = Math.random() * window.innerWidth;
            y = -30;
            speed_x = Math.random() * 2 - 1;
            speed_y = Math.random() * 2 + 1;
            break;
        case 1:
            x = window.innerWidth + 30;
            y = Math.random() * window.innerHeight;
            speed_x = -1 * (Math.random() * 2 + 1);
            speed_y = Math.random() * 2 - 1;
            break;
        case 2:
            x = Math.random() * window.innerWidth;
            y = window.innerHeight + 30;
            speed_x = Math.random() * 2 - 1;
            speed_y = -1 * (Math.random() * 2 + 1);
            break;
        case 3:
            x = -30;
            y = Math.random() * window.innerHeight;
            speed_x = Math.random() * 2 + 1;
            speed_y = Math.random() * 2 - 1;
            break;
        default:
            break;
    }

    var asteroid = new component(asteroidSize, asteroidSize, "gray", x, y);
    asteroid.speed_x = speed_x;
    asteroid.speed_y = speed_y;
    asteroids.push(asteroid);
}

function generateAsteroids(numAsteroids) {
    for (var i = 0; i < numAsteroids; i++) {
        generateAsteroid();
    }
}

function updateGameArea() {
    var ctx = myGameArea.context;
    myGameArea.clear();
    myGamePiece.speed_x = 0;
    myGamePiece.speed_y = 0;

    for (var i = 0; i < starfield.length; i++) {
        var star = starfield[i];

        star.x += star.speed;
        if(star.x > window.innerWidth) {
            star.x = 0;
        }

        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.arc(star.x, star.y, star.size, 0, 2 * Math.PI);
        ctx.fill();
    }

    if (myGameArea.keys && myGameArea.keys[37]) { myGamePiece.speed_x = -1.5; } // Left arrow
    if (myGameArea.keys && myGameArea.keys[39]) { myGamePiece.speed_x = 1.5; }  // Right arrow
    if (myGameArea.keys && myGameArea.keys[38]) { myGamePiece.speed_y = -1.5; } // Up arrow
    if (myGameArea.keys && myGameArea.keys[40]) { myGamePiece.speed_y = 1.5; }

    myGamePiece.newPos();
    myGamePiece.update();

    for (var i = 0; i < asteroids.length; i++) {
        asteroids[i].newPos();
        asteroids[i].update();

        if (isCollision(myGamePiece, asteroids[i])) {
            handleCollision();
        }

        if (asteroids[i].y > window.innerHeight ||
            asteroids[i].x < -asteroids[i].width ||
            asteroids[i].x > window.innerWidth ||
            asteroids[i].y < -asteroids[i].height
        ) {
            asteroids.splice(i, 1);
            i--;
        }
    }

    if (Math.random() < 0.02) {
        generateAsteroid();
        console.log(asteroids.length);
    }

    updateTimer();
}

function isCollision(obj1, obj2) {
    return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
    );
}

function handleCollision() {
    var collisionSound = document.getElementById("collisionSound");
    collisionSound.play();

    myGameArea.stop();

    var currentTime = new Date().getTime();
    var elapsedTime = currentTime - startTime;

    if (elapsedTime > bestTime) {
        bestTime = elapsedTime;
        var playerName = prompt("Congratulations! You made a high score! Enter your name: ");
        localStorage.setItem('bestTime', bestTime);
        localStorage.setItem('bestPlayer', playerName);
    }

    var ctx = myGameArea.context;
    ctx.font = "30px Arial";
    ctx.fillStyle = "White";
    ctx.fillText("Game Over", window.innerWidth / 2 - 80, window.innerHeight / 2 - 80);
    ctx.fillText("Your Time: " + formatTime(elapsedTime), window.innerWidth / 2 - 120, window.innerHeight / 2 - 40)
    ctx.fillText("Best Time: " + formatTime(bestTime), window.innerWidth / 2 - 120, window.innerHeight / 2);
    ctx.fillText("Best Player: " + bestPlayer, window.innerWidth / 2 - 120, window.innerHeight / 2 + 40);
}

var myGameArea = {
    canvas: document.getElementById("gameCanvas"),
    keys: {},
    start: function () {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.context = this.canvas.getContext("2d");
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);
        window.addEventListener('keydown', function (e) {
            myGameArea.keys[e.keyCode] = true;
        });
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = false;
        });
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop: function () {
        clearInterval(this.interval);
    }
};

function formatTime(miliseconds) {
    var minutes = Math.floor(miliseconds / (60 * 1000));
    var seconds = Math.floor(miliseconds % (60 * 1000) / 1000);
    var miliseconds = miliseconds & 1000;
    return (
        padNumber(minutes, 2) + ":" +
        padNumber(seconds, 2) + "." +
        padNumber(miliseconds, 3)
    );
}

function padNumber(number, width) {
    var numberString = number.toString();
    while (numberString.length < width) {
        numberString = "0" + numberString;
    }
    return numberString;
}

function updateTimer() {
    var currentTime = new Date().getTime();
    var elapsedTime = currentTime - startTime;

    var ctx = myGameArea.context;
    ctx.font = "20px Arial";
    ctx.fillStyle = "White";
    ctx.fillText("Your Time: " + formatTime(elapsedTime), window.innerWidth - 200, 20);

    ctx.fillText("Best Time: " + formatTime(bestTime), window.innerWidth - 200, 40);
    ctx.fillText("Best Player: " + bestPlayer,  window.innerWidth - 200, 60)
}

function component(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.speed_x = 0;
    this.speed_y = 0;
    this.x = x;
    this.y = y;
    
    this.update = function () {
        ctx = myGameArea.context;
        ctx.fillStyle = color;

        ctx.shadowBlur = 5;
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";

        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.shadowBlur = 0;
        ctx.shadowColor = "transparent";
    };
    this.newPos = function () {
        this.x += this.speed_x;
        this.y += this.speed_y;

        if (this.x > window.innerWidth) {
            this.x = -this.width;
        } else if (this.x < -this.width) {
            this.x = window.innerWidth;
        }

        if (this.y > window.innerHeight) {
            this.y = -this.height;
        } else if (this.y < -this.height) {
            this.y = window.innerHeight;
        }
    };
}