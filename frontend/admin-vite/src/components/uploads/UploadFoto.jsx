import { storage } from "../../firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import { Camera } from "lucide-react";
import { useState } from "react";

export default function UploadFoto({
  label = "Foto",
  tipo = "alunos", // 👈 tipo define a subpasta (alunos, professores, equipe)
  defaultUrl = "",
  onUpload,
}) {
  const [fotoPreview, setFotoPreview] = useState(defaultUrl);
  const [carregando, setCarregando] = useState(false);

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setCarregando(true);

    try {
      // 🔹 Caminho do arquivo no bucket
      const fileName = `fotos-perfil/${tipo}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, fileName);

      // 🔹 Envia a imagem
      await uploadBytes(storageRef, file);

      // 🔹 Pega URL pública
      const url = await getDownloadURL(storageRef);

      setFotoPreview(URL.createObjectURL(file));
      if (onUpload) onUpload(url);

      toast.success("Foto enviada com sucesso!");
    } catch (err) {
      console.error("Erro ao enviar foto:", err);
      toast.error("Erro ao enviar foto.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 mt-3">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      <div className="flex items-center gap-3">
        <label className="cursor-pointer flex flex-col items-center justify-center border border-gray-300 rounded-lg p-3 hover:bg-gray-50 w-32 h-32 bg-white shadow-sm">
          {fotoPreview ? (
            <img
              src={fotoPreview}
              alt="Preview"
              className="object-cover w-28 h-28 rounded-md"
            />
          ) : (
            <>
              <Camera size={24} className="text-gray-500 mb-1" />
              <span className="text-xs text-gray-500">
                {carregando ? "Enviando..." : "Selecionar foto"}
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={carregando}
          />
        </label>

        {fotoPreview && (
          <button
            type="button"
            className="text-sm text-red-500 hover:underline"
            onClick={() => {
              setFotoPreview("");
              if (onUpload) onUpload("");
            }}
          >
            Remover
          </button>
        )}
      </div>
    </div>
  );
}
