// src/components/inscricoes/InscritoFicha.jsx
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
    <div className="space-y-2 text-sm">
      {/* Apelido primeiro, nome abaixo */}
      <h2 className="text-center text-lg font-bold mb-1">
        {inscrito.apelido ? formatarNome(inscrito.apelido) : "Sem apelido"}
      </h2>
      {inscrito.nome && (
        <p className="text-sm text-center text-gray-600 mb-3">
          {formatarNome(inscrito.nome)}
        </p>
      )}

      {/* Dados principais */}
      <p>
        <strong>Data de Nascimento:</strong>{" "}
        {formatarData(inscrito.data_nascimento)}
      </p>
      <p>
        <strong>Email:</strong> {inscrito.email || "-"}
      </p>
      <p className="flex items-center gap-2">
        <strong>Telefone:</strong> {inscrito.telefone || "-"}
        {inscrito.telefone && (
          <FaWhatsapp
            onClick={() => abrirWhatsApp(inscrito.telefone)}
            className="text-green-500 cursor-pointer"
            title="Abrir no WhatsApp"
          />
        )}
      </p>

      {/* CPF do inscrito */}
      <p>
        <strong>CPF do Inscrito:</strong> {inscrito.cpf || "-"}
      </p>

      {/* Responsável */}
      {inscrito.responsavel_nome && (
        <div className="space-y-1">
          <p>
            <strong>Responsável:</strong> {formatarNome(inscrito.responsavel_nome)}
          </p>
          {inscrito.responsavel_documento && (
            <p>
              <strong>CPF do Responsável:</strong>{" "}
              {inscrito.responsavel_documento}
            </p>
          )}
          {inscrito.responsavel_contato && (
            <p className="flex items-center gap-2">
              <strong>Contato Resp.:</strong> {inscrito.responsavel_contato}
              <FaWhatsapp
                onClick={() => abrirWhatsApp(inscrito.responsavel_contato)}
                className="text-green-500 cursor-pointer"
                title="Abrir no WhatsApp"
              />
            </p>
          )}
          {inscrito.responsavel_parentesco && (
            <p>
              <strong>Parentesco:</strong>{" "}
              {formatarNome(inscrito.responsavel_parentesco)}
            </p>
          )}
        </div>
      )}

      <p>
        <strong>Categoria:</strong> {inscrito.categoria || "-"}
      </p>
      {inscrito.graduacao && (
        <p>
          <strong>Graduação:</strong> {inscrito.graduacao}
        </p>
      )}
      <p>
        <strong>Status:</strong> {inscrito.status}
      </p>
      <p>
        <strong>Valor bruto:</strong> R$ {formatarMoeda(inscrito.valor_bruto)}
      </p>
      <p>
        <strong>Valor líquido:</strong> R$ {formatarMoeda(inscrito.valor_liquido)}
      </p>
      <p>
        <strong>Forma de pagamento:</strong> {inscrito.metodo_pagamento || "-"}
      </p>

      {/* Só aparece se for cartão */}
      {inscrito.metodo_pagamento === "cartao" && (
        <>
          <p>
            <strong>Bandeira:</strong> {inscrito.bandeira_cartao || "-"}
          </p>
          <p>
            <strong>Parcelas:</strong> {inscrito.parcelas || 1}
          </p>
        </>
      )}

      <p>
        <strong>Pagamento ID:</strong> {inscrito.pagamento_id || "-"}
      </p>
      <p>
        <strong>Data Inscrição:</strong> {formatarData(inscrito.criado_em)}
      </p>

      {/* Autorizações */}
      <div className="mt-4 border-t pt-3 space-y-1">
        <p>
          <strong>Autorização Participação:</strong>{" "}
          {formatBool(inscrito.autorizacao_participacao)}
        </p>
        <p>
          <strong>Autorização Imagem:</strong>{" "}
          {formatBool(inscrito.autorizacao_imagem)}
        </p>
        <p>
          <strong>Aceite Imagem:</strong> {formatBool(inscrito.aceite_imagem)}
        </p>
        <p>
          <strong>Aceite Responsabilidade:</strong>{" "}
          {formatBool(inscrito.aceite_responsabilidade)}
        </p>
        <p>
          <strong>Aceite LGPD:</strong> {formatBool(inscrito.aceite_lgpd)}
        </p>
      </div>

      {/* Extras */}
      <div className="mt-4 border-t pt-3 space-y-1">
        <p>
          <strong>Tamanho Camiseta:</strong> {inscrito.tamanho_camiseta || "-"}
        </p>
        {inscrito.alergias_restricoes && (
          <p>
            <strong>Alergias / Restrições:</strong>{" "}
            {inscrito.alergias_restricoes}
          </p>
        )}
      </div>
    </div>
  );
}
