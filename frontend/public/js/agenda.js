async function carregarAgenda() {
    try {
      const resposta = await fetch(`${CONFIG.API_BASE_URL}/horarios`);
      const agenda = await resposta.json();
      const tbody = document.getElementById('agenda-tbody');
  
      if (!tbody) return;
  
      tbody.innerHTML = '';
      console.log('Horários recebidos:', agenda);
  
      agenda.forEach((item) => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
          <td>${item.turma}</td>
          <td>${item.dias}</td>
          <td>${item.horario}</td>
          <td>${item.faixa_etaria}</td>
        `;
        tbody.appendChild(linha);
      });
    } catch (erro) {
      console.error('Erro ao carregar a agenda:', erro);
    }
  }
  
  // Chamada direta ao carregar a página
  carregarAgenda();
  