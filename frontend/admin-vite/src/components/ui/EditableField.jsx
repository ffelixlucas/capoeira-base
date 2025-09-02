import React, { useState, useEffect } from "react";
import { FiEdit2, FiCheck } from "react-icons/fi";

/**
 * Campo editável:
 * - Leitura com caneta preta
 * - Clique troca para input
 * - Botão de check salva
 * - type="tel": mostra formatado (BR) e envia só dígitos
 */
export default function EditableField({
  label,
  name,
  value,
  onSave,           // async ({ [name]: newValue }) => void
  type = "text",
  inputMode,
  placeholder,
  className = "",
  disabled = false,
}) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(value || "");
  const [saving, setSaving] = useState(false);

  const onlyDigits = (str = "") => (str || "").replace(/\D/g, "");
  const formatPhoneBR = (v = "") => {
    const d = onlyDigits(v).slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 6) return `(${d.slice(0,2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  };

  // sincroniza quando value muda
  useEffect(() => {
    setLocal(type === "tel" ? formatPhoneBR(value || "") : (value || ""));
  }, [value, type]);

  const handleToggle = () => {
    if (disabled) return;
    setLocal(type === "tel" ? formatPhoneBR(value || "") : (value || ""));
    setEditing((e) => !e);
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setLocal(type === "tel" ? formatPhoneBR(val) : val);
  };

  const handleSave = async () => {
    if (disabled) return;
    setSaving(true);
    try {
      let newValue = (local || "").trim();
      if (type === "tel") newValue = onlyDigits(newValue);
      await onSave({ [name]: newValue });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`py-3 border-b border-gray-100 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <span className="block text-xs text-gray-500">{label}</span>

          {editing ? (
            <input
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-cor-primaria"
              name={name}
              value={local}
              onChange={handleChange}
              type={type === "tel" ? "text" : type}
              inputMode={inputMode || (type === "tel" ? "tel" : undefined)}
              placeholder={placeholder}
              autoFocus
            />
          ) : (
            <span className="text-black text-sm break-all">
              {type === "tel"
                ? (formatPhoneBR(value || "") || <span className="text-gray-400">—</span>)
                : (value || <span className="text-gray-400">—</span>)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={editing ? handleSave : handleToggle}
          disabled={saving || disabled}
          className={`ml-3 shrink-0 p-2 rounded-full border ${
            saving || disabled
              ? "border-gray-200 bg-gray-100 text-gray-300"
              : "border-gray-300 bg-gray-100 hover:bg-gray-200"
          }`}
          aria-label={editing ? `Salvar ${label}` : `Editar ${label}`}
          title={editing ? "Salvar" : "Editar"}
        >
          {editing ? (
            <FiCheck className="w-4 h-4 text-black" />
          ) : (
            <FiEdit2 className="w-4 h-4 text-black" />
          )}
        </button>
      </div>
    </div>
  );
}
