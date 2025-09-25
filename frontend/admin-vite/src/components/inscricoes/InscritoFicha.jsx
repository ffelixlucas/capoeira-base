import { FaWhatsapp } from "react-icons/fa";

export default function InscritoFicha({
  inscrito,
  formatarData,
  formatBool,
  abrirWhatsApp,
}) {
  if (!inscrito) return null;

  const formatarMoeda = (valor) => {
    if (!valor) return "0,00";
    return Number(valor).toFixed(2).replace(".", ",");
  };

  const formatarNome = (nome) => {
    if (!nome) return "-";
    return nome
      .toLowerCase()
      .split(" ")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-6 text-sm divide-y divide-gray-200">
      {/* Dados pessoais */}
      <div className="section-wrapper">
        <h3 className="section-title">Dados pessoais</h3>
        <div className="field-grid">
          <div>
            <span className="field-label">Nascimento</span>
            <span className="field-value">
              {formatarData(inscrito.data_nascimento)}
            </span>
          </div>
          <div>
            <span className="field-label">CPF</span>
            <span className="field-value break-all">
              {inscrito.cpf || "-"}
            </span>
          </div>
          <div>
            <span className="field-label">Email</span>
            <span className="field-value break-all">
              {inscrito.email || "-"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div>
              <span className="field-label">Telefone</span>
              <span className="field-value">
                {inscrito.telefone || "-"}
              </span>
            </div>
            {inscrito.telefone && (
              <FaWhatsapp
                onClick={() => abrirWhatsApp(inscrito.telefone)}
                className="text-green-500 cursor-pointer"
                title="Abrir no WhatsApp"
              />
            )}
          </div>
        </div>
      </div>

      {/* Responsável */}
      {inscrito.responsavel_nome && (
        <div className="section-wrapper">
          <h3 className="section-title">Responsável</h3>
          <div className="field-grid">
            <div>
              <span className="field-label">Nome</span>
              <span className="field-value break-words">
                {formatarNome(inscrito.responsavel_nome)}
              </span>
            </div>
            <div>
              <span className="field-label">CPF</span>
              <span className="field-value break-all">
                {inscrito.responsavel_documento || "-"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div>
                <span className="field-label">Contato</span>
                <span className="field-value">
                  {inscrito.responsavel_contato || "-"}
                </span>
              </div>
              {inscrito.responsavel_contato && (
                <FaWhatsapp
                  onClick={() => abrirWhatsApp(inscrito.responsavel_contato)}
                  className="text-green-500 cursor-pointer"
                  title="Abrir no WhatsApp"
                />
              )}
            </div>
            <div>
              <span className="field-label">Parentesco</span>
              <span className="field-value">
                {formatarNome(inscrito.responsavel_parentesco)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Pagamento */}
      <div className="section-wrapper">
        <h3 className="section-title">Pagamento</h3>
        <div className="field-grid">
          <div>
            <span className="field-label">Status</span>
            <span className="field-value">{inscrito.status}</span>
          </div>
          <div>
            <span className="field-label">Método</span>
            <span className="field-value">
              {inscrito.metodo_pagamento || "-"}
            </span>
          </div>
          <div>
            <span className="field-label">Valor bruto</span>
            <span className="field-value">
              R$ {formatarMoeda(inscrito.valor_bruto)}
            </span>
          </div>
          <div>
            <span className="field-label">Valor líquido</span>
            <span className="field-value">
              R$ {formatarMoeda(inscrito.valor_liquido)}
            </span>
          </div>
          {inscrito.metodo_pagamento === "cartao" && (
            <>
              <div>
                <span className="field-label">Bandeira</span>
                <span className="field-value">
                  {inscrito.bandeira_cartao || "-"}
                </span>
              </div>
              <div>
                <span className="field-label">Parcelas</span>
                <span className="field-value">
                  {inscrito.parcelas || 1}
                </span>
              </div>
            </>
          )}
          <div>
            <span className="field-label">Pagamento ID</span>
            <span className="field-value break-all">
              {inscrito.pagamento_id || "-"}
            </span>
          </div>
          <div>
            <span className="field-label">Data inscrição</span>
            <span className="field-value">
              {formatarData(inscrito.criado_em)}
            </span>
          </div>
        </div>
      </div>

      {/* Autorizações */}
      <div className="section-wrapper">
        <h3 className="section-title">Autorizações</h3>
        <div className="grid grid-cols-2 gap-2">
          <span>
            <strong>Participação:</strong>{" "}
            {formatBool(inscrito.autorizacao_participacao)}
          </span>
          <span>
            <strong>Imagem:</strong>{" "}
            {formatBool(inscrito.autorizacao_imagem)}
          </span>
          <span>
            <strong>Aceite Imagem:</strong>{" "}
            {formatBool(inscrito.aceite_imagem)}
          </span>
          <span>
            <strong>Responsabilidade:</strong>{" "}
            {formatBool(inscrito.aceite_responsabilidade)}
          </span>
          <span>
            <strong>LGPD:</strong>{" "}
            {formatBool(inscrito.aceite_lgpd)}
          </span>
        </div>
      </div>

      {/* Extras */}
      <div className="section-wrapper">
        <h3 className="section-title">Extras</h3>
        <div className="field-grid">
          <div>
            <span className="field-label">Camiseta</span>
            <span className="field-value">
              {inscrito.tamanho_camiseta || "-"}
            </span>
          </div>
          {inscrito.alergias_restricoes && (
            <div className="col-span-2">
              <span className="field-label">Alergias / Restrições</span>
              <span className="field-value break-words">
                {inscrito.alergias_restricoes}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
