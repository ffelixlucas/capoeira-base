// src/docs/politicaLGPD.js
import React from "react";

export default function PoliticaLGPD({
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
        <div>
          <h3 className="font-semibold text-black text-sm md:text-base">
            1. Finalidade da Coleta de Dados
          </h3>
          <p className="mt-1">
            Os dados pessoais informados neste formulário serão utilizados{" "}
            <span className="font-medium">exclusivamente</span> para:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Gerenciar sua inscrição no evento;</li>
            <li>Emitir comprovantes e autorizações necessárias;</li>
            <li>Garantir comunicação oficial com os organizadores;</li>
            <li>Cumprir obrigações legais e regulatórias aplicáveis.</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-black text-sm md:text-base">
            2. Dados Coletados
          </h3>
          <p className="mt-1">
            Durante o processo de inscrição poderão ser solicitados:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              Dados de identificação (nome, apelido, CPF, RG, data de
              nascimento);
            </li>
            <li>
              Dados de contato (telefone, e-mail, endereço, se aplicável);
            </li>
            <li>
              Dados de saúde relevantes para sua segurança (alergias, restrições
              médicas ou alimentares), quando informado;
            </li>
            <li>
              Dados de responsáveis legais (no caso de menores de idade), como
              nome, CPF e contato;
            </li>
            <li>
              Registros de autorização de uso de imagem e participação no
              evento.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-black text-sm md:text-base">
            3. Base Legal e Consentimento
          </h3>
          <p className="mt-1">
            O tratamento de dados ocorre com fundamento nas bases legais da Lei
            nº 13.709/2018 (LGPD), especialmente{" "}
            <span className="font-medium">consentimento</span>,{" "}
            <span className="font-medium">execução de contrato</span> e{" "}
            <span className="font-medium">cumprimento de obrigação legal</span>,
            quando aplicável. O aceite eletrônico registrado no sistema
            (data/hora e IP) configura{" "}
            <span className="font-medium">assinatura eletrônica simples</span>.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-black text-sm md:text-base">
            4. Uso de Imagem
          </h3>
          <p className="mt-1">
            Ao aceitar este termo, o participante (ou seu responsável legal)
            autoriza o uso de sua imagem e voz em materiais institucionais,
            fotos, vídeos, redes sociais e campanhas relacionadas ao evento, sem
            qualquer ônus financeiro. O consentimento pode ser revogado a
            qualquer momento, com efeitos não retroativos.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-black text-sm md:text-base">
            5. Armazenamento e Segurança
          </h3>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Acesso restrito aos dados por pessoas autorizadas;</li>
            <li>
              Medidas técnicas e organizacionais para proteção contra acessos
              não autorizados, perda, alteração ou divulgação indevida;
            </li>
            <li>
              Retenção dos dados pelo tempo necessário ao cumprimento das
              finalidades e obrigações legais.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-black text-sm md:text-base">
            6. Compartilhamento
          </h3>
          <p className="mt-1">
            Não compartilhamos dados com terceiros, exceto quando exigido por
            lei, por ordem de autoridade competente ou para atendimento de
            obrigações legais/regulatórias aplicáveis.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-black text-sm md:text-base">
            7. Direitos do Titular
          </h3>
          <p className="mt-1">
            Você (ou seu responsável legal) pode, a qualquer momento:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Solicitar acesso, correção ou exclusão de seus dados;</li>
            <li>Revogar consentimentos concedidos (sem efeito retroativo);</li>
            <li>
              Solicitar informações claras sobre o tratamento de dados realizado
              por {organization}.
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-black text-sm md:text-base">
            8. Inscrições de Menores de Idade
          </h3>
          <p className="mt-1">
            Para menores de idade, a inscrição deve ser realizada por
            responsável legal, que declara veracidade dos dados e assume plena
            responsabilidade pela participação do menor no evento.{" "}
            <span className="font-medium">
              Quando solicitado, o envio do documento de autorização é
              obrigatório.
            </span>
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-black text-sm md:text-base">
            9. Contato do Encarregado (DPO)
          </h3>
          <p className="mt-1">
            Em caso de dúvidas, solicitações ou exercício de direitos, entre em
            contato diretamente com a administração do evento pelos canais
            oficiais de comunicação.
          </p>
        </div>

        <div className="border-t pt-3 text-xs md:text-sm text-gray-500">
          <p>
            Ao prosseguir com a inscrição, você declara ter lido e concordado
            com estes termos, autorizando o tratamento dos dados conforme a LGPD
            e as finalidades aqui descritas.
          </p>
        </div>
      </section>
    </div>
  );
}
