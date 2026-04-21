const musica = document.getElementById("musica");
const cartaTexto = document.querySelector(".carta p");
const botaoSurpresa = document.getElementById("btnSurpresa");
const mensagemSurpresa = document.getElementById("mensagemSurpresa");
const inputAdicionarFotos = document.getElementById("adicionarFotos");
const galeriaFotos = document.querySelector(".fotos");
const anosJuntos = document.getElementById("anosJuntos");
const mesesJuntos = document.getElementById("mesesJuntos");
const diasJuntos = document.getElementById("diasJuntos");
const horasJuntas = document.getElementById("horasJuntas");
const minutosJuntos = document.getElementById("minutosJuntos");
const segundosJuntos = document.getElementById("segundosJuntos");
const dataInicioRelacionamento = document.getElementById("dataInicioRelacionamento");

const FADE_MS = 4000;
const TICK_MS = 100;
const TYPE_SPEED_MS = 22;
const STORAGE_FOTOS_KEY = "fotosPersonalizadasSitePresente";
const DATA_INICIO_RELACIONAMENTO = "2025-07-31T00:00:00";

let musicaIniciada = false;
let emFadeOut = false;
let musicaTocou = false;
let cartaDigitada = false;
let timerDigitacao = null;
let cartaEstaDigitando = false;

const textoCompletoCarta = cartaTexto ? cartaTexto.innerHTML.replace(/^\s+/, "") : "";

function atualizarContadorRelacionamento() {
  if (
    !anosJuntos ||
    !mesesJuntos ||
    !diasJuntos ||
    !horasJuntas ||
    !minutosJuntos ||
    !segundosJuntos
  ) {
    return;
  }

  const inicio = new Date();
  const agora = new Date();

  if (Number.isNaN(inicio.getTime()) || agora < inicio) {
    return;
  }

  let anos = agora.getFullYear() - inicio.getFullYear();
  let meses = agora.getMonth() - inicio.getMonth();

  if (agora.getDate() < inicio.getDate()) {
    meses -= 1;
  }

  if (meses < 0) {
    anos -= 1;
    meses += 12;
  }

  const baseMeses = new Date(inicio);
  baseMeses.setFullYear(baseMeses.getFullYear() + anos);
  baseMeses.setMonth(baseMeses.getMonth() + meses);

  let diferencaMs = agora - baseMeses;

  const dias = Math.floor(diferencaMs / (1000 * 60 * 60 * 24));
  diferencaMs -= dias * 24 * 60 * 60 * 1000;

  const horas = Math.floor(diferencaMs / (1000 * 60 * 60));
  diferencaMs -= horas * 60 * 60 * 1000;

  const minutos = Math.floor(diferencaMs / (1000 * 60));
  diferencaMs -= minutos * 60 * 1000;

  const segundos = Math.floor(diferencaMs / 1000);

  anosJuntos.textContent = String(anos);
  mesesJuntos.textContent = String(meses);
  diasJuntos.textContent = String(dias);
  horasJuntas.textContent = String(horas);
  minutosJuntos.textContent = String(minutos);
  segundosJuntos.textContent = String(segundos);

  if (dataInicioRelacionamento) {
    dataInicioRelacionamento.textContent =
      "Desde " + inicio.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  }
}

function obterFotosSalvas() {
  try {
    const fotos = JSON.parse(localStorage.getItem(STORAGE_FOTOS_KEY) || "[]");
    return Array.isArray(fotos) ? fotos : [];
  } catch {
    return [];
  }
}

function salvarFotos(fotos) {
  localStorage.setItem(STORAGE_FOTOS_KEY, JSON.stringify(fotos));
}

function criarImagemGaleria(src, alt) {
  if (!galeriaFotos) return;

  const imagem = document.createElement("img");
  imagem.src = src;
  imagem.alt = alt;
  imagem.loading = "lazy";
  galeriaFotos.appendChild(imagem);
}

function carregarFotosSalvas() {
  const fotos = obterFotosSalvas();
  fotos.forEach((foto, index) => {
    criarImagemGaleria(foto.src, foto.alt || `Nova foto ${index + 1}`);
  });
}

function lerArquivoComoDataURL(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(leitor.result);
    leitor.onerror = () => reject(new Error("Nao foi possivel ler a imagem."));
    leitor.readAsDataURL(arquivo);
  });
}

async function adicionarNovasFotos(evento) {
  const arquivos = Array.from(evento.target.files || []).filter((arquivo) =>
    arquivo.type.startsWith("image/")
  );

  if (!arquivos.length) return;

  const fotosSalvas = obterFotosSalvas();

  for (const arquivo of arquivos) {
    try {
      const src = await lerArquivoComoDataURL(arquivo);
      const alt = arquivo.name
        ? `Foto adicionada: ${arquivo.name}`
        : "Foto adicionada na galeria";

      fotosSalvas.push({ src, alt });
      criarImagemGaleria(src, alt);
    } catch {
      // Ignora somente o arquivo que falhou e continua com os demais.
    }
  }

  salvarFotos(fotosSalvas);
  evento.target.value = "";
}

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
  if (!cartaTexto || cartaDigitada || cartaEstaDigitando || !textoCompletoCarta) return;

  cartaEstaDigitando = true;
  cartaTexto.innerHTML = "";
  let i = 0;

  timerDigitacao = setInterval(() => {
    if (i >= textoCompletoCarta.length) {
      clearInterval(timerDigitacao);
      timerDigitacao = null;
      cartaDigitada = true;
      cartaEstaDigitando = false;
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

function finalizarCartaSemAnimacao() {
  if (!cartaTexto || cartaDigitada) return;

  if (timerDigitacao) {
    clearInterval(timerDigitacao);
    timerDigitacao = null;
  }

  cartaTexto.innerHTML = textoCompletoCarta;
  cartaDigitada = true;
  cartaEstaDigitando = false;
}

// Tenta iniciar ao carregar
window.addEventListener("load", iniciarMusicaSuave);
window.addEventListener("load", carregarFotosSalvas);
window.addEventListener("load", atualizarContadorRelacionamento);

setInterval(atualizarContadorRelacionamento, 1000);

// Fallback: primeiro gesto do usuario
["click", "touchstart", "keydown"].forEach((evento) => {
  window.addEventListener(evento, iniciarMusicaSuave, { once: true });
});

function abrirCarta(elemento) {
  elemento.classList.toggle("aberto");

  if (elemento.classList.contains("aberto")) {
    digitarCarta();
  } else if (!cartaDigitada) {
    finalizarCartaSemAnimacao();
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

function ativarSurpresaFinal() {
  if (!mensagemSurpresa) return;

  const jaAtiva = mensagemSurpresa.classList.contains("ativa");
  mensagemSurpresa.classList.toggle("ativa");

  if (!jaAtiva) {
    mensagemSurpresa.scrollIntoView({ behavior: "smooth", block: "center" });
    for (let i = 0; i < 30; i += 1) {
      criarFogo();
    }
  }
}

if (botaoSurpresa) {
  botaoSurpresa.addEventListener("click", ativarSurpresaFinal);
}

if (inputAdicionarFotos) {
  inputAdicionarFotos.addEventListener("change", adicionarNovasFotos);
}
