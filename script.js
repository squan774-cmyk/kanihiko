const game = document.getElementById("game");
const player = document.getElementById("player");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const endScreen = document.getElementById("end-screen");
const finalScore = document.getElementById("final-score");
const restartBtn = document.getElementById("restart-btn");

const sounds = {
  kani: new Audio('assets/kani.mp3'),
  kata: new Audio('assets/kata.mp3'),
  teki: new Audio('assets/teki.mp3'),
  pin: new Audio('assets/pin.mp3')
};

let score = 0;
let timeLeft = 30;
let gameInterval;
let spawnInterval;

function updateScore(points) {
  score += points;
  scoreEl.textContent = `Score: ${score}`;
}

function spawnItem() {
  const types = [
    { src: "kani.png", point: 1, sound: "kani" },
    { src: "kata.png", point: 10, sound: "kata" },
    { src: "teki.png", point: -100, sound: "teki" }
  ];

  const item = types[Math.floor(Math.random() * types.length)];
  const img = document.createElement("img");
  img.src = `assets/${item.src}`;
  img.className = "falling";
  img.style.left = `${Math.random() * (window.innerWidth - 50)}px`;
  img.dataset.point = item.point;
  img.dataset.sound = item.sound;

  game.appendChild(img);

  img.animate([
    { top: '-60px' },
    { top: `${window.innerHeight}px` }
  ], {
    duration: 3000 + Math.random() * 2000,
    easing: 'linear'
  });

  const fallTime = 5000;

  const fallTimeout = setTimeout(() => {
    if (game.contains(img)) game.removeChild(img);
  }, fallTime);

  const checkInterval = setInterval(() => {
    const itemRect = img.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    if (
      itemRect.bottom > playerRect.top &&
      itemRect.top < playerRect.bottom &&
      itemRect.right > playerRect.left &&
      itemRect.left < playerRect.right
    ) {
      clearInterval(checkInterval);
      clearTimeout(fallTimeout);
      game.removeChild(img);
      updateScore(parseInt(img.dataset.point));
      sounds[img.dataset.sound].currentTime = 0;
      sounds[img.dataset.sound].play();
    }
  }, 50);
}

function movePlayer(event) {
  const isTouch = event.type.includes("touch");
  const x = isTouch ? event.touches[0].clientX : event.clientX;
  const maxLeft = window.innerWidth - player.offsetWidth;
  const left = Math.min(Math.max(0, x - player.offsetWidth / 2), maxLeft);
  player.style.left = `${left}px`;
}

function startGame() {
  score = 0;
  timeLeft = 30;
  updateScore(0);
  timerEl.textContent = `Time: ${timeLeft}`;
  endScreen.classList.add("hidden");

  gameInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `Time: ${timeLeft}`;
    if (timeLeft <= 0) endGame();
  }, 1000);

  spawnInterval = setInterval(spawnItem, 700);
}

function endGame() {
  clearInterval(gameInterval);
  clearInterval(spawnInterval);

  document.querySelectorAll(".falling").forEach(el => el.remove());

  finalScore.textContent = `あなたのスコア: ${score}点`;
  endScreen.classList.remove("hidden");
  sounds.pin.play();
}

restartBtn.addEventListener("click", startGame);
window.addEventListener("mousemove", movePlayer);
window.addEventListener("touchmove", movePlayer);

// キーボードでも動かす
window.addEventListener("keydown", e => {
  const step = 20;
  const currentLeft = parseInt(player.style.left || 0);
  if (e.key === "ArrowLeft") {
    player.style.left = `${Math.max(0, currentLeft - step)}px`;
  } else if (e.key === "ArrowRight") {
    player.style.left = `${Math.min(window.innerWidth - player.offsetWidth, currentLeft + step)}px`;
  }
});

startGame();
