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

module.exports = {
  log: (...args) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(...args);
    }
  },
  error: (msg, error) => {
    if (process.env.NODE_ENV !== "production") {
      console.error(msg, error);
    } else {
      console.error(msg, error?.message || error);
    }
  },
  warn: (...args) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn(...args);
    }
  },
  mascararCpf,
  mascararTelefone,
};
