const Cursos = require("../models/Cursos");
const verifyTheAuthorization = require("../utils/verifyTheAuthorization");

class CursosDashboardController {
  async show(req, res) {
    const { tipo_usuario, usuario_id } = req;

    const auth = verifyTheAuthorization(tipo_usuario);

    if (!auth.can) {
      return res.status(401).json({ message: auth.message });
    }

    try {
      const dadosCursos = await Cursos.findAll({
        order: [["titulo", "ASC"]],
        include: [{ association: "turmas" }],
      });
      const n_turmas = dadosCursos
        .map((dc) => dc.toJSON())
        .map((dc) => ({ ...dc, turmas: dc.turmas.length }));

      return res.json({ curso_n_turmas: n_turmas });
    } catch (error) {
      console.log(error);
      return res
        .status(400)
        .json({ message: "Erro ao buscar os dados do curso" });
    }
  }
}

module.exports = new CursosDashboardController();
