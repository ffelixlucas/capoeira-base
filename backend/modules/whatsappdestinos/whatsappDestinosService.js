const repo = require("./whatsappDestinosRepository");

async function getDestinosFormatados() {
  const destinos = await repo.listarDestinos();

  const resultado = {};
  destinos.forEach(d => {
    resultado[d.tipo] = {
      nome: d.nome || null,
      telefone: d.telefone || null
    };
  });

  return resultado;
}

module.exports = { getDestinosFormatados };
