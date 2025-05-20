import React, { useState, useEffect } from 'react';
import { uploadImagem, listarImagens } from '../services/galeriaService';
import { FaArrowUp, FaArrowDown, FaTrash } from '../icons';

function Galeria() {
  const [imagem, setImagem] = useState(null);
  const [imagens, setImagens] = useState([]);

  const carregarImagens = async () => {
    const data = await listarImagens();
    const ordenadas = data.sort((a, b) => a.ordem - b.ordem);
    setImagens(ordenadas);
  };

  useEffect(() => {
    carregarImagens();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!imagem) return;

    const formData = new FormData();
    formData.append('imagem', imagem);

    try {
      await uploadImagem(formData);
      setImagem(null);
      carregarImagens(); // recarrega a lista
    } catch (err) {
      console.error('Erro ao enviar imagem:', err);
    }
  };

  const moverParaCima = (index) => {
    if (index === 0) return;
    const novaOrdem = [...imagens];
    [novaOrdem[index - 1], novaOrdem[index]] = [novaOrdem[index], novaOrdem[index - 1]];
    setImagens(novaOrdem);
  };

  const moverParaBaixo = (index) => {
    if (index === imagens.length - 1) return;
    const novaOrdem = [...imagens];
    [novaOrdem[index], novaOrdem[index + 1]] = [novaOrdem[index + 1], novaOrdem[index]];
    setImagens(novaOrdem);
  };

  return (
    <div>
      <h2>Galeria</h2>

      <form onSubmit={handleUpload}>
        <input
          type="file"
          onChange={(e) => setImagem(e.target.files[0])}
          accept="image/*"
        />
        <button type="submit">Enviar</button>
      </form>

      <div style={{ marginTop: 20 }}>
        {imagens.map((img, index) => (
          <div key={img.id} style={{ marginBottom: 16 }}>
            <img src={img.imagem_url} alt={img.titulo || 'imagem'} width="200" />

            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button onClick={() => moverParaCima(index)}><FaArrowUp /></button>
              <button onClick={() => moverParaBaixo(index)}><FaArrowDown /></button>
              <button onClick={() => console.log('remover ainda não implementado')}><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Galeria;
