module.exports = (tipo_usuario) => {
  if (tipo_usuario === "ADMIN" || tipo_usuario === "PROFESSOR_ADMIN") {
    return { can: true, message: null };
  } else {
    return { can: false, message: "Não pode realizar essa operação" };
  }
};
