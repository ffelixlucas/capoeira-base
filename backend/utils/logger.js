const util = require("util");

// Máscaras de dados sensíveis
function mascararCpf(cpf) {
  if (!cpf) return "";
  const digits = cpf.replace(/\D/g, "");
  return digits.replace(/.(?=.{3})/g, "*"); // *********999
}

function mascararTelefone(tel) {
  if (!tel) return "";
  const digits = tel.replace(/\D/g, "");
  return digits.replace(/.(?=.{4})/g, "*"); // ******4302
}

// Formatar timestamp
function timestamp() {
  return new Date().toISOString();
}

// Ambiente
const isProd = process.env.NODE_ENV === "production";

// Impressão base
function print(level, ...args) {
  const ts = timestamp();
  const msg = args.map(a =>
    typeof a === "object" ? util.inspect(a, { depth: null, colors: !isProd }) : a
  );
  if (level === "ERROR") {
    console.error(`[${ts}] [${level}]`, ...msg);
  } else if (level === "WARN") {
    console.warn(`[${ts}] [${level}]`, ...msg);
  } else if (level === "INFO") {
    console.info(`[${ts}] [${level}]`, ...msg);
  } else {
    console.log(`[${ts}] [${level}]`, ...msg);
  }
}

// Níveis
function info(...args) {
  if (!isProd) print("INFO", ...args);
}
function debug(...args) {
  if (!isProd) print("DEBUG", ...args);
}
function warn(...args) {
  if (!isProd) print("WARN", ...args);
}
function error(msg, err) {
  if (err instanceof Error) {
    print("ERROR", msg, { message: err.message, stack: err.stack });
  } else {
    print("ERROR", msg, err);
  }
}
function log(...args) {
  if (!isProd) print("LOG", ...args);
}

// Exportar como objeto logger
const logger = {
  log,
  info,
  error,
  warn,
  debug,
  mascararCpf,
  mascararTelefone,
};

module.exports = logger;         // permite const logger = require(...)
module.exports.logger = logger;  