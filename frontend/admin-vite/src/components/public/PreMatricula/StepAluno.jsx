// src/components/public/preMatricula/StepAluno.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { buscarOrganizacaoPorSlug } from "../../../services/shared/organizacaoService";
import InputBase from "../../ui/InputBase";
import FotoPerfil from "../../ui/FotoPerfil";
import { logger } from "../../../utils/logger";

export default function StepAluno({
  form,
  handleChange,
  fotoPendente,
  setFotoPendente,
}) {
  const { slug } = useParams();

  const [grupoOrg, setGrupoOrg] = useState("");
  const [categoria, setCategoria] = useState(null);
  const [graduacoes, setGraduacoes] = useState([]);
  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState([]);

  // 🔹 Buscar todas as categorias disponíveis (para opção de alterar manualmente)
  useEffect(() => {
    async function carregarCategorias() {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/categorias`
        );
        if (response.data?.data?.length) {
          setCategoriasDisponiveis(response.data.data);
        }
      } catch (err) {
        console.error("Erro ao carregar categorias:", err);
      }
    }
    carregarCategorias();
  }, []);

  // 🔹 Buscar grupo da organização (dinâmico via slug)
  useEffect(() => {
    async function carregarGrupo() {
      try {
        if (!slug) return;
        const org = await buscarOrganizacaoPorSlug(slug);
        if (org?.grupo) setGrupoOrg(org.grupo);
      } catch (err) {
        console.error("Erro ao buscar grupo:", err);
      }
    }
    carregarGrupo();
  }, [slug]);

 // 🔹 Detectar turma conforme idade (rota pública via slug)
useEffect(() => {
  async function detectarTurma() {
    if (!form.nascimento || !slug) return;

    try {
      const nascimento = new Date(form.nascimento);
      const hoje = new Date();
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      const mes = hoje.getMonth() - nascimento.getMonth();
      if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate()))
        idade--;

      logger.debug("[StepAluno] Idade calculada →", idade);

      const url = `${import.meta.env.VITE_API_URL}/public/pre-matriculas/${slug}/turma-por-idade/${idade  }`;

      const response = await axios.get(url);

      if (response.data?.data) {
        const turma = response.data.data;

        setCategoria({
          categoria_id: turma.categoria_id,
          categoria_nome: turma.nome, // nome da TURMA
        });

        handleChange({
          target: {
            name: "categoria_id",
            value: turma.categoria_id,
          },
        });

        logger.debug("[StepAluno] Turma detectada →", turma.nome);
      } else {
        setCategoria(null);
        handleChange({ target: { name: "categoria_id", value: "" } });
      }
    } catch (err) {
      console.error("Erro ao detectar turma:", err);
    }
  }

  detectarTurma();
}, [form.nascimento, slug]);


  // 🔹 Buscar graduações quando o grupo selecionado for o da organização
  useEffect(() => {
    async function carregarGraduacoes() {
      if (!categoria?.categoria_id) return;
      if (form.ja_treinou !== "sim") return;

      // Sempre limpa antes de carregar novo grupo
      setGraduacoes([]);

      // Só busca graduações se o grupo atual for o da organização
      if (form.grupo_origem === grupoOrg && grupoOrg) {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/graduacoes/categoria/${
              categoria.categoria_id
            }`
          );

          if (response.data?.data?.length) {
            setGraduacoes(response.data.data);
          } else {
            setGraduacoes([]); // nenhum resultado → limpa
          }
        } catch (err) {
          console.error("Erro ao buscar graduações:", err);
          setGraduacoes([]);
        }
      }
    }

    carregarGraduacoes();
  }, [form.grupo_origem, grupoOrg, categoria, form.ja_treinou]);

  return (
    <div className="flex flex-col items-center text-gray-800">
      {/* 🔹 Foto de perfil */}
      <div className="mb-6">
        <FotoPerfil
          value={form.imagemBase64}
          onChange={(e) => {
            // 🟢 Se confirmou a foto (gera base64)
            if (e?.target?.value?.startsWith("data:image")) {
              setFotoPendente(false);
              handleChange(e);
              return;
            }

            // 🔴 Se fez upload, mas ainda não clicou em confirmar
            if (e?.target?.name === "imagemBase64" && !e?.target?.value) {
              setFotoPendente(true);
              return;
            }

            // ⚪ Se removeu a foto (ou limpou)
            if (!e || e?.target?.value === "") {
              setFotoPendente(false);
              handleChange({
                target: { name: "imagemBase64", value: "" },
              });
            }
          }}
        />
      </div>

      {/* 🔹 Campos do aluno */}
      <div className="w-full flex flex-col gap-3">
        <InputBase
          type="text"
          name="nome"
          placeholder="Nome completo *"
          value={form.nome}
          onChange={handleChange}
          required
        />

        {/* 🔹 Data de nascimento (corrigida, sem erro de fuso) */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Data de Nascimento
          </label>

          <div className="grid grid-cols-3 gap-2">
            {/* Dia */}
            <select
              name="dia"
              value={
                form.nascimento ? Number(form.nascimento.split("-")[2]) : ""
              }
              onChange={(e) => {
                const dia = e.target.value.padStart(2, "0");
                const [ano = "", mes = ""] = form.nascimento
                  ? form.nascimento.split("-")
                  : ["", ""];
                handleChange({
                  target: {
                    name: "nascimento",
                    value: `${ano}-${mes}-${dia}`,
                  },
                });
              }}
              className="border border-gray-300 rounded-lg px-2 py-2 bg-white text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="">Dia</option>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>

            {/* Mês */}
            <select
              name="mes"
              value={
                form.nascimento ? Number(form.nascimento.split("-")[1]) : ""
              }
              onChange={(e) => {
                const mes = e.target.value.padStart(2, "0");
                const [ano = "", , dia = ""] = form.nascimento
                  ? form.nascimento.split("-")
                  : ["", "", ""];
                handleChange({
                  target: {
                    name: "nascimento",
                    value: `${ano}-${mes}-${dia}`,
                  },
                });
              }}
              className="border border-gray-300 rounded-lg px-2 py-2 bg-white text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="">Mês</option>
              {[
                "Jan",
                "Fev",
                "Mar",
                "Abr",
                "Mai",
                "Jun",
                "Jul",
                "Ago",
                "Set",
                "Out",
                "Nov",
                "Dez",
              ].map((m, i) => (
                <option key={i + 1} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>

            {/* Ano */}
            <select
              name="ano"
              value={
                form.nascimento ? Number(form.nascimento.split("-")[0]) : ""
              }
              onChange={(e) => {
                const ano = e.target.value;
                const [, mes = "", dia = ""] = form.nascimento
                  ? form.nascimento.split("-")
                  : ["", "", ""];
                handleChange({
                  target: {
                    name: "nascimento",
                    value: `${ano}-${mes}-${dia}`,
                  },
                });
              }}
              className="border border-gray-300 rounded-lg px-2 py-2 bg-white text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="">Ano</option>
              {Array.from(
                { length: 100 },
                (_, i) => new Date().getFullYear() - i
              ).map((ano) => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>
          </div>

          <p className="text-xs text-gray-500 italic mt-1">
            Selecione o dia, mês e ano do nascimento
          </p>
        </div>

        <InputBase
          type="text"
          name="cpf"
          placeholder="CPF do Aluno *"
          value={form.cpf}
          onChange={handleChange}
          required
        />

        {/* Categoria detectada */}
        {categoria && (
          <div className="text-sm text-gray-700 mt-1">
            {!form.editandoCategoria ? (
              <>
                <span>Categoria detectada: </span>
                <span className="font-semibold">
                  {categoria.categoria_nome}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleChange({
                      target: { name: "editandoCategoria", value: true },
                    })
                  }
                  className="text-blue-600 ml-2 text-xs underline hover:text-blue-800"
                >
                  alterar
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <select
                  name="categoria_id"
                  value={form.categoria_id || ""}
                  onChange={(e) => {
                    logger.debug(
                      "[StepAluno] Categoria alterada manualmente →",
                      e.target.value
                    );
                    handleChange(e);
                    handleChange({
                      target: { name: "editandoCategoria", value: true },
                    });
                    setCategoria({ categoria_id: e.target.value }); // garante atualização visual
                  }}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-800 bg-white"
                >
                  <option value="">Selecione uma categoria</option>
                  {categoriasDisponiveis.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() =>
                    handleChange({
                      target: { name: "editandoCategoria", value: false },
                    })
                  }
                  className="text-gray-500 text-xs underline hover:text-gray-700"
                >
                  cancelar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Já treinou */}
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Já treinou capoeira?
          </p>
          <div className="flex gap-6 justify-start text-gray-700">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="ja_treinou"
                value="sim"
                checked={form.ja_treinou === "sim"}
                onChange={handleChange}
              />
              Sim
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="ja_treinou"
                value="nao"
                checked={form.ja_treinou === "nao"}
                onChange={handleChange}
              />
              Não
            </label>
          </div>
        </div>

        {/* Grupo e graduação */}
        {form.ja_treinou === "sim" && (
          <div className="flex flex-col gap-2 mt-4">
            <label className="text-sm font-medium text-gray-700">
              Grupo de capoeira
            </label>
            <select
              name="grupo_origem"
              value={form.grupo_origem}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 bg-white text-sm"
              required
            >
              <option value="">Selecione o grupo</option>
              {grupoOrg && <option value={grupoOrg}>{grupoOrg}</option>}
              <option value="Outros">Outros</option>
            </select>

            {form.grupo_origem === "Outros" && (
              <InputBase
                type="text"
                name="grupo_personalizado"
                placeholder="Digite o nome do grupo"
                value={form.grupo_personalizado || ""}
                onChange={handleChange}
                className="mt-2"
                required
              />
            )}

            {/* Apelido */}
            <label className="text-sm font-medium text-gray-700">Apelido</label>
            <InputBase
              type="text"
              name="apelido"
              placeholder="Apelido usado nas rodas ou treinos"
              value={form.apelido || ""}
              onChange={handleChange}
            />

            {/* Graduação */}
            {form.grupo_origem && (
              <div className="mt-3">
                <label className="text-sm font-medium text-gray-700">
                  Graduação
                </label>

                {form.grupo_origem === grupoOrg ? (
                  graduacoes.length > 0 ? (
                    <select
                      name="graduacao_id"
                      value={form.graduacao_id || ""}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 bg-white text-sm"
                      required
                    >
                      <option value="">Selecione a graduação</option>
                      {graduacoes.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.nome}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      Nenhuma graduação encontrada
                    </p>
                  )
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Graduação não aplicável
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
