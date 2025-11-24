import util from "util";

console.log(`[LOGGER-TS] Versão TypeScript carregada com sucesso`);


/** Máscara de CPF */
export function mascararCpf(cpf?: string): string {
  if (!cpf) return "";
  const digits = cpf.replace(/\D/g, "");
  return digits.replace(/.(?=.{3})/g, "*");
}

/** Máscara de Telefone */
export function mascararTelefone(tel?: string): string {
  if (!tel) return "";
  const digits = tel.replace(/\D/g, "");
  return digits.replace(/.(?=.{4})/g, "*");
}

/** Timestamp ISO */
export function timestamp(): string {
  return new Date().toISOString();
}

const isProd = process.env.NODE_ENV === "production";

/** Níveis de log permitidos */
type LogLevel = "INFO" | "DEBUG" | "WARN" | "ERROR" | "LOG";

/** Impressão base */
function print(level: LogLevel, ...args: unknown[]): void {
  const ts = timestamp();

  const msg = args.map((a) =>
    typeof a === "object"
      ? util.inspect(a, { depth: null, colors: !isProd })
      : a
  );

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

/** Interface do logger (modelo) */
export interface ILogger {
  log: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (msg: string, err?: unknown) => void;

  mascararCpf: (cpf?: string) => string;
  mascararTelefone: (tel?: string) => string;
}

/** Implementação do logger */
export const logger: ILogger = {
  log: (...args) => {
    if (!isProd) print("LOG", ...args);
  },
  info: (...args) => {
    if (!isProd) print("INFO", ...args);
  },
  debug: (...args) => {
    if (!isProd) print("DEBUG", ...args);
  },
  warn: (...args) => {
    if (!isProd) print("WARN", ...args);
  },
  error: (msg, err) => {
    if (err instanceof Error) {
      print("ERROR", msg, { message: err.message, stack: err.stack });
    } else {
      print("ERROR", msg, err);
    }
  },

  mascararCpf,
  mascararTelefone,
};

/** Compatível com require() */
module.exports = logger;
module.exports.logger = logger;
