"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.mascararCpf = mascararCpf;
exports.mascararTelefone = mascararTelefone;
exports.timestamp = timestamp;
const util_1 = __importDefault(require("util"));
console.log(`[LOGGER-TS] Versão TypeScript carregada com sucesso`);
/** Máscara de CPF */
function mascararCpf(cpf) {
    if (!cpf)
        return "";
    const digits = cpf.replace(/\D/g, "");
    return digits.replace(/.(?=.{3})/g, "*");
}
/** Máscara de Telefone */
function mascararTelefone(tel) {
    if (!tel)
        return "";
    const digits = tel.replace(/\D/g, "");
    return digits.replace(/.(?=.{4})/g, "*");
}
/** Timestamp ISO */
function timestamp() {
    return new Date().toISOString();
}
const isProd = process.env.NODE_ENV === "production";
/** Impressão base */
function print(level, ...args) {
    const ts = timestamp();
    const msg = args.map((a) => typeof a === "object"
        ? util_1.default.inspect(a, { depth: null, colors: !isProd })
        : a);
    switch (level) {
        case "ERROR":
            console.error(`[${ts}] [${level}]`, ...msg);
            break;
        case "WARN":
            console.warn(`[${ts}] [${level}]`, ...msg);
            break;
        case "INFO":
            console.info(`[${ts}] [${level}]`, ...msg);
            break;
        default:
            console.log(`[${ts}] [${level}]`, ...msg);
    }
}
/** Implementação do logger */
exports.logger = {
    log: (...args) => {
        if (!isProd)
            print("LOG", ...args);
    },
    info: (...args) => {
        if (!isProd)
            print("INFO", ...args);
    },
    debug: (...args) => {
        if (!isProd)
            print("DEBUG", ...args);
    },
    warn: (...args) => {
        if (!isProd)
            print("WARN", ...args);
    },
    error: (msg, err) => {
        if (err instanceof Error) {
            print("ERROR", msg, { message: err.message, stack: err.stack });
        }
        else {
            print("ERROR", msg, err);
        }
    },
    mascararCpf,
    mascararTelefone,
};
/** Compatível com require() */
module.exports = exports.logger;
module.exports.logger = exports.logger;
