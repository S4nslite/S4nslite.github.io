const musica = document.getElementById("musica");
const cartaTexto = document.querySelector(".carta p");

const FADE_MS = 4000;
const TICK_MS = 100;
const TYPE_SPEED_MS = 22;

let musicaIniciada = false;
let emFadeOut = false;
let musicaTocou = false;
let cartaDigitada = false;
let timerDigitacao = null;

const textoCompletoCarta = cartaTexto ? cartaTexto.innerHTML.replace(/^\s+/, "") : "";

function fadeVolume(from, to, duration, onDone) {
  const steps = Math.max(1, Math.floor(duration / TICK_MS));
  const delta = (to - from) / steps;
  let i = 0;

  musica.volume = Math.max(0, Math.min(1, from));

  const id = setInterval(() => {
    i += 1;
    musica.volume = Math.max(0, Math.min(1, musica.volume + delta));

    if (i >= steps) {
      clearInterval(id);
      musica.volume = Math.max(0, Math.min(1, to));
      if (onDone) onDone();
    }
  }, TICK_MS);
}

async function iniciarMusicaSuave() {
  if (musicaIniciada) return;

  try {
    musica.volume = 0;
    await musica.play();
    musicaIniciada = true;
    fadeVolume(0, 1, FADE_MS);
  } catch {
    // Autoplay bloqueado: vai tentar no primeiro gesto do usuario
  }
}

musica.addEventListener("timeupdate", async () => {
  if (!musicaIniciada || emFadeOut || !Number.isFinite(musica.duration)) return;

  const restante = musica.duration - musica.currentTime;
  if (restante <= FADE_MS / 1000) {
    emFadeOut = true;

    fadeVolume(musica.volume, 0, FADE_MS, async () => {
      musica.pause();
      musica.currentTime = 0;
      musica.volume = 0;

      try {
        await musica.play();
        fadeVolume(0, 1, FADE_MS, () => {
          emFadeOut = false;
        });
      } catch {
        emFadeOut = false;
      }
    });
  }
});

function digitarCarta() {
  if (!cartaTexto || cartaDigitada || !textoCompletoCarta) return;

  cartaTexto.innerHTML = "";
  let i = 0;

  timerDigitacao = setInterval(() => {
    if (i >= textoCompletoCarta.length) {
      clearInterval(timerDigitacao);
      timerDigitacao = null;
      cartaDigitada = true;
      return;
    }

    if (textoCompletoCarta[i] === "<") {
      const fimTag = textoCompletoCarta.indexOf(">", i);
      if (fimTag !== -1) {
        cartaTexto.innerHTML += textoCompletoCarta.slice(i, fimTag + 1);
        i = fimTag + 1;
        return;
      }
    }

    cartaTexto.innerHTML += textoCompletoCarta[i];
    i += 1;

    if (i % 16 === 0) {
      cartaTexto.parentElement.scrollTop = cartaTexto.parentElement.scrollHeight;
    }
  }, TYPE_SPEED_MS);
}

// Tenta iniciar ao carregar
window.addEventListener("load", iniciarMusicaSuave);

// Fallback: primeiro gesto do usuario
["click", "touchstart", "keydown"].forEach((evento) => {
  window.addEventListener(evento, iniciarMusicaSuave, { once: true });
});

function abrirCarta(elemento) {
  elemento.classList.toggle("aberto");

  if (elemento.classList.contains("aberto")) {
    digitarCarta();
  }

  if (!musicaTocou) {
    musicaTocou = true;

    for (let i = 0; i < 50; i += 1) {
      criarFogo();
    }
  }
}

function criarCoracao() {
  const coracao = document.createElement("div");
  coracao.classList.add("coracao");
  coracao.innerHTML = "❤️";
  coracao.style.left = `${Math.random() * 100}vw`;
  coracao.style.animationDuration = `${Math.random() * 3 + 2}s`;
  coracao.style.fontSize = `${Math.random() * 20 + 10}px`;
  document.body.appendChild(coracao);

  setTimeout(() => {
    coracao.remove();
  }, 5000);
}

setInterval(criarCoracao, 300);

function criarFogo() {
  const fogo = document.createElement("div");
  fogo.innerHTML = "✨";
  fogo.style.position = "fixed";
  fogo.style.left = `${Math.random() * 100}vw`;
  fogo.style.top = `${Math.random() * 100}vh`;
  fogo.style.fontSize = `${Math.random() * 20 + 15}px`;
  fogo.style.animation = "explodir 1s ease-out forwards";
  fogo.style.pointerEvents = "none";
  document.body.appendChild(fogo);

  setTimeout(() => {
    fogo.remove();
  }, 1000);
}
