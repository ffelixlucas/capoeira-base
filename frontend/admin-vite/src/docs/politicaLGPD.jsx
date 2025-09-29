// src/docs/politicaLGPD.jsx
import React from "react";

export default function PoliticaLGPD({
  contexto = "evento", // "evento" | "matricula"
  organization = "Organização",
  contactEmail = "seu-email@dominio.com",
  updatedAt = new Date(),
}) {
  const dataFormatada =
    typeof updatedAt === "string"
      ? updatedAt
      : new Date(updatedAt).toLocaleDateString("pt-BR", {
          timeZone: "America/Sao_Paulo",
        });

  return (
    <div className="text-gray-800 text-sm md:text-base leading-relaxed">
      {/* Cabeçalho */}
      <header className="mb-4 md:mb-6">
        <h2 className="text-base md:text-lg font-bold tracking-tight text-black">
          Política de Privacidade e Termos de Consentimento (LGPD)
        </h2>
        <p className="mt-1 text-xs md:text-sm text-gray-500">
          Última atualização: {dataFormatada}
        </p>
      </header>

      {/* Conteúdo estruturado */}
      <section className="space-y-4 md:space-y-5">
        {/* Finalidade */}
        <div>
          <h3 className="font-semibold text-black text-sm md:text-base">
            1. Finalidade da Coleta de Dados
          </h3>
          <p className="mt-1">
            {contexto === "evento" ? (
              <>
                Os dados pessoais informados neste formulário serão utilizados{" "}
                <span className="font-medium">exclusivamente</span> para gerenciar
                sua inscrição no evento, emitir comprovantes e autorizações,
                garantir comunicação com os organizadores e cumprir obrigações legais.
              </>
            ) : (
              <>
                Os dados pessoais informados neste formulário serão utilizados{" "}
                <span className="font-medium">exclusivamente</span> para gerenciar
                sua matrícula, organizar turmas, registrar presenças, manter
                comunicação oficial com a administração e cumprir obrigações legais.
              </>
            )}
          </p>
        </div>

        {/* Dados coletados */}
        <div>
          <h3 className="font-semibold text-black text-sm md:text-base">
            2. Dados Coletados
          </h3>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Dados de identificação (nome, apelido, CPF, RG, data de nascimento);</li>
            <li>Dados de contato (telefone, e-mail, endereço, se aplicável);</li>
            <li>Dados de saúde/restrições físicas relevantes à segurança;</li>
            <li>
              Dados de responsáveis legais (quando menores de idade), como nome, CPF e contato;
            </li>
            <li>Registros de autorização de uso de imagem e participação.</li>
          </ul>
        </div>

        {/* Base legal */}
        <div>
          <h3 className="font-semibold text-black text-sm md:text-base">
            3. Base Legal e Consentimento
          </h3>
          <p className="mt-1">
            O tratamento de dados ocorre conforme a Lei nº 13.709/2018 (LGPD),
            especialmente pelas bases de{" "}
            <span className="font-medium">consentimento</span>,{" "}
            <span className="font-medium">execução de contrato</span> e{" "}
            <span className="font-medium">cumprimento de obrigação legal</span>.
            O aceite eletrônico registrado no sistema configura{" "}
            <span className="font-medium">assinatura eletrônica simples</span>.
          </p>
        </div>

        {/* Uso de imagem */}
        <div>
          <h3 className="font-semibold text-black text-sm md:text-base">
            4. Uso de Imagem
          </h3>
          <p className="mt-1">
            Ao aceitar este termo, o participante (ou seu responsável legal)
            autoriza o uso de sua imagem e voz em materiais institucionais,
            fotos, vídeos, redes sociais e campanhas relacionadas, sem
            qualquer ônus. O consentimento pode ser revogado a qualquer momento,
            com efeitos não retroativos.
          </p>
        </div>

        {/* Seções comuns (armazenamento, compartilhamento, direitos) */}
        <div>
          <h3 className="font-semibold text-black text-sm md:text-base">
            5. Armazenamento e Segurança
          </h3>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Acesso restrito aos dados por pessoas autorizadas;</li>
            <li>Medidas técnicas contra acessos não autorizados, perda ou alteração;</li>
            <li>Retenção pelo tempo necessário ao cumprimento das finalidades.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-black text-sm md:text-base">
            6. Compartilhamento
          </h3>
          <p className="mt-1">
            Não compartilhamos dados com terceiros, exceto quando exigido por lei
            ou ordem de autoridade competente.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-black text-sm md:text-base">
            7. Direitos do Titular
          </h3>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Solicitar acesso, correção ou exclusão de dados;</li>
            <li>Revogar consentimentos concedidos (sem efeito retroativo);</li>
            <li>Obter informações claras sobre o tratamento de dados por {organization}.</li>
          </ul>
        </div>

        {/* Contexto específico: evento x matrícula */}
        {contexto === "evento" && (
          <div>
            <h3 className="font-semibold text-black text-sm md:text-base">
              8. Inscrições de Menores de Idade
            </h3>
            <p className="mt-1">
              Para menores, a inscrição deve ser realizada por responsável legal,
              que declara veracidade dos dados e assume plena responsabilidade
              pela participação no evento.
            </p>
          </div>
        )}

        {contexto === "matricula" && (
          <div>
            <h3 className="font-semibold text-black text-sm md:text-base">
              8. Matrícula de Menores de Idade
            </h3>
            <p className="mt-1">
              Para menores, a matrícula deve ser realizada por responsável legal,
              que declara veracidade dos dados e assume plena responsabilidade
              pela participação nas aulas.{" "}
              <span className="font-medium">
                Quando solicitado, será necessário envio do documento de autorização.
              </span>
            </p>
          </div>
        )}

        {/* Rodapé */}
        <div className="border-t pt-3 text-xs md:text-sm text-gray-500">
          <p>
            Ao prosseguir com {contexto === "evento" ? "a inscrição" : "a matrícula"},
            você declara ter lido e concordado com estes termos, autorizando o
            tratamento dos dados conforme a LGPD e as finalidades aqui descritas.
          </p>
        </div>
      </section>
    </div>
  );
}
