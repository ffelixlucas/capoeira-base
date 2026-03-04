import util from "util";

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

type LogLevelName = "debug" | "info" | "warn" | "error";
type PrintLevel = "INFO" | "DEBUG" | "WARN" | "ERROR" | "LOG";

const isProd = process.env.NODE_ENV === "production";
const defaultLevel: LogLevelName = isProd ? "info" : "debug";
const envLevelRaw = String(process.env.LOG_LEVEL || defaultLevel).toLowerCase();
const envLevel: LogLevelName =
  envLevelRaw === "debug" ||
  envLevelRaw === "info" ||
  envLevelRaw === "warn" ||
  envLevelRaw === "error"
    ? envLevelRaw
    : defaultLevel;

const LEVEL_WEIGHT: Record<LogLevelName, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function shouldLog(level: LogLevelName): boolean {
  return LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[envLevel];
}

/** Impressão base */
function print(level: PrintLevel, ...args: unknown[]): void {
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

/** Interface do logger */
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
    if (shouldLog("info")) print("LOG", ...args);
  },
  info: (...args) => {
    if (shouldLog("info")) print("INFO", ...args);
  },
  debug: (...args) => {
    if (shouldLog("debug")) print("DEBUG", ...args);
  },
  warn: (...args) => {
    if (shouldLog("warn")) print("WARN", ...args);
  },
  error: (msg, err) => {
    if (!shouldLog("error")) return;
    if (err instanceof Error) {
      print("ERROR", msg, { message: err.message, stack: err.stack });
    } else {
      print("ERROR", msg, err);
    }
  },

  mascararCpf,
  mascararTelefone,
};

export default logger;
