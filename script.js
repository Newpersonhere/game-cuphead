const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

window.onload = () => {

    // Variables
    let gameOver = false
    let score = 0
    let player;
    let gravity;
    let gameSpeed;
    let keys = {}
    ctx.font = '30px AlegreyaSansSC-Black'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = "white"

    // Audios
    let startAudio = new Audio('/Sounds/cuphead-narrator-now-go.mp3')
    let backgroundAudio = new Audio('/Sounds/background-music.mp3')
    let gameOverAudio = new Audio('/Sounds/game-over.mp3')
    let winnerAudio = new Audio('/Sounds/winner.mp3')


    // Event Listeners
    document.addEventListener('keydown', (evt) => {
        keys[evt.code] = true;
    });
    document.addEventListener('keyup', (evt) => {
        keys[evt.code] = false;
    });

    
    // Start game
    const start = () => {
        gameSpeed = 3
        gravity = 1
        player = new Player()
        requestAnimationFrame(Update)
    }

    // Start game button
    let gameStarted = false
    document.getElementById('start-button').onclick = () => {
        if (!gameStarted) {
            gameStarted = true
            start()
            startAudio.volume = 0.5
            startAudio.play()
            setTimeout(() => {
                backgroundAudio.volume = 0.3
                backgroundAudio.play()
            }, 1005)
        }
    };

    //Flower sprite

    const images = {}
    images.flower = new Image()
    images.flower.src = '/Images/sprite-flower.png'

    const flowerWidth = 709.9
    const flowerHeigth = 877
    let flowerFrameX = 0
    let flowerFrameY = 0
    let flowerX = 450
    let flowerY = 60

    const drawSprite = (img, sX, sY, sW, sH, dX, dY, dW, dH) => {
        ctx.drawImage(img, sX, sY, sW, sH, dX, dY, dW, dH)
    }

    //Animation sprite
    let counter = 0
    const animateSprite = () => {
        drawSprite(images.flower, (flowerWidth * flowerFrameX), (flowerHeigth * flowerFrameY), flowerWidth, flowerHeigth, flowerX, flowerY, 250, 350)
        if (flowerFrameX < 20) {
            counter++
            if (counter === 4) {
                flowerFrameX += 1
                counter = 0
            }
        } else {
            flowerFrameX = 0
        }
    }


    // Player
    class Player {
        constructor() {
            this.x = 30
            this.y = 0
            this.w = 60
            this.h = 80
            this.img = new Image()
            this.img.src = '/Images/player.png'
            this.imgL = new Image()
            this.imgL.src = '/Images/player-left.png'
            this.dy = 0
            this.jumpForce = 12
            this.grounded = false
            this.jumpTimer = 0
            this.direction = 'right'
        }

        animate() {

            // Jump
            if (keys['Space']) {
                this.jump()

            } else {
                this.jumpTimer = 0
            }
            if (keys['ArrowLeft']) {
                this.x -= 5
                this.direction = 'left'
            }
            if (keys['ArrowRight']) {
                this.x += 5
                this.direction = 'right'
            }
            this.y += this.dy

            // Gravity
            if (this.y + this.h < canvas.height - 90) {
                this.dy += gravity
                this.grounded = false

            } else {
                this.dy = 0
                this.grounded = true
                this.y = canvas.height - this.h - 90
            }
            this.drawSelf()
        }

        jump() {
            if (this.grounded && this.jumpTimer == 0) {
                this.jumpTimer = 1
                this.dy = -this.jumpForce
            } else if (this.jumpTimer > 0 && this.jumpTimer < 15) {
                this.jumpTimer++
                this.dy = -this.jumpForce - (this.jumpTimer / 50)
            }
        }

        drawRight() {
            ctx.drawImage(this.img, this.x, this.y, this.w, this.h)
        }

        drawLeft() {
            ctx.drawImage(this.imgL, this.x, this.y, this.w, this.h)
        }
        
        drawSelf() {
            if (this.direction === 'left') {
                this.drawLeft()
            } else if (this.direction === 'right') {
                this.drawRight()
            }
        }

    }

    // Obstacles

    class Seeds {
        constructor() {
            this.width = 40
            this.height = 30
            this.x = 500
            this.y = Math.floor(Math.random() * ((390 - this.width) - 60)) + 60
            this.img = new Image()
            this.img.src = '/Images/acorn.png'
        }

        draw() {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height)
        }

        moveSelf() {
            this.x -= 5
        }
    }

    // Seeds
    let counterSeeds = 0
    let arrayOfSeeds = []
    const createSeeds = () => {
        counterSeeds++
        if (counterSeeds === 35) {
            const seed = new Seeds()
            arrayOfSeeds.push(seed)
            counterSeeds = 0
        }

    }

    const drawSeeds = () => {
        arrayOfSeeds.forEach(seed => {
            seed.draw()
        })
    }

    const moveSeeds = () => {
        arrayOfSeeds.forEach(seed => {
            seed.moveSelf()
        })
    }



    //Colision

    const checkCollision = () => {
        arrayOfSeeds.forEach((seed) => {
            if (seed.x === player.x) {
                let seedYandH = seed.y + seed.height
                let playerYandH = player.y + player.h
                //Comprueba por arriba || comprueba por abajo || comprueba de frente
                if ((seedYandH > player.y && seed.y < player.y) || (seed.y < playerYandH && seedYandH > playerYandH) ||
                    (player.y < seed.y && playerYandH > seedYandH)) {
                    gameOver = false;
                    gameStarted = false
                    buttonStartToReload()
                    backgroundAudio.pause()
                    gameOverImg()
                    gameOverAudio.volume = 0.3
                    gameOverAudio.play()
                } else {
                    score += 10

                }
            }
        })
    }
    // Game Over

    const gameOverImg = () => {
        let looser = new Image()
        looser.src = './Images/game-over.png'

        looser.onload = () => {
            ctx.drawImage(looser, 0, 0, canvas.width, canvas.height)
        }
    }
    // Check for win
    const checkForWin = () => {
        if (score === 400) {
            gameOver = true
            winnerImg()
            backgroundAudio.pause()
            winnerAudio.volume = 0.3
            winnerAudio.play()
            buttonStartToReload()
        }
    }


    // Winner
    const winnerImg = () => {
        let winner = new Image()
        winner.src = './Images/winner.jpg'
        winner.onload = () => {
            ctx.drawImage(winner, 0, 0, canvas.width, canvas.height)
        }
    }

    //Render score
    const renderScore = () => {
        ctx.fillText(`Score: ${score}`, 150, 50)
    }


    //Check borders
    const checkBorders = () => {
        if (player.x > 740) {
            player.x = 740
        }
        if (player.x < 40) {
            player.x = 40
        }
    }

    // Clear canvas
    const clearCanvas = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }



    //Loop
    function Update() {
        if (!gameOver) {
            clearCanvas()
            player.animate()
            animateSprite()
            createSeeds()
            drawSeeds()
            moveSeeds()
            checkBorders()
            checkCollision()
            checkForWin()
            renderScore()
            gameSpeed += 0.003;
            requestAnimationFrame(Update)
        }
    }


    //Reload 

    const buttonStartToReload = () => {
        const reloadButton = document.getElementById('start-button')
        reloadButton.innerText = 'RELOAD'
        reloadButton.addEventListener('click', () => {
            location.reload()
            startAudio.pause()


        })
    }

    //Pause sound button

    const soundButton = document.getElementById('pause-button')
    soundButton.addEventListener('click', () => {
        soundButton.classList.toggle('muted')
        if (soundButton.classList.contains('muted')) {
            backgroundAudio.muted = true
        } else {
            backgroundAudio.muted = false
            soundButton.classList.toggle('playing')


        }
    })
}
