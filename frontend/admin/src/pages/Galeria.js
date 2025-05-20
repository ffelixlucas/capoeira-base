import React, { useState, useEffect } from 'react';
import { uploadImagem, listarImagens } from '../services/galeriaService';

function Galeria() {
  const [imagem, setImagem] = useState(null);
  const [imagens, setImagens] = useState([]);

  const carregarImagens = async () => {
    const data = await listarImagens();
    setImagens(data);
  };

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

  useEffect(() => {
    carregarImagens();
  }, []);

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
        {imagens.map((img) => (
          <div key={img.id} style={{ marginBottom: 10 }}>
            <img src={img.imagem_url} alt={img.titulo || 'imagem'} width="200" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Galeria;
