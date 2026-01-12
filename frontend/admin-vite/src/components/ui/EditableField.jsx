import React, { useState, useEffect } from "react";
import { FiEdit2, FiCheck } from "react-icons/fi";

export default function EditableField({
  label,
  name,
  value,
  onSave,
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
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10)
      return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };

  useEffect(() => {
    setLocal(type === "tel" ? formatPhoneBR(value || "") : value || "");
    setEditing(false);
  }, [value, type]);

  const handleEdit = () => {
    if (disabled) return;
    setLocal(type === "tel" ? formatPhoneBR(value || "") : value || "");
    setEditing(true);
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
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-cor-primaria"
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
                ? formatPhoneBR(value || "") || (
                    <span className="text-gray-400">—</span>
                  )
                : value || <span className="text-gray-400">—</span>}
            </span>
          )}
        </div>

        {!editing && (
          <button
            type="button"
            onClick={handleEdit}
            disabled={disabled}
            className="ml-3 p-2 rounded-full border border-gray-300 bg-gray-100 hover:bg-gray-200"
            aria-label={`Editar ${label}`}
            title="Editar"
          >
            <FiEdit2 className="w-4 h-4 text-black" />
          </button>
        )}
      </div>

      {/* 👇 Botão salvar em evidência */}
      {editing && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
          >
            <FiCheck className="w-3 h-3" />
            {saving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      )}
    </div>
  );
}
