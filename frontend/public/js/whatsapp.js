import { logger } from "../../admin-vite/src/utils/logger";

let numeroAula = "554100000000"; // Número padrão para aulas
let numeroGenerico = "554200000000"; // Número padrão para outros assuntos

let numeroInfantil = numeroAula;
let numeroJuvenil = numeroAula;
let numeroAdulto = numeroAula;

async function carregarNumerosWhatsapp() {
  try {
    const [resAula, resOutros, resInfantil, resJuvenil, resAdulto] = await Promise.all([
        fetch(`${CONFIG.API_BASE_URL}/configuracoes/whatsapp_aulas`),
        fetch(`${CONFIG.API_BASE_URL}/configuracoes/whatsapp_outros`),
        fetch(`${CONFIG.API_BASE_URL}/configuracoes/whatsapp_infantil`),
        fetch(`${CONFIG.API_BASE_URL}/configuracoes/whatsapp_juvenil`),
        fetch(`${CONFIG.API_BASE_URL}/configuracoes/whatsapp_adulto`),
      ]);
      

    const dadosAula = await resAula.json();
    const dadosOutros = await resOutros.json();
    const dadosInfantil = await resInfantil.json();
    const dadosJuvenil = await resJuvenil.json();
    const dadosAdulto = await resAdulto.json();

    if (dadosAula?.valor) numeroAula = dadosAula.valor.replace(/\D/g, '');
    if (dadosOutros?.valor) numeroGenerico = dadosOutros.valor.replace(/\D/g, '');
    if (dadosInfantil?.valor) numeroInfantil = dadosInfantil.valor.replace(/\D/g, '');
    if (dadosJuvenil?.valor) numeroJuvenil = dadosJuvenil.valor.replace(/\D/g, '');
    if (dadosAdulto?.valor) numeroAdulto = dadosAdulto.valor.replace(/\D/g, '');
  } catch (err) {
    logger.warn("Erro ao buscar números de WhatsApp. Usando fallback.");
  }
}


carregarNumerosWhatsapp();

// ===== MODAL DE CONTATO VIA WHATSAPP =====

document.addEventListener("DOMContentLoaded", () => {
  const botao = document.getElementById("botao-whatsapp");
  const modal = document.getElementById("modal-contato");

  if (botao && modal) {
    botao.addEventListener("click", () => {
      modal.style.display = "flex";
      setTimeout(() => modal.classList.add("active"), 10);
      document.body.style.overflow = "hidden";
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") {
      fecharModal();
    }
  });
});

function fecharModal() {
  const modal = document.getElementById("modal-contato");
  if (modal) {
    modal.classList.remove("active");
    setTimeout(() => {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }, 300);
  }
}

function agendarAula() {
    const idadeStr = prompt("Qual a idade da pessoa que deseja fazer aula experimental?");
    const idade = parseInt(idadeStr, 10);
  
    if (isNaN(idade)) {
      alert("Por favor, informe uma idade válida.");
      return;
    }
  
    let turma = "", dias = "", horario = "", numero = numeroAula;
  
    if (idade >= 5 && idade <= 10) {
      turma = "Infantil";
      dias = "Segunda e Quarta";
      horario = "19:00–20:00";
      numero = numeroInfantil;
    } else if (idade >= 11 && idade <= 17) {
      turma = "Juvenil";
      dias = "Terça e Quinta";
      horario = "19:00–20:00";
      numero = numeroJuvenil;
    } else if (idade >= 18) {
      turma = "Adulto";
      dias = "Terça e Quinta";
      horario = "20:00–21:30";
      numero = numeroAdulto;
    } else {
      alert("Atendemos a partir de 5 anos.");
      return;
    }
  
    const mensagem = `Olá! Gostaria de agendar uma aula experimental na turma ${turma} (${dias}, ${horario}).`;
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
  
    fecharModal();
  }
  
  

function abrirWhatsAppGenerico() {
  const mensagem = "Olá! Gostaria de falar sobre:";
  const numero = numeroGenerico;
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank");

  fecharModal();
}

document.addEventListener("click", (e) => {
  const modal = document.getElementById("modal-contato");
  const content = modal?.querySelector(".modal-content");
  if (
    modal?.style.display === "flex" &&
    !content.contains(e.target) &&
    !e.target.closest("#botao-whatsapp")
  ) {
    fecharModal();
  }
});