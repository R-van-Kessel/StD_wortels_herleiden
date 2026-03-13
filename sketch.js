/* ======================
   GLOBAL STYLE
====================== */
/* ===== DEVICE DETECT & SCALE (ADD AT TOP) ===== */

let IS_MOBILE = true; // Forceer mobiel voor test
let SCALE_FACTOR = 1;

/* ===== SAFE CURSOR (NO p5 dependency) ===== */
let showHandCursor = false;

const style = document.createElement('style');
style.textContent = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background: #0e1621;
  font-family: Arial, sans-serif;
  padding: 10px 10px 50px;
}

button {
  height: 38px;
  cursor: pointer;
  transition: transform .2s ease, opacity .2s ease;
}

button:hover { transform: scale(1.15); }
button:active { transform: scale(0.95); }

.nav {
  display: flex;
  gap: 5px;
  padding: 5px;
  flex-wrap: nowrap;
  justify-content: center;
  position: relative;
  z-index: 1000;
  width: 100%;
  overflow-x: auto;
}

.nav a {
  color: white;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(255,255,255,.15);
  font-weight: bold;
  font-size: 17px;      
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 40px;
  text-align: center;
}
.nav a:hover { background: rgba(255,255,255,.5); }

@media (max-width: 768px) {
  body {
    padding: 2px 2px 20px;
  }
  
  .nav {
    gap: 3px;
    padding: 3px;
    margin-bottom: 5px;
  }
  
  .nav a {
    padding: 4px 6px;
    font-size: 10px;
  }
}
`;
document.head.appendChild(style);

/* viewport */
let meta = document.querySelector('meta[name="viewport"]');
if (!meta) {
  meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
  document.head.appendChild(meta);
} else {
  meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
}
function setCursor(type) {
  document.body.style.cursor = type;
}

/* =====================================
   NAVIGATIEBALK INSTELLEN
===================================== */

function createNavigation() {
  const nav = document.createElement('nav');
  nav.className = 'nav';
  nav.innerHTML = `
    <a href="https://r-van-kessel.github.io/Summon_the_Dragon/" ontouchstart="">🏠 Home</a>
    <a href="https://r-van-kessel.github.io/Summon_the_Dragon/rekenen.html" ontouchstart="">➗ Rekenen</a>
    <a href="https://r-van-kessel.github.io/Summon_the_Dragon/klas1.html" ontouchstart="">📘 Klas 1</a>
    <a href="https://r-van-kessel.github.io/Summon_the_Dragon/klas2.html" ontouchstart="">📗 Klas 2</a>
    <a href="https://r-van-kessel.github.io/Summon_the_Dragon/klas3.html" ontouchstart="">📙 Klas 3</a>
    <a href="https://r-van-kessel.github.io/Summon_the_Dragon/overig.html" ontouchstart="">🎓 Overig</a>
  `;
  document.body.prepend(nav);
  
  setTimeout(() => {
    nav.querySelectorAll('a').forEach(link => {
      link.style.pointerEvents = 'auto';
      link.style.touchAction = 'manipulation';
      link.addEventListener('touchend', (e) => {
        e.stopPropagation();
        window.location.href = link.href;
      }, { passive: false });
    });
  }, 100);
}

window.addEventListener('keydown', function(e) {
    if (e.code === 'Space' || e.keyCode === 32) {
        if (showDinoGame && dinoGame && !dinoGame.gameOver) {
            e.preventDefault();
            e.stopPropagation();
            dinoGame.dino.jump();
        } else if (showDinoGame && dinoGame && dinoGame.gameOver) {
            e.preventDefault();
            e.stopPropagation();
        } else {
            e.preventDefault();
            e.stopPropagation();
        }
    }
}, true);


/* =====================================
   GRID & LAYOUT INSTELLINGEN
===================================== */

const COLS = 5;
const ROWS = 5;
const CELL_SIZE = 140;
const MARGIN = 200;

const TITLE_SPACE = -200;
const BUTTON_HEIGHT = 40;

const TITLE_TEXT = 'Summon the Dragon';
const TITLE_LINK = 'https://r-van-kessel.github.io/Summon_the_Dragon/index.html';
const TITLE_SIZE = 30;
const TITLE_COLOR = [255, 200, 100];
const TITLE_Y = 30;

const SUBTITLE_TEXT = 'Herleid de wortels (zonder rekenmachine) en roep de draak op!';
const SUBTITLE_SIZE = 14;
const SUBTITLE_COLOR = [255, 200, 100];
const SUBTITLE_Y = 70;

const DRAGON_SCALE_X = 0.9;
const DRAGON_SCALE_Y = 0.9;
const DRAGON_X_OFFSET = 50;
const DRAGON_Y_OFFSET = -80;
const DRAGON_OPACITY = 250;
const DRAGON_BLUR = true;

let blocks = [];
let draggingBlock = null;
let offsetX = 0;
let offsetY = 0;

let canvasButtons = [];

let isChecked = false;
let correctCount = 0;
let isFlashing = false;
let flashCounter = 0;

let dinoGame = null;
let showDinoGame = false;
let totalGamesPlayed = 0;
let dinoGameCount = 0;
let dinoImage = null;
let backgroundImage = null;
let bgLoaded = false;

class CanvasButton {
  constructor(x, y, w, h, label, color, action) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.label = label;
    this.color = color;
    this.action = action;
    this.hovered = false;
    this.hoverProgress = 0;
  }
  
  draw() {
    push();
    
    if (this.hoverProgress > 0) {
      let lift = -4 * this.hoverProgress;
      let scaleAmount = 1 + 0.10 * this.hoverProgress;
      
      translate(this.x + this.w / 2, this.y + this.h / 2 + lift);
      scale(scaleAmount);
      translate(-this.w / 2, -this.h / 2);
      
      drawingContext.shadowBlur = 15 * this.hoverProgress;
      drawingContext.shadowColor = 'rgba(0,0,0,0.4)';
      drawingContext.shadowOffsetY = 3 * this.hoverProgress;
    }
    
    if (this.hoverProgress > 0) {
      let brighten = 30 * this.hoverProgress;
      fill(
        red(this.color) + brighten, 
        green(this.color) + brighten, 
        blue(this.color) + brighten
      );
    } else {
      fill(this.color);
    }
    
    noStroke();
    
    if (this.hoverProgress > 0) {
      rect(0, 0, this.w, this.h, 8);
    } else {
      rect(this.x, this.y, this.w, this.h, 8);
    }
    
    drawingContext.shadowBlur = 0;
    drawingContext.shadowOffsetY = 0;
    
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(IS_MOBILE ? 12 : 16);
    textStyle(BOLD);
    
    if (this.hoverProgress > 0) {
      text(this.label, this.w / 2, this.h / 2);
    } else {
      text(this.label, this.x + this.w / 2, this.y + this.h / 2);
    }
    
    pop();
  }
  
  isClicked(mx, my) {
    return mx > this.x && mx < this.x + this.w && 
           my > this.y && my < this.y + this.h;
  }
  
  checkHover(mx, my) {
    this.hovered = this.isClicked(mx, my);
    const target = this.hovered ? 1 : 0;
    this.hoverProgress = lerp(this.hoverProgress, target, 0.15);
  }
}


  
class Dino {
  constructor() {
    this.x = MARGIN + (COLS * CELL_SIZE) / 4;
    this.y = 0;
    this.width = 50;
    this.height = 53;
    this.vy = 0;
    this.gravity = 0.8;
    this.jumpPower = -15;
    this.onGround = true;
    this.onPlatform = false;
    this.legFrame = 0;

    this.invincible = false;
    this.invincibleUntil = 0;

    this.invincibleDuration = 3000;
    this.invincibleFlickerSpeed = 100;
  }

  activateInvincible() {
    this.invincible = true;
    this.invincibleUntil = millis() + this.invincibleDuration;
  }

  update() {
    if (this.invincible && millis() > this.invincibleUntil) {
      this.invincible = false;
    }

    this.vy += this.gravity;
    this.y += this.vy;

    if (this.y >= 0 && !this.onPlatform) {
      this.y = 0;
      this.vy = 0;
      this.onGround = true;
    }
    
    if (this.y > 0) {
      this.onPlatform = false;
    }
    
    if (this.onGround && frameCount % 6 === 0) {
      this.legFrame = (this.legFrame + 1) % 2;
    }
  }

  jump() {
    if (this.onGround) {
      if (this.onPlatform) {
        this.vy = this.jumpPower * 1.2;
        this.onPlatform = false;
      } else {
        this.vy = this.jumpPower;
      }
      this.onGround = false;
    }
  }

  draw(gameY) {
    push();

    let groundY = gameY + (CELL_SIZE * 2) - this.height;
    let drawY = groundY + this.y;

    fill(0, 0, 0, 40);
    noStroke();
    ellipse(this.x + this.width / 2, drawY + this.height + 2, this.width * 0.6, 10); 

    let flickerOn = true;
    if (this.invincible) {
      flickerOn = (millis() % (this.invincibleFlickerSpeed * 2)) < this.invincibleFlickerSpeed;
    }

    if (flickerOn) {
      if (dinoImage) {
        imageMode(CORNER);
        image(dinoImage, this.x, drawY, this.width, this.height);
      } else {
        textAlign(CENTER, CENTER);
        textSize(this.height);
        text('🦖', this.x + this.width / 2, drawY + this.height / 2);
      }
    }

    pop();
  }

  getBottom(gameY) {
    let groundY = gameY + (CELL_SIZE * 2) - this.height;
    return groundY + this.y + this.height;
  }

  getTop(gameY) {
    let groundY = gameY + (CELL_SIZE * 2) - this.height;
    return groundY + this.y;
  }
}

class Orb {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 12;
    this.collected = false;
  }

  update() {
    this.y += sin(frameCount * 0.1) * 0.5;
  }

  draw() {
    if (!this.collected) {
      push();
      translate(this.x, this.y);
      
      rotate(frameCount * 0.02);
      
      fill(34, 2, 97, 100);
      noStroke();
      beginShape();
      vertex(0, -this.radius * 1.3);
      vertex(this.radius * 0.8, 0);
      vertex(0, this.radius * 1.3);
      vertex(-this.radius * 0.8, 0);
      endShape(CLOSE);
      
      fill(7, 165, 255);
      stroke(0);
      strokeWeight(2);
      beginShape();
      vertex(0, -this.radius);
      vertex(this.radius * 0.6, 0);
      vertex(0, this.radius);
      vertex(-this.radius * 0.6, 0);
      endShape(CLOSE);
      
      fill(255, 255, 255, 180);
      noStroke();
      beginShape();
      vertex(0, -this.radius);
      vertex(this.radius * 0.3, -this.radius * 0.3);
      vertex(0, 0);
      vertex(-this.radius * 0.3, -this.radius * 0.3);
      endShape(CLOSE);
      
      fill(255, 255, 255, 200);
      ellipse(this.radius * 0.4, -this.radius * 0.4, 3);
      ellipse(-this.radius * 0.3, this.radius * 0.3, 2);
      
      pop();
    }
  }

  hits(dino, gameY) {
    let dinoBottom = dino.getBottom(gameY);
    let dinoTop = dino.getTop(gameY);
    let dinoRight = dino.x + dino.width;
    let dinoLeft = dino.x;

    let closestX = constrain(this.x, dinoLeft, dinoRight);
    let closestY = constrain(this.y, dinoTop, dinoBottom);
    let dx = this.x - closestX;
    let dy = this.y - closestY;

    return dx * dx + dy * dy < this.radius * this.radius;
  }
}

class Obstacle {
  constructor(type, xPos) {
    this.type = type;
    this.x = xPos;
    this.scored = false;

    if (type === 'low') {
      this.width = 100;
      this.height = 40;
      this.isPlatform = false;
    } else if (type === 'high') {
      this.width = 25;
      this.height = 80;
      this.isPlatform = false;
    } else {
      this.width = 150;
      this.height = 15;
      this.isPlatform = true;

      this.hasOrb = random() < 0.3;

      if (this.hasOrb) {
        let platformY = CELL_SIZE + 25;
        this.orb = new Orb(
          this.x + this.width * 1.5,
          platformY - 80
        );
      } else {
        this.orb = null;
      }
    }
  }

  update(speed) {
    this.x -= speed;
    if (this.orb) this.orb.x -= speed;
  }

  draw(gameY) {
    push();
    if (this.isPlatform) {
      fill(229, 244, 58);
      stroke(139, 69, 19);
      strokeWeight(2);
      let platformY = gameY + (CELL_SIZE + 25);
      rect(this.x, platformY, this.width, this.height, 4);

      if (this.orb && !this.orb.collected) {
        this.orb.y = platformY - 80;
        this.orb.draw();
      }
    } else {
      fill(231, 76, 60);
      noStroke();
      let obsY = gameY + (CELL_SIZE * 2) - this.height;
      rect(this.x, obsY, this.width, this.height);
    }
    pop();
  }

  hits(dino, gameY) {
    if (this.isPlatform) {
      let platformTop = gameY + CELL_SIZE + 25;
      let platformBottom = platformTop + this.height;
      let dinoBottom = dino.getBottom(gameY);
      let dinoTop = dino.getTop(gameY);
      
      let horizontalOverlap = dino.x + dino.width > this.x && dino.x < this.x + this.width;
      
      if (dino.vy >= 0 && 
          dinoBottom >= platformTop - 5 && 
          dinoBottom <= platformTop + 5 &&
          horizontalOverlap) {
        
        let groundY = gameY + (CELL_SIZE * 2) - dino.height;
        dino.y = platformTop - groundY;
        dino.vy = 0;
        dino.onGround = true;
        dino.onPlatform = true;
      }
      
      if (dino.vy < 0 && 
          dinoTop <= platformBottom + 5 && 
          dinoTop >= platformTop &&
          horizontalOverlap) {
        
        dino.vy = 0;
        let groundY = gameY + (CELL_SIZE * 2) - dino.height;
        dino.y = platformBottom - groundY;
      }

      if (this.hasOrb && !this.orb.collected) {
        if (this.orb.hits(dino, gameY)) {
          this.orb.collected = true;
          dino.activateInvincible();
        }
      }
      
      return false;
    } else {
      let obsTop = gameY + (CELL_SIZE * 2) - this.height;
      let obsBottom = gameY + (CELL_SIZE * 2);
      let dinoBottom = dino.getBottom(gameY);
      let dinoTop = dino.getTop(gameY);

      if (dino.x + dino.width > this.x &&
          dino.x < this.x + this.width &&
          dinoBottom > obsTop &&
          dinoTop < obsBottom) {
        return true;
      }
    }
    return false;
  }

  isOffScreen() {
    return this.x + this.width < MARGIN;
  }
}

class DinoGame {
  constructor() {
    this.dino = new Dino();
    this.obstacles = [];
    this.gameOver = false;
    this.score = 0;
    this.gameSpeed = 6;
    this.spawnTimer = 0;
    this.gamesPlayed = 0;
    this.maxGames = 3;
    this.gameOverTimer = 0;
  }

  reset() {
    this.dino = new Dino();
    this.obstacles = [];
    this.spawnTimer = 0;
    this.gameOver = false;
    this.gameOverTimer = 0;

    if (this.gamesPlayed >= this.maxGames) {
      this.score = 0;
      this.gameSpeed = 6;
      this.gamesPlayed = 0;
    }
  }

  spawnObstacles() {
    let rand = random();
    if (rand < 0.4) {
      this.obstacles.push(new Obstacle('low', MARGIN + COLS * CELL_SIZE));
    } else if (rand < 0.7) {
      this.obstacles.push(new Obstacle('high', MARGIN + COLS * CELL_SIZE));
    } else {
      let platform = new Obstacle('platform', MARGIN + COLS * CELL_SIZE);
      this.obstacles.push(platform);
      let followUp = new Obstacle(random() < 0.5 ? 'low' : 'high', MARGIN + COLS * CELL_SIZE + 250);
      this.obstacles.push(followUp);
    }
  }

  update(gameY) {
    if (this.gameOver) {
      this.gameOverTimer++;
      if (this.gameOverTimer >= 120) {
        if (this.gamesPlayed < this.maxGames) {
          this.reset();
        }
      }
      return;
    }

    this.dino.update();

    this.spawnTimer++;
    let spawnInterval = max(40, 80 - floor(this.score / 5) * 5);
    if (this.spawnTimer > spawnInterval) {
      this.spawnObstacles();
      this.spawnTimer = 0;
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      let obs = this.obstacles[i];
      obs.update(this.gameSpeed);

      if (obs.isPlatform) {
        obs.hits(this.dino, gameY);
      }

      if (!obs.isPlatform && obs.hits(this.dino, gameY)) {
        if (!this.dino.invincible) {
          this.gameOver = true;
          this.gamesPlayed++;
          this.gameOverTimer = 0;
        }
      }

      if (!obs.scored && !obs.isPlatform && obs.x + obs.width < this.dino.x) {
        obs.scored = true;
        this.score++;
      }

      if (obs.isOffScreen()) {
        this.obstacles.splice(i, 1);
      }
    }

    if (frameCount % 180 === 0) {
      this.gameSpeed = min(this.gameSpeed + 0.5, 15);
    }
  }

  draw(gameY) {
    push();
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(MARGIN, gameY, COLS * CELL_SIZE, CELL_SIZE * 2);
    drawingContext.clip();

    fill(135, 206, 235);
    noStroke();
    rect(MARGIN, gameY, COLS * CELL_SIZE, CELL_SIZE * 2);

    fill(139, 69, 19);
    rect(MARGIN, gameY + (CELL_SIZE * 2) - 10, COLS * CELL_SIZE, 10);

    for (let obs of this.obstacles) {
      obs.draw(gameY);
    }

    this.dino.draw(gameY);
    drawingContext.restore();

    fill(51);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(16);
    textStyle(BOLD);
    text('Score: ' + this.score, MARGIN + 10, gameY + 10);

    textSize(14);
    textStyle(NORMAL);
    fill(85);
    text('Games: ' + this.gamesPlayed + '/' + this.maxGames, MARGIN + 10, gameY + 30);
    text('Speed: ' + nf(this.gameSpeed, 1, 1), MARGIN + 10, gameY + 50);

    if (this.gameOver) {
      fill(0, 0, 0, 180);
      rect(MARGIN, gameY, COLS * CELL_SIZE, CELL_SIZE * 2);

      fill(255);
      textAlign(CENTER, CENTER);
      textSize(28);
      textStyle(BOLD);
      text('GAME OVER!', MARGIN + (COLS * CELL_SIZE) / 2, gameY + CELL_SIZE - 20);

      textSize(18);
      textStyle(NORMAL);
      text('Score: ' + this.score, MARGIN + (COLS * CELL_SIZE) / 2, gameY + CELL_SIZE + 10);
      text('Komt er nog een dragon?', MARGIN + (COLS * CELL_SIZE) / 2, gameY + CELL_SIZE + 35);

      if (this.gamesPlayed >= this.maxGames) {
        fill(243, 156, 18);
        textSize(18);
        textStyle(BOLD);
        text('Nee, klik nu op rode reset knop!', MARGIN + (COLS * CELL_SIZE) / 2, gameY + CELL_SIZE + 65);
      }
    }
    pop();
  }
}

  
document.addEventListener('keydown', function(e) {
    if (e.key === ' ' || e.keyCode === 32) {
        if (showDinoGame && dinoGame) {
            e.preventDefault();
        }
    }
}, false);

function styleButton(btn, bgColor, padding) {
    btn.style('padding', padding);
    btn.style('font-size', '16px');
    btn.style('cursor', 'pointer');
    btn.style('background-color', bgColor);
    btn.style('color', 'white');
    btn.style('border', 'none');
    btn.style('border-radius', '8px');
    btn.style('position', 'absolute');  
}

function resetGame() {
    showDinoGame = false;
    dinoGame = null;
    generateQuestions();
}

function showInfo() {
    let overlay = document.createElement('div');
    overlay.id = 'infoOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 999;
    `;
    document.body.appendChild(overlay);
    
    let popup = document.createElement('div');
    popup.id = 'infoPopup';
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        border: 3px solid #333;
        border-radius: 10px;
        padding: 30px;
        max-width: 500px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 1000;
        font-family: Arial, sans-serif;
    `;
    
    popup.innerHTML = `
        <h2 style="color: #fb0427; margin-top: 0;">
        Summon the Dragon
        </h2><br>
        <p style="color: #0E0E0E; line-height: 1.2;">
            <strong>Doel:<br></strong> Los alle 10 sommen correct op en speel de Dragon game!</ol><br><br>
            <strong>Hoe speel je:</strong>
            <ol style="color: #0909B4; margin: 5px 0;">
                <li>Sleep blauwe somblokjes naar de juiste oranje antwoorden.</li>
                <li>Klik "Nakijken" om je antwoorden te controleren.</li>
                <li>Klik op "Score" om de feedback op je resultaten te bekijken.</li>
                <li>Bij een score van 10/10 start de Dragon game automatisch! </li>
            </ol><br>
            <strong>Dragon Game:</strong><li> Spring met spatie of muisklik.</li>
            <li>Spring op de hoge gele trampolines en kom er met een grote boog uit door een snelle dubbelklik!</li>
            <li>Pak de draaiende diamantjes om 3 seconden lang dwars door de hindernissen te kunnen lopen</li>
            <li>Na 3 game-overs komt er een volledige reset.</li>
            <ol style="color: #F44336; margin: 5px 0;">
            </ol><br>
            <strong>Reset:<br></strong> Klik "Reset" voor nieuwe sommen.
            </ol>
        </p>
        <button id="closeBtn" style="
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 10px 30px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
        ">Sluiten</button>
    `;
    
    document.body.appendChild(popup);
    
    let closeBtn = document.getElementById('closeBtn');
    
    closeBtn.addEventListener('click', function() {
        popup.remove();
        overlay.remove();
    });
    
    closeBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        popup.remove();
        overlay.remove();
    });
    
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            popup.remove();
            overlay.remove();
        }
    });
    
    overlay.addEventListener('touchend', function(e) {
        if (e.target === overlay) {
            e.preventDefault();
            popup.remove();
            overlay.remove();
        }
    });
}

function showScoreFeedback() {
    if (!isChecked) {
        return;
    }
    
    let feedbackTitle = '';
    let feedbackText = '';
    let feedbackColor = '';
    
    if (correctCount === 0) {
        feedbackTitle = '😢 Oeps! 0/10';
        feedbackText = 'Nog geen enkele som goed! Splits de wortel in factoren: zoek het grootste kwadraat dat past. Bijv. √12 = √(4·3) = 2√3.';
        feedbackColor = '#e74c3c';
    } else if (correctCount <= 3) {
        feedbackTitle = '😕 Begin is er! ' + correctCount + '/10';
        feedbackText = 'Je hebt er al een paar goed! Onthoud: zoek bij het herleiden de grootste kwadraatvactor. √50 = √(25·2) = 5√2.';
        feedbackColor = '#e67e22';
    } else if (correctCount <= 5) {
        feedbackTitle = '🙂 Halfway! ' + correctCount + '/10';
        feedbackText = 'Je bent al halverwege! Let op bij optellen van wortels: je mag alleen gelijksoortige wortels optellen. 3√2 + 2√2 = 5√2.';
        feedbackColor = '#f39c12';
    } else if (correctCount <= 7) {
        feedbackTitle = '😊 Goed bezig! ' + correctCount + '/10';
        feedbackText = 'Meer dan de helft goed! Jij kunt dit! Controleer of je de wortels helemaal hebt vereenvoudigd en let op slordigheidsfoutjes!';
        feedbackColor = '#3498db';
    } else if (correctCount <= 9) {
        feedbackTitle = '🤩 Bijna perfect! ' + correctCount + '/10';
        feedbackText = 'Fantastisch! Je hebt ze bijna allemaal goed. Nog even opletten en dan roep je de draak op!';
        feedbackColor = '#2ecc71';
    } else {
        feedbackTitle = '🤩 Perfect! ' + correctCount + '/10';
        feedbackText = 'Dragon Master! Je herleidt wortels foutloos. Maar wat is je highscore bij de Dragon game?';
        feedbackColor = '#FFC107';
    }
    
    let overlay = document.createElement('div');
    overlay.id = 'scoreOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 999;
    `;
    document.body.appendChild(overlay);
    
    let popup = document.createElement('div');
    popup.id = 'scorePopup';
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        border: 3px solid ${feedbackColor};
        border-radius: 10px;
        padding: 30px;
        max-width: 500px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 1000;
        font-family: Arial, sans-serif;
    `;
    
    popup.innerHTML = `
        <h2 style="margin-top: 0; color: ${feedbackColor};">
            ${feedbackTitle}
        </h2>
        <p style="color: #333; line-height: 1.6; font-size: 16px;">
            ${feedbackText}
        </p>
        <button id="closeFeedbackBtn" style="
            background-color: ${feedbackColor};
            color: white;
            border: none;
            padding: 10px 30px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
        ">Sluiten</button>
    `;
    
    document.body.appendChild(popup);
    
    let closeBtn = document.getElementById('closeFeedbackBtn');
    
    closeBtn.addEventListener('click', function() {
        popup.remove();
        overlay.remove();
    });
    
    closeBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        popup.remove();
        overlay.remove();
    });
    
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            popup.remove();
            overlay.remove();
        }
    });
    
    overlay.addEventListener('touchend', function(e) {
        if (e.target === overlay) {
            e.preventDefault();
            popup.remove();
            overlay.remove();
        }
    });
}

function keyPressed(event) {
    return false;
}

// =============================================
// GENERATE QUESTIONS - WORTELS HERLEIDEN
// HAVO KLAS 2 - FORMULE-GEBASEERD
// =============================================

// Helperfuncties voor wortelvragen
function maakVereenvoudig() {
    // Genereer √(a²·k) → a√k
    // Maximaal getal onder de wortel: 200
    // a = 2..7, k = alleen 2,3,5,6,7 zodat a²·k ≤ ~200
    let nietKwadraten = [2, 3, 5, 6, 7];
    let a, k, getal;
    let pogingen = 0;
    do {
        a     = floor(random(2, 8));       // buitenste factor 2 t/m 7
        k     = random(nietKwadraten);     // binnenste factor
        getal = a * a * k;
        pogingen++;
    } while (getal > 200 && pogingen < 30);
    return {
        text:   '√' + getal,
        answer: a + '√' + k
    };
}

function maakOptellen() {
    // Genereer p√k ± q√k → (p±q)√k
    // k = niet-kwadraat getal onder wortel
    let nietKwadraten = [2, 3, 5, 6, 7, 10, 11, 13];
    let k  = random(nietKwadraten);
    let p  = floor(random(1, 9));   // eerste coëfficiënt (1 t/m 8)
    let q  = floor(random(1, 9));   // tweede coëfficiënt (1 t/m 8)
    let som = p + q;

    // Willekeurig optellen of aftrekken (bij aftrekken: zorg dat resultaat > 0)
    let isPlus = random() < 0.5;
    if (!isPlus && p === q) isPlus = true; // vermijd 0√k als antwoord
    if (!isPlus && p < q) { let tmp = p; p = q; q = tmp; } // zorg p > q bij aftrekken

    let antwoord = isPlus ? p + q : p - q;
    let pTekst   = p === 1 ? '' : p;   // coëff 1 weglaten: schrijf √k ipv 1√k
    let qTekst   = q === 1 ? '' : q;
    let operator = isPlus ? ' + ' : ' - ';

    return {
        text:   pTekst + '√' + k + operator + qTekst + '√' + k,
        answer: antwoord + '√' + k
    };
}

function maakProduct() {
    // Twee varianten:
    // A) √a · √a = a   (zelfde getal)
    // B) √a · √(a·m²) = a·m   (bijv √2 · √8 = 4, want √2 · √(2·4) = 2·2 = 4)
    let variant = random() < 0.5 ? 'A' : 'B';

    if (variant === 'A') {
        // √n · √n = n, n niet zelf een kwadraat
        let nietKwadraten = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15];
        let n = random(nietKwadraten);
        return {
            text:   '√' + n + ' · √' + n,
            answer: '' + n
        };
    } else {
        // √k · √(k·m²) = k·m
        let nietKwadraten = [2, 3, 5, 6, 7];
        let k = random(nietKwadraten);
        let m = floor(random(2, 6));      // m = 2..5
        let b = k * m * m;
        let antwoord = k * m;
        return {
            text:   '√' + k + ' · √' + b,
            answer: '' + antwoord
        };
    }
}

function maakEenvoudig() {
    // √(n²) = n,  n = 2..12
    let n = floor(random(2, 13));
    return {
        text:   '√' + (n * n),
        answer: '' + n
    };
}

function maakProductMetCoef() {
    // a√b · c√d waarbij het antwoord een geheel getal is
    // Variant A: a√k · b√k = ab·k  (zelfde wortel)
    // Variant B: a√k · b√(k·m²) = abkm  (√k·√(k·m²) = km)
    let nietKwadraten = [2, 3, 5, 6, 7];
    let variant = random() < 0.5 ? 'A' : 'B';

    if (variant === 'A') {
        let k = random(nietKwadraten);
        let a = floor(random(2, 6));
        let b = floor(random(2, 6));
        let antwoord = a * b * k;
        return {
            text:   a + '√' + k + ' · ' + b + '√' + k,
            answer: '' + antwoord
        };
    } else {
        let k = random(nietKwadraten);
        let m = floor(random(2, 4));
        let a = floor(random(2, 5));
        let b = floor(random(2, 5));
        let b2 = k * m * m;
        let antwoord = a * b * k * m;
        return {
            text:   a + '√' + k + ' · ' + b + '√' + b2,
            answer: '' + antwoord
        };
    }
}

function generateQuestions() {
    blocks = [];
    isChecked = false;
    correctCount = 0;
    isFlashing = false;
    flashCounter = 0;

    // Genereer vragen via formules, met dubbelen-check
    let selected = [];
    let gebruikteTexts = new Set();

    function voegToe(generatorFn, pogingen = 20) {
        for (let i = 0; i < pogingen; i++) {
            let vraag = generatorFn();
            if (!gebruikteTexts.has(vraag.text)) {
                gebruikteTexts.add(vraag.text);
                selected.push(vraag);
                return true;
            }
        }
        return false;
    }

    // Verdeling: 4× vereenvoudigen, 2× optellen, 1× product, 2× product met coëf, 1× eenvoudig
    for (let i = 0; i < 2; i++) voegToe(maakVereenvoudig);
    for (let i = 0; i < 2; i++) voegToe(maakOptellen);
    for (let i = 0; i < 2; i++) voegToe(maakProduct);
    for (let i = 0; i < 2; i++) voegToe(maakProductMetCoef);
    for (let i = 0; i < 2; i++) voegToe(maakEenvoudig);

    // Shuffle volgorde
    selected = shuffle(selected);

    let questions = selected;
    let answers = selected.map(q => q.answer);
    answers = shuffle(answers);

    // ===== MAAK VRAAG BLOKJES (rijen 1 en 2) =====
    let questionIndex = 0;
    for (let row = 1; row < 3; row++) {
        for (let col = 0; col < COLS; col++) {
            blocks.push({
                col: col,
                row: row,
                startCol: col,
                startRow: row,
                x: MARGIN + col * CELL_SIZE,
                y: MARGIN + row * CELL_SIZE + BUTTON_HEIGHT + TITLE_SPACE,
                isDragging: false,
                isPlaced: false,
                text: questions[questionIndex].text,
                answer: questions[questionIndex].answer,
                isQuestion: true,
                isCorrect: null,
                isHovered: false,
                hoverProgress: 0,
            });
            questionIndex++;
        }
    }

    let answerIndex = 0;
    for (let row = 3; row < 5; row++) {
        for (let col = 0; col < COLS; col++) {
            blocks.push({
                col: col,
                row: row,
                startCol: col,
                startRow: row,
                x: MARGIN + col * CELL_SIZE,
                y: MARGIN + row * CELL_SIZE + BUTTON_HEIGHT + TITLE_SPACE,
                isDragging: false,
                isPlaced: true,
                text: "" + answers[answerIndex],
                answer: answers[answerIndex],
                isQuestion: false,
                isCorrect: null,
                isHovered: false,
                hoverProgress: 0,
            });
            answerIndex++;
        }
    }
}
// =============================================

function setup() {
    createNavigation();
    
    IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (IS_MOBILE) {
        let baseCanvasWidth = COLS * CELL_SIZE + MARGIN * 2;
        let baseCanvasHeight = ROWS * CELL_SIZE + MARGIN * 2 + BUTTON_HEIGHT + TITLE_SPACE;
        
        let availableWidth = window.innerWidth - 20;
        let availableHeight = window.innerHeight - 150;
        
        let scaleByWidth = availableWidth / baseCanvasWidth;
        let scaleByHeight = availableHeight / baseCanvasHeight;
        
        SCALE_FACTOR = Math.min(scaleByWidth, scaleByHeight);
        SCALE_FACTOR = constrain(SCALE_FACTOR, 0.3, 1.2);
    } else {
        SCALE_FACTOR = 1;
    }
    
    let wrapper = createDiv();
    wrapper.style('display', 'flex');
    wrapper.style('flex-direction', 'column');
    wrapper.style('align-items', 'center');
    wrapper.style('width', '100%');
        
    let container = createDiv();
    container.parent(wrapper);
    container.style('position', 'relative');
    container.style('display', 'inline-block');
    
    let canvasWidth = COLS * CELL_SIZE + MARGIN * 2;
    let canvasHeight = ROWS * CELL_SIZE + MARGIN * 2 + BUTTON_HEIGHT + TITLE_SPACE;

    let cnv = createCanvas(canvasWidth, canvasHeight);
    cnv.parent(container);

    cnv.elt.style.touchAction = 'none';  
    cnv.elt.style.userSelect = 'none';
  
    if (IS_MOBILE) {
        cnv.elt.style.maxWidth = '100vw';
        cnv.elt.style.height = 'auto';
        cnv.elt.style.width = '100%';
        container.elt.style.width = '100%';
        container.elt.style.padding = '0';
        container.elt.style.margin = '0';
    }
    
    loadImage('background_dragon.png', 
      (img) => { backgroundImage = img; bgLoaded = true; },
      () => {
        loadImage('background_dragon.png', 
          (img) => { backgroundImage = img; bgLoaded = true; }
        );
      }
    );
 
    loadImage('dino.png', (img) => { dinoImage = img; });
    
    generateQuestions();
    
    let btnW = IS_MOBILE ? 75 : 90;
    let btnH = IS_MOBILE ? 35 : 38;
    let btnY = MARGIN + TITLE_SPACE + BUTTON_HEIGHT + 80;
    let btnGap = IS_MOBILE ? 15 : 50;

    let totalWidth = btnW * 3 + (btnW + 20) + btnGap * 3;

    if (IS_MOBILE && totalWidth > width - 40) {
        let availableWidth = width - 40;
        btnGap = 10;
        btnW = (availableWidth - (btnGap * 3) - 20) / 4;
    }
    let startX = (width - totalWidth) / 2; 
  
    canvasButtons = [
      new CanvasButton(
        startX, 
        btnY, 
        btnW, 
        btnH, 
        'Nakijken', 
        color(76, 175, 80), 
        checkAnswers
      ),
      new CanvasButton(
        startX + btnW + btnGap, 
        btnY, 
        btnW + 20, 
        btnH, 
        'Score: 0/10', 
        color(156, 39, 176), 
        showScoreFeedback
      ),
      new CanvasButton(
        startX + (btnW + btnGap) * 2 + 20, 
        btnY, 
        btnW, 
        btnH, 
        'Reset', 
        color(244, 67, 54), 
        resetGame
      ),
      new CanvasButton(
        startX + (btnW + btnGap) * 3 + 20, 
        btnY, 
        btnW, 
        btnH, 
        'ℹ Info', 
        color(3, 169, 244), 
        showInfo
      )
    ];
    
    document.body.style.backgroundColor = '#0e1621';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
}
 
function draw() {
    background(14, 22, 33);  
    
    if (bgLoaded && backgroundImage) {
        push();
        
        let scaledW = width * DRAGON_SCALE_X;
        let scaledH = height * DRAGON_SCALE_Y;
        
        let imgX = (width - scaledW) / 2 + DRAGON_X_OFFSET;
        let imgY = (height - scaledH) / 2 + DRAGON_Y_OFFSET;
        
        tint(255, DRAGON_OPACITY);
        
        imageMode(CORNER);
        image(backgroundImage, imgX, imgY, scaledW, scaledH);
        
        noTint();
        
        if (DRAGON_BLUR) {
            fill(14, 22, 33, 100);
            noStroke();
            rect(0, 0, width, height);
        }
        
        pop();
    }
    
    push();
    fill(TITLE_COLOR[0], TITLE_COLOR[1], TITLE_COLOR[2]);
    textAlign(CENTER, TOP);
    textSize(TITLE_SIZE);
    textStyle(BOLD);

    let titleWidth = textWidth(TITLE_TEXT);
    let titleX = width / 2;
    let isHoveringTitle = mouseX > titleX - titleWidth/2 && 
                          mouseX < titleX + titleWidth/2 && 
                          mouseY > TITLE_Y && 
                          mouseY < TITLE_Y + TITLE_SIZE;

    text(TITLE_TEXT, width / 2, TITLE_Y);

    fill(SUBTITLE_COLOR[0], SUBTITLE_COLOR[1], SUBTITLE_COLOR[2]);
    textSize(SUBTITLE_SIZE);
    textStyle(NORMAL);
    text(SUBTITLE_TEXT, width / 2, SUBTITLE_Y);
    pop();
    
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const x = MARGIN + col * CELL_SIZE;
            const y = MARGIN + row * CELL_SIZE + BUTTON_HEIGHT + TITLE_SPACE;
            if (showDinoGame && (row === 1 || row === 2)) continue;
            if (row >= 3) {
                fill(200, 220, 200, 0);
            } else {
                fill(220, 220, 200, 0);
            }
            stroke(100, 100, 100, 0);
            strokeWeight(2);
            rect(x, y, CELL_SIZE, CELL_SIZE);
        }
    }   
    
    for (let block of blocks) {
        block.isHovered = false;

        if (
            !IS_MOBILE &&
            !showDinoGame &&
            block.isQuestion &&
            block.row >= 1 && block.row < 3 &&
            !draggingBlock &&
            mouseX >= block.x &&
            mouseX <= block.x + CELL_SIZE &&
            mouseY >= block.y &&
            mouseY <= block.y + CELL_SIZE
        ) {
            block.isHovered = true;
        }

        const target = block.isHovered ? 1 : 0;
        block.hoverProgress = lerp(block.hoverProgress, target, 0.15);
    }

    for (let block of blocks) {
        if (!block.isQuestion && block !== draggingBlock) {
            if (showDinoGame && (block.row === 1 || block.row === 2)) continue;
            drawBlock(block);
        }
    }

    for (let block of blocks) {
        if (block.isQuestion && block !== draggingBlock) {
            if (showDinoGame && (block.row === 1 || block.row === 2)) continue;
            drawBlock(block);
        }
    }
  
    if (isFlashing) {
        flashCounter++;
        if (flashCounter % 20 < 10) {
            fill(255, 255, 0, 150);
            noStroke();
            rect(0, 0, width, height);
        }
        if (flashCounter > 100) {
            isFlashing = false;
            flashCounter = 0;
            
            if (totalGamesPlayed >= 1 || dinoGame !== null) {
                showDinoGame = true;
            } else {
                showDinoGame = true;
                dinoGame = new DinoGame();
            }
        }
    }
    
    if (showDinoGame && dinoGame) {
        const gameY = MARGIN + CELL_SIZE + BUTTON_HEIGHT + TITLE_SPACE;
        dinoGame.update(gameY);
        dinoGame.draw(gameY);
    }

    if (draggingBlock) {
        drawBlock(draggingBlock);
    }
    
    for (let btn of canvasButtons) {
        if (!IS_MOBILE && !draggingBlock) {
            btn.checkHover(mouseX, mouseY);
        }
        btn.draw();
    }
    
    if (canvasButtons.length > 1) {
        canvasButtons[1].label = 'Score: ' + correctCount + '/10';
    }
  
    showHandCursor = false;
    
    if (!showDinoGame && !draggingBlock) {
        for (let btn of canvasButtons) {
            if (btn.isClicked(mouseX, mouseY)) {
                showHandCursor = true;
                break;
            }
        }
    }

    if (!showDinoGame && !showHandCursor) {
        for (let block of blocks) {
            if (
                block.isQuestion &&
                block.row >= 1 && block.row < 3 &&
                mouseX >= block.x &&
                mouseX <= block.x + CELL_SIZE &&
                mouseY >= block.y &&
                mouseY <= block.y + CELL_SIZE
            ) {
                showHandCursor = true;
                break;
            }
        }
    }
    
    if (draggingBlock) {
        showHandCursor = true;
    }

    if (!IS_MOBILE) {
        setCursor(showHandCursor ? 'pointer' : 'default');
    } else {
        setCursor('default');
    }
}

function drawBlock(block) {
    push();
    
    if (block.isQuestion && block.hoverProgress > 0) {
        let lift = -6 * block.hoverProgress;
        let scaleAmount = 1 + 0.15 * block.hoverProgress;
        
        translate(block.x + CELL_SIZE / 2, block.y + CELL_SIZE / 2 + lift);
        scale(scaleAmount);
        translate(-CELL_SIZE / 2, -CELL_SIZE / 2);
        
        drawingContext.shadowBlur = 20 * block.hoverProgress;
        drawingContext.shadowColor = 'rgba(0,0,0,0.5)';
        drawingContext.shadowOffsetY = 4 * block.hoverProgress;
    } 
  
    if (isChecked && block.isCorrect !== null) {
        if (block.isCorrect) {
            fill(100, 200, 100);
        } else {
            fill(250, 100, 100);
        }
    } else if (block.isQuestion) {
        fill(100, 150, 250);
    } else {
        fill(255, 200, 100);
    }
  
    stroke(50, 100, 200);
    strokeWeight(3);
    if (block.isQuestion && block.hoverProgress > 0) {
        rect(5, 5, CELL_SIZE - 10, CELL_SIZE - 10, 5);
    } else {
        rect(block.x + 5, block.y + 5, CELL_SIZE - 10, CELL_SIZE - 10, 5);
    }
    
    drawingContext.shadowBlur = 0;
    drawingContext.shadowOffsetY = 0;
    
    fill(0);
    noStroke();

    let cx = (block.isQuestion && block.hoverProgress > 0) ? CELL_SIZE / 2 : block.x + CELL_SIZE / 2;
    let cy = (block.isQuestion && block.hoverProgress > 0) ? CELL_SIZE / 2 : block.y + CELL_SIZE / 2;

    if (block.text.includes('√')) {
        // Tokeniseer: splits tekst in brokjes van type 'root' of 'normal'
        // Bijv. "3√2 + √5" → [{t:'normal',s:'3'}, {t:'root'}, {t:'normal',s:'2 + '}, {t:'root'}, {t:'normal',s:'5'}]
        let tokens = [];
        let buf = '';
        for (let i = 0; i < block.text.length; i++) {
            if (block.text[i] === '√') {
                if (buf !== '') { tokens.push({ t: 'normal', s: buf }); buf = ''; }
                tokens.push({ t: 'root' });
            } else {
                buf += block.text[i];
            }
        }
        if (buf !== '') tokens.push({ t: 'normal', s: buf });

        // Meet totale breedte voor centrering
        textStyle(BOLD);
        let totalW = 0;
        for (let tok of tokens) {
            if (tok.t === 'root') {
                textSize(24);
                totalW += textWidth('√');
            } else {
                textSize(16);
                totalW += textWidth(tok.s);
            }
        }

        // Teken elk token op de juiste x-positie
        let drawX = cx - totalW / 2;
        textAlign(LEFT, CENTER);
        for (let tok of tokens) {
            if (tok.t === 'root') {
                textStyle(BOLD);
                textSize(24);
                text('√', drawX, cy + 1);
                drawX += textWidth('√');
            } else {
                textStyle(BOLD);
                textSize(16);
                text(tok.s, drawX, cy);
                drawX += textWidth(tok.s);
            }
        }

    } else {
        textAlign(CENTER, CENTER);
        textStyle(BOLD);
        textSize(16);
        textLeading(25);
        text(block.text, cx, cy);
    }
    
    pop();
}
  
function checkAnswers() {
    isChecked = true;
    correctCount = 0;
    
    for (let block of blocks) block.isCorrect = null;
    
    for (let questionBlock of blocks) {
        if (questionBlock.isQuestion) {
            let answerBlock = null;
            for (let block of blocks) {
                if (!block.isQuestion && block.col === questionBlock.col && block.row === questionBlock.row) {
                    answerBlock = block;
                    break;
                }
            }
            if (answerBlock && questionBlock.answer === answerBlock.answer) {
                questionBlock.isCorrect = true;
                answerBlock.isCorrect = true;
                correctCount++;
            } else {
                questionBlock.isCorrect = false;
                if (answerBlock) answerBlock.isCorrect = false;
            }
        }
    }
    
    if (correctCount === 10) {
        isFlashing = true;
        flashCounter = 0;
        
        if (canvasButtons.length > 1) {
            canvasButtons[1].color = color(255, 215, 0);
        }
    } else {
        if (canvasButtons.length > 1) {
            canvasButtons[1].color = color(156, 39, 176);
        }
    }
}


function mousePressed() {
    pointerDown(mouseX, mouseY);
    return false;
}

function mouseDragged() {
    pointerMove(mouseX, mouseY);
    return false;
}

function mouseReleased() {
    pointerUp();
    return false;
}

function touchStarted() {
    if (touches.length > 0) {
        pointerDown(touches[0].x, touches[0].y);
    }
    return false;
}

function touchMoved() {
    if (touches.length > 0) {
        pointerMove(touches[0].x, touches[0].y);
    }
    return false;
}

function touchEnded() {
    pointerUp();
    return false;
}

    
function pointerDown(px, py) {
    showHandCursor = false;
    
    for (let btn of canvasButtons) {
        if (btn.isClicked(px, py)) {
            btn.action();
            return false;
        }
    }

    if (showDinoGame && dinoGame && !dinoGame.gameOver) {
        dinoGame.dino.jump();
        return false;
    }

    if (!showDinoGame) {
        for (let i = blocks.length - 1; i >= 0; i--) {
            let block = blocks[i];
            if (
                block.isQuestion &&
                block.row < 3 &&
                px > block.x && px < block.x + CELL_SIZE &&
                py > block.y && py < block.y + CELL_SIZE
            ) {
                draggingBlock = block;
                offsetX = px - block.x;
                offsetY = py - block.y;
                block.isDragging = true;
                isChecked = false;
                showHandCursor = true;
                break;
            }
        }
    }
}

function pointerMove(px, py) {
    if (draggingBlock) {
        draggingBlock.x = px - offsetX;
        draggingBlock.y = py - offsetY;
        showHandCursor = true;
    }
}

function pointerUp() {
    if (!draggingBlock) return;

    draggingBlock.isDragging = false;
    snapBlock(draggingBlock);
    draggingBlock = null;
}

function snapBlock(block) {
  // Middelpunt van het gesleepte blokje
  let centerX = block.x + CELL_SIZE / 2;
  let centerY = block.y + CELL_SIZE / 2;

  // Zoek een antwoordblokje waar het middelpunt overheen hangt
  let targetAnswer = null;
  for (let other of blocks) {
    if (!other.isQuestion) {
      if (centerX > other.x && centerX < other.x + CELL_SIZE &&
          centerY > other.y && centerY < other.y + CELL_SIZE) {
        targetAnswer = other;
        break;
      }
    }
  }

  if (targetAnswer) {
    // Check of er al een ander vraagblok op dit antwoordblok staat
    let bezet = false;
    for (let other of blocks) {
      if (other !== block && other.isQuestion &&
          other.col === targetAnswer.col && other.row === targetAnswer.row) {
        bezet = true;
        break;
      }
    }

    if (!bezet) {
      block.col = targetAnswer.col;
      block.row = targetAnswer.row;
      block.x = targetAnswer.x;
      block.y = targetAnswer.y;
      return;
    }
  }

  // Geen geldig antwoordblokje gevonden → terug naar start
  block.col = block.startCol;
  block.row = block.startRow;
  block.x = MARGIN + block.startCol * CELL_SIZE;
  block.y = MARGIN + block.startRow * CELL_SIZE + BUTTON_HEIGHT + TITLE_SPACE;
}