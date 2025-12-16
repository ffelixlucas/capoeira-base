// src/components/ui/FotoPerfil.jsx
import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { Camera, RefreshCcw, Trash2 } from "lucide-react";
import Cropper from "react-easy-crop";
import { motion, AnimatePresence } from "framer-motion";
import { logger } from "../../utils/logger"; // ✅ usa logger oficial

export default function FotoPerfil({ value, onChange }) {
  const [preview, setPreview] = useState(value || "");
  const [file, setFile] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const fileInputRef = useRef(null);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  // 🟢 Quando o usuário escolhe um arquivo
  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    setFile(f);
    setPreview(URL.createObjectURL(f));

    logger.info("[FotoPerfil] handleFile chamado", {
      nome: f.name,
      tamanho_kb: (f.size / 1024).toFixed(1),
      tipo: f.type,
    });

    // 🔹 limpa o input pra permitir novo upload do mesmo arquivo depois
    e.target.value = null;

    // 🟡 Notifica o pai que há imagem pendente
    if (onChange) {
      logger.warn(
        "[FotoPerfil] Notificando pai → imagem pendente (ainda não confirmada)"
      );
      onChange({
        target: { name: "imagemBase64", value: "" },
      });
    }
  };

  const handleReset = () => {
    logger.info("[FotoPerfil] Trocar imagem acionado");
    setFile(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setPreview("");
    onChange && onChange("");
  };

  const handleRemove = () => {
    logger.info("[FotoPerfil] Remover imagem acionado");
    setPreview("");
    setFile(null);
    onChange && onChange("");
    toast.info("Foto removida");
  };

  // 🔧 Gera o base64 do recorte visível
  async function getCroppedBase64() {
    if (!preview || !croppedAreaPixels) return null;
    const image = await createImage(preview);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = croppedAreaPixels.width * scaleX;
    canvas.height = croppedAreaPixels.height * scaleY;

    ctx.drawImage(
      image,
      croppedAreaPixels.x * scaleX,
      croppedAreaPixels.y * scaleY,
      croppedAreaPixels.width * scaleX,
      croppedAreaPixels.height * scaleY,
      0,
      0,
      croppedAreaPixels.width * scaleX,
      croppedAreaPixels.height * scaleY
    );

    // 🟢 Máscara circular
    ctx.globalCompositeOperation = "destination-in";
    ctx.beginPath();
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      Math.min(canvas.width, canvas.height) / 2,
      0,
      2 * Math.PI
    );
    ctx.fill();

    return canvas.toDataURL("image/jpeg", 0.95);
  }

  function createImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = url;
      image.onload = () => resolve(image);
      image.onerror = (err) => reject(err);
    });
  }

  const handleConfirm = async () => {
    if (!file) {
      toast.warn("Selecione uma imagem primeiro");
      logger.warn(
        "[FotoPerfil] Tentativa de confirmar sem arquivo selecionado"
      );
      return;
    }

    const base64 = await getCroppedBase64();
    if (!base64) {
      toast.error("Erro ao processar imagem");
      logger.error("[FotoPerfil] Erro ao gerar base64 do recorte");
      return;
    }

    onChange && onChange({ target: { name: "imagemBase64", value: base64 } });
    setPreview(base64);
    setFile(null);
    logger.info("[FotoPerfil] Foto confirmada e enviada ao formulário");

    toast.success("Foto adicionada ao formulário!");
  };

  return (
    <div className="flex flex-col items-center gap-4 my-6">
      {/* 🖼️ Área principal */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center bg-gray-100 rounded-full">
        <motion.div
          className="relative w-full h-full rounded-full overflow-hidden border-2 border-gray-300 shadow-md bg-gray-50"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 120 }}
        >
          <AnimatePresence mode="wait">
            {file && preview ? (
              <motion.div
                key="cropper"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full"
              >
                <Cropper
                  image={preview}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  zoomWithScroll
                  minZoom={0.5}
                  maxZoom={4}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </motion.div>
            ) : preview ? (
              <motion.img
                key="final-image"
                src={preview}
                alt="Foto final"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="object-cover w-full h-full"
              />
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100"
              >
                <Camera size={36} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 📸 Botão da câmera */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 translate-x-2 translate-y-2 z-[9999]
             bg-blue-600 text-white p-2 rounded-full shadow-lg
             hover:bg-blue-700 active:scale-95 transition-all"
        >
          <Camera size={16} />
        </button>

        <input
          ref={fileInputRef}
          id="foto-file"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {/* ⚙️ Controles */}
      <AnimatePresence>
        {(file || preview) && (
          <motion.div
            key="controls"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-3 mt-2"
          >
            {file ? (
              <>
                <input
                  type="range"
                  min="0.5"
                  max="4"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-32 accent-blue-600 cursor-pointer"
                />
                <div className="flex gap-2 flex-wrap justify-center">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={handleConfirm}
                    className="bg-green-600 text-white px-4 py-1 rounded-md text-sm hover:bg-green-700 transition"
                  >
                    Confirmar
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReset}
                    className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-300 transition"
                  >
                    <RefreshCcw size={14} /> Trocar
                  </motion.button>
                </div>
              </>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleRemove}
                className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1 rounded-md text-sm hover:bg-red-200 transition"
              >
                <Trash2 size={14} /> Remover
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 💬 Status */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xs text-gray-500 text-center"
      >
        {!preview
          ? "Adicione uma foto de perfil"
          : file
          ? "Ajuste o foco e confirme para adicionar"
          : "Foto adicionada ao formulário"}
      </motion.p>
    </div>
  );
}
