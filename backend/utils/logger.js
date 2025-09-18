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

function log(...args) {
  if (process.env.NODE_ENV !== "production") {
    console.log(...args);
  }
}

function info(...args) {
  if (process.env.NODE_ENV !== "production") {
    console.info("[INFO]", ...args);
  }
}

function error(msg, error) {
  if (process.env.NODE_ENV !== "production") {
    console.error("[ERROR]", msg, error);
  } else {
    console.error(msg, error?.message || error);
  }
}

function warn(...args) {
  if (process.env.NODE_ENV !== "production") {
    console.warn("[WARN]", ...args);
  }
}

module.exports = {
  log,
  info,
  error,
  warn,
  mascararCpf,
  mascararTelefone,
};
