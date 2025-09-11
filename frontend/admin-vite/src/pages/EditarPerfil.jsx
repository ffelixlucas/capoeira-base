import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { atualizarPerfil, atualizarSenha } from "../services/equipeService";
import { toast } from "react-toastify";
import EditableField from "../components/ui/EditableField";
import InputBase from "../components/ui/InputBase";
import { logger } from "../utils/logger";

function EditarPerfil() {
  const { usuario } = useAuth();

  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    whatsapp: "",
    email: "",
  });

  const [mesmoNumero, setMesmoNumero] = useState(false);

  const [senhaForm, setSenhaForm] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  });

  const [loadingSenha, setLoadingSenha] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    const tel = usuario.telefone?.toString() || "";
    const whats = usuario.whatsapp?.toString() || "";

    logger.log("📌 Dados do usuário:", usuario);
    logger.log("📌 Telefone setado:", tel);
    logger.log("📌 WhatsApp setado:", whats);
    
    setForm({
      nome: usuario.nome || "",
      telefone: tel,
      whatsapp: whats,
      email: usuario.email || "",
    });
    setMesmoNumero(!!tel && !!whats && tel === whats);
  }, [usuario]);

  const salvarCampo = async (payload) => {
    try {
      if (payload.email) {
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email);
        if (!ok) {
          toast.error("E-mail inválido.");
          throw new Error("email inválido");
        }
      }
      const resp = await atualizarPerfil(payload);
      toast.success(resp.message || "Atualizado com sucesso!");
      setForm((prev) => ({ ...prev, ...payload }));
    } catch (err) {
      const msg = err?.response?.data?.message || "Erro ao atualizar.";
      toast.error(msg);
      throw err;
    }
  };

  const handleSubmitSenha = async (e) => {
    e.preventDefault();
    if (!senhaForm.senhaAtual || !senhaForm.novaSenha) {
      toast.error("Preencha senha atual e nova senha.");
      return;
    }
    if (senhaForm.novaSenha !== senhaForm.confirmarSenha) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setLoadingSenha(true);
    try {
      const resp = await atualizarSenha({
        senhaAtual: senhaForm.senhaAtual,
        novaSenha: senhaForm.novaSenha,
      });
      toast.success(resp.message || "Senha alterada com sucesso!");
      setSenhaForm({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
    } catch (err) {
      const msg = err?.response?.data?.message || "Erro ao alterar senha.";
      toast.error(msg);
    } finally {
      setLoadingSenha(false);
    }
  };

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cor-fundo p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-5 bg-gray-200 rounded w-1/3" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-5 bg-gray-200 rounded w-1/4 mt-4" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cor-fundo p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-center mb-6 text-black">
          Editar Perfil
        </h2>

        {/* 🔹 Dados Pessoais */}
        <div className="mb-8">
          <h3 className="font-semibold text-black mb-2">Dados Pessoais</h3>

          <EditableField
            label="Nome"
            name="nome"
            value={form.nome}
            onSave={salvarCampo}
            placeholder="Seu nome"
          />

          <EditableField
            label="Telefone"
            name="telefone"
            value={form.telefone}
            onSave={salvarCampo}
            placeholder="(00) 00000-0000"
            type="tel"
          />

          <EditableField
            label="WhatsApp"
            name="whatsapp"
            value={mesmoNumero ? form.telefone : form.whatsapp}
            onSave={async (payload) => {
              const valor = mesmoNumero
                ? (form.telefone || "").trim()
                : (payload.whatsapp || "").trim();
              await salvarCampo({ whatsapp: valor });
            }}
            type="tel"
            placeholder="(00) 00000-0000"
          />

          <div className="mt-2 mb-2">
            <label className="flex items-center gap-2 text-sm text-black">
              <input
                type="checkbox"
                checked={mesmoNumero}
                onChange={(e) => setMesmoNumero(e.target.checked)}
              />
              WhatsApp é o mesmo número do telefone
            </label>
          </div>

          <EditableField
            label="E-mail"
            name="email"
            value={form.email}
            onSave={salvarCampo}
            type="email"
            inputMode="email"
            placeholder="nome@exemplo.com"
          />
        </div>

        {/* 🔐 Alterar Senha */}
        <form onSubmit={handleSubmitSenha} className="space-y-4">
          <h3 className="font-semibold text-black">Alterar Senha</h3>

          <InputBase
            type="password"
            name="senhaAtual"
            value={senhaForm.senhaAtual}
            onChange={(e) =>
              setSenhaForm((p) => ({ ...p, senhaAtual: e.target.value }))
            }
            placeholder="Senha atual"
            className="text-black"
            autoComplete="current-password"
          />
          <InputBase
            type="password"
            name="novaSenha"
            value={senhaForm.novaSenha}
            onChange={(e) =>
              setSenhaForm((p) => ({ ...p, novaSenha: e.target.value }))
            }
            placeholder="Nova senha"
            className="text-black"
            autoComplete="new-password"
          />
          <InputBase
            type="password"
            name="confirmarSenha"
            value={senhaForm.confirmarSenha}
            onChange={(e) =>
              setSenhaForm((p) => ({ ...p, confirmarSenha: e.target.value }))
            }
            placeholder="Confirmar nova senha"
            className="text-black"
            autoComplete="new-password"
          />

          <button
            type="submit"
            disabled={loadingSenha}
            className={`w-full py-3 rounded-lg font-bold text-white ${
              loadingSenha
                ? "bg-cor-primaria/70"
                : "bg-cor-primaria hover:bg-cor-destaque"
            }`}
          >
            {loadingSenha ? "Salvando..." : "Alterar senha"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditarPerfil;
