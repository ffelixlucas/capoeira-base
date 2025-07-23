// src/components/alunos/ModalAluno.jsx
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import NotasAluno from "./NotasAluno";

export default function ModalAluno({ aberto, onClose, aluno }) {

  if (!aluno) return null;

  return (
    <Transition appear show={aberto} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto text-left">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-gray-800 shadow-xl transition-all">
                {/* FOTO ou iniciais */}
                <div className="flex justify-center mb-4">
                  {aluno.foto_url ? (
                    <img
                      src={aluno.foto_url}
                      alt="Foto do aluno"
                      className="h-24 w-24 rounded-full object-cover border shadow"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 shadow">
                      {(aluno.apelido || aluno.nome || "?")
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                </div>

                {/* APELIDO e NOME */}
                <Dialog.Title className="text-center text-lg font-bold mb-1">
                  {aluno.apelido || "Sem apelido"}
                </Dialog.Title>
                <p className="text-sm text-center text-gray-600 mb-3">
                  {aluno.nome}
                </p>

                {/* FICHA COMPLETA */}
                <div className="space-y-2 text-sm">
                  {aluno.graduacao && (
                    <p>
                      <strong>Graduação:</strong> {aluno.graduacao}
                    </p>
                  )}

                  {aluno.nascimento && (
                    <p>
                      <strong>Nascimento:</strong>{" "}
                      {new Date(aluno.nascimento).toLocaleDateString("pt-BR")}
                    </p>
                  )}

                  {aluno.nome_responsavel && (
                    <p>
                      <strong>Responsável:</strong> {aluno.nome_responsavel}
                    </p>
                  )}

                  {aluno.telefone_responsavel && (
                    <p className="flex items-center gap-2">
                      <strong>Contato:</strong> {aluno.telefone_responsavel}
                      <a
                        href={`https://wa.me/55${aluno.telefone_responsavel.replace(
                          /\D/g,
                          ""
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded-md transition"
                        aria-label="Abrir WhatsApp"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M20.52 3.48A11.72 11.72 0 0012.01.3a11.72 11.72 0 00-8.5 3.48A11.7 11.7 0 000 12.01c0 2.05.53 4.04 1.54 5.79L.03 24l6.3-1.64a11.86 11.86 0 005.68 1.44h.01a11.72 11.72 0 008.51-3.48A11.72 11.72 0 0023.7 12a11.72 11.72 0 00-3.18-8.52zm-8.5 18.27h-.01a9.4 9.4 0 01-4.79-1.29l-.34-.2-3.74.97 1-3.64-.22-.37a9.34 9.34 0 01-1.43-4.96c0-5.2 4.23-9.43 9.44-9.43 2.53 0 4.91.99 6.7 2.78a9.43 9.43 0 012.75 6.67 9.44 9.44 0 01-2.77 6.69 9.43 9.43 0 01-6.68 2.78zM17.23 14.6c-.28-.14-1.64-.8-1.9-.9-.26-.1-.44-.14-.63.14-.19.28-.72.9-.88 1.08-.16.17-.32.2-.6.07a7.48 7.48 0 01-2.2-1.36 8.26 8.26 0 01-1.53-1.9c-.16-.27-.02-.42.12-.55.12-.12.28-.31.42-.46.14-.16.19-.26.28-.44.1-.2.05-.37-.02-.51-.07-.14-.63-1.52-.86-2.08-.22-.56-.45-.48-.63-.49h-.54c-.17 0-.44.06-.67.28-.23.23-.88.86-.88 2.1 0 1.23.9 2.43 1.02 2.6.13.17 1.76 2.68 4.28 3.76.6.26 1.06.42 1.42.53.6.19 1.14.16 1.57.1.48-.07 1.48-.6 1.7-1.18.21-.59.21-1.1.15-1.18-.06-.08-.23-.13-.5-.27z" />
                        </svg>
                      </a>
                    </p>
                  )}

                  {aluno.endereco && (
                    <p>
                      <strong>Endereço:</strong> {aluno.endereco}
                    </p>
                  )}

                  {aluno.turma && (
                    <p>
                      <strong>Turma:</strong> {aluno.turma}
                    </p>
                  )}

                  {aluno.observacoes_medicas && (
                    <p className="text-red-600 font-medium mt-2">
                      ⚠️ {aluno.observacoes_medicas}
                    </p>
                  )}
                </div>
                <NotasAluno alunoId={aluno.id} />

                {/* BOTÃO FECHAR */}
                <div className="mt-6 text-right">
                  <button
                    onClick={onClose}
                    className="px-4 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    Fechar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
