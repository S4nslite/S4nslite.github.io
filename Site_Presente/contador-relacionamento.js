const DATA_INICIO_RELACIONAMENTO = "31/07/2025";

function criarDataRelacionamento(dataTexto) {
  const partes = dataTexto.split("/");

  if (partes.length !== 3) {
    return null;
  }

  const dia = Number(partes[0]);
  const mes = Number(partes[1]);
  const ano = Number(partes[2]);

  if (!dia || !mes || !ano) {
    return null;
  }

  return new Date(ano, mes - 1, dia, 0, 0, 0, 0);
}

function atualizarContadorRelacionamento() {
  const anos = document.getElementById("anosJuntos");
  const meses = document.getElementById("mesesJuntos");
  const dias = document.getElementById("diasJuntos");
  const horas = document.getElementById("horasJuntas");
  const minutos = document.getElementById("minutosJuntos");
  const segundos = document.getElementById("segundosJuntos");
  const dataInicio = document.getElementById("dataInicioRelacionamento");

  if (!anos || !meses || !dias || !horas || !minutos || !segundos) {
    return;
  }

  const inicio = criarDataRelacionamento(DATA_INICIO_RELACIONAMENTO);
  const agora = new Date();

  if (!inicio || Number.isNaN(inicio.getTime())) {
    return;
  }

  if (dataInicio) {
    dataInicio.textContent = "Desde " + DATA_INICIO_RELACIONAMENTO;
  }

  if (agora < inicio) {
    anos.textContent = "0";
    meses.textContent = "0";
    dias.textContent = "0";
    horas.textContent = "0";
    minutos.textContent = "0";
    segundos.textContent = "0";
    return;
  }

  let anosValor = agora.getFullYear() - inicio.getFullYear();
  let mesesValor = agora.getMonth() - inicio.getMonth();

  if (agora.getDate() < inicio.getDate()) {
    mesesValor -= 1;
  }

  if (mesesValor < 0) {
    anosValor -= 1;
    mesesValor += 12;
  }

  const referencia = new Date(inicio.getTime());
  referencia.setFullYear(referencia.getFullYear() + anosValor);
  referencia.setMonth(referencia.getMonth() + mesesValor);

  let restante = agora.getTime() - referencia.getTime();

  const diasValor = Math.floor(restante / (1000 * 60 * 60 * 24));
  restante -= diasValor * 1000 * 60 * 60 * 24;

  const horasValor = Math.floor(restante / (1000 * 60 * 60));
  restante -= horasValor * 1000 * 60 * 60;

  const minutosValor = Math.floor(restante / (1000 * 60));
  restante -= minutosValor * 1000 * 60;

  const segundosValor = Math.floor(restante / 1000);

  anos.textContent = String(anosValor);
  meses.textContent = String(mesesValor);
  dias.textContent = String(diasValor);
  horas.textContent = String(horasValor);
  minutos.textContent = String(minutosValor);
  segundos.textContent = String(segundosValor);
}

atualizarContadorRelacionamento();
window.addEventListener("load", atualizarContadorRelacionamento);
setInterval(atualizarContadorRelacionamento, 1000);
