//Cantidad de frames que toman los invasores para moverse
let MOVE_INTERVAL = 30;
//Cuantos frames pasan entre disparos de los invasores
const SHOT_PAUSE = 300;
//Tiempo de invencibilidad del jugador después de recibir daño
const PLAYER_INVINCIBLE = 60 * 2 - 20;
const scale = 3;

let invaders = [];
let bullets = [],
	invaderBullets = [];
let player;

let invaderImg, invader2Img, spaceshipImg, bullet2Img, barrierImg;
let invaderFont;

let frameCount = 0;
let invaderSpeed = 1;

let playerLives, score, win;

let init = false;

function preload() {
	invaderImg = loadImage("/src/assets/sprites/invader.png");
	invader2Img = loadImage("/src/assets/sprites/invader2.png");
	spaceshipImg = loadImage("/src/assets/sprites/spaceship.png");
	bulletImg = loadImage("/src/assets/sprites/bullet.png");
	bullet2Img = loadImage("/src/assets/sprites/bullet2.png");

	//"cosmic alien" font
	invaderFont = loadFont("/src/assets/fonts/ca.ttf");
}

function setup() {
  console.log(Math.min(500, window.innerWidth));
	createCanvas(Math.min(500, window.innerWidth), Math.min(500, window.innerWidth));
	noSmooth();
	textFont(invaderFont);


	//Crear invaders
	let invWidth = scale * invaderImg.width,
		invHeight = scale * invaderImg.height;

	let x = -(scale * 5 + invWidth) + scale,
		y = scale,
		yidx = 0;
	for (let i = 0; i < 9 * 4; ++i) {
		x += scale * 5 + invWidth;
		if (x >= width - invWidth * 3) {
			y += scale * 5 + invHeight;
			yidx++;
			x = scale;
		}
		invaders.push(new Invader(x, y, invWidth, invHeight, (yidx % 2 == 0) ? invaderImg : invader2Img));
	}

	//Crear al jugador
	player = new Player(width / 2, height - spaceshipImg.height * scale, spaceshipImg.width * scale, spaceshipImg.height * scale, spaceshipImg);

	playerLives = 2;
	score = 0;
	win = false;

	MOVE_INTERVAL = 30;

	loop();
}

function draw() {

	background(0);

	if (init) {
		frameCount++;

		//Lógica
		if (keyIsDown(LEFT_ARROW)) {
			player.move(-scale);
		} else if (keyIsDown(RIGHT_ARROW)) {
			player.move(scale);
		}
		player.update(frameCount);

		for (let bullet of invaderBullets) {
			bullet.update(frameCount);
			if (!player.invincible && player.intersects(bullet)) {
				bullet.deadMarked = true;
				gameOver();
			}
		}

		for (let invader of invaders) {
			invader.update(frameCount);
			bullets.forEach(bullet => {
				if (bullet.intersects(invader)) {
					score += floor((1 / MOVE_INTERVAL) * 300);
					if (invader.img === invader2Img) score += 10;
					MOVE_INTERVAL -= 0.1;
					bullet.deadMarked = true;
					invader.deadMarked = true;
				}
			});
		}
		for (let bullet of bullets) {
			bullet.update(frameCount);
		}
		if (invaders.some(invader => invader.right() >= width || invader.left() <= 0))
			invaders.forEach(invader => {
				invader.pos.add(p5.Vector.mult(invader.vel, -1));
				invader.pos.y += scale * 5;
				invader.vel.x = -invader.vel.x;
			});

		//Eliminar balas e invaders
		bullets = bullets.filter(bullet => !bullet.deadMarked && bullet.lower() >= 0);
		invaderBullets = invaderBullets.filter(bullet => !bullet.deadMarked && bullet.upper() <= height);
		invaders = invaders.filter(invader => !invader.deadMarked);

		if (invaders.length == 0) {
			win = true;
		}

		//draw

		for (let invader of invaders) {
			invader.draw();
		}
		for (let bullet of bullets) {
			bullet.draw();
		}
		for (let bullet of invaderBullets) {
			bullet.draw();
		}
		player.draw();

		noStroke();
		fill(255);
		textSize(28);
		textAlign(LEFT, TOP);
		text(`Lives ${playerLives}`, 0, 0);
		textAlign(RIGHT, TOP);
		fill(win ? 0 : 255, 255, win ? 0 : 255)
		text(`${score}`, width, 0);

		if (playerLives < 0) {
			textAlign(CENTER, CENTER);
			textSize(64);
			text("GAME OVER", width / 2, height / 2);
		}

		if (win) {
			score += playerLives * 100;
			textAlign(RIGHT, TOP);
			fill(win ? 0 : 255, 255, win ? 0 : 255)

			textAlign(CENTER, CENTER);
			textSize(64);
			text("YOU WIN", width / 2, height / 2);

			noLoop();
		}
	}else {
		textSize(20);
		fill("RED");
		textStyle(BOLD);
		textAlign(CENTER);
		text("Presiona enter para iniciar", width/2 , height/2 - 20);
		text("<- Izquierda, -> Derecha", width/2 , height/2 );
		text("Barra espaciadora - Disparo", width/2 , height/2 + 20);
		text("r - resetear", width/2 , height/2 + 40);
	}

}

function keyPressed() {
	if (keyCode === 32) {
		player.shoot();
	}

	if (key === 'r') {
		restart();
	}

	if (keyCode === ENTER) {
		init = true;
	}
}

function move() {
	if (mouseY < height/2) {
		player.shoot();
	} else if(mouseX > width/2) {
		player.move(scale);
	} else if(mouseX < width/2) {
		player.move(-scale);
	}
}

function mousePressed() {
	return false;
}

function mouseDragged() {
	return false;
}

function createBullet(x, y) {
	bulletPrefab = new Sprite(x, y, bulletImg.width * scale, bulletImg.height * scale, bulletImg);
	bulletPrefab.vel = createVector(0, -scale * 2);
	bulletPrefab.deadMarked = false;
	bulletPrefab.update = function updateBullet(frameCount) {
		this.pos.add(this.vel);
	}
	return bulletPrefab;
}

function gameOver() {
	playerLives--;
	//Hacer al jugador invencible
	player.invincible = true;

	if (playerLives < 0) {
		console.log("GAME OVER");
		restart();
	}
}

function restart() {
	redraw();
	noLoop();

	setTimeout(() => {
		invaders = [];
		bullets = [];
		invaderBullets = [];
		player.pos.x = width / 2;

		setup();
	}, 3000);
}
const sign = n => n > 0 ? 1 : n === 0 ? 0 : -1;
