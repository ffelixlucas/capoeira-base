// src/components/public/matricula/StepAutorizacoes.jsx
export default function StepAutorizacoes({ form, handleChange, setMostrarLGPD }) {
    return (
      <>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="autorizacao_imagem"
            checked={form.autorizacao_imagem}
            onChange={handleChange}
          />
          <span>Autorizo o uso de imagem</span>
          <div className="relative group">
            <span className="w-4 h-4 flex items-center justify-center rounded-full bg-blue-300 text-xs font-bold text-white cursor-pointer">
              i
            </span>
            <div className="absolute left-6 top-1 z-10 hidden group-hover:block bg-white border border-gray-300 rounded-lg shadow-lg p-2 w-64 text-xs text-gray-700">
              As imagens e vídeos podem ser utilizados em publicações institucionais,
              materiais de divulgação e redes sociais.
            </div>
          </div>
        </div>
  
        <div className="flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="aceite_lgpd"
            checked={form.aceite_lgpd}
            onChange={handleChange}
            required
          />
          <span>
            Li e aceito a{" "}
            <button
              type="button"
              onClick={() => setMostrarLGPD(true)}
              className="text-blue-600 underline hover:text-blue-800"
            >
              Política de Privacidade (LGPD)
            </button>
          </span>
        </div>
      </>
    );
  }
  