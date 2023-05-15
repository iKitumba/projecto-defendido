const { Op } = require("sequelize");
const Alunos = require("../models/Alunos");
const Usuarios = require("../models/Usuarios");
const Cursos = require("../models/Cursos");
const Turmas = require("../models/Turmas");
const verifyTheAuthorization = require("../utils/verifyTheAuthorization");

class GeralController {
  async index(req, res) {
    const { tipo_usuario, usuario_id } = req;

    const auth = verifyTheAuthorization(tipo_usuario);

    if (!auth.can) {
      return res.status(401).json({ message: auth.message });
    }

    const [n_cursos, n_turmas, n_alunos, n_professores] = await Promise.all([
      Cursos.count(),
      Turmas.count(),
      Alunos.count(),
      Usuarios.count({
        where: {
          [Op.or]: [
            { tipo_usuario: "PROFESSOR" },
            { tipo_usuario: "PROFESSOR_ADMIN" },
          ],
        },
      }),
    ]);

    return res.json({ n_cursos, n_turmas, n_alunos, n_professores });
  }

  async show(req, res) {
    const { tipo_usuario, usuario_id } = req;
    const { curso_id } = req.params;

    const auth = verifyTheAuthorization(tipo_usuario);

    if (!auth.can) {
      return res.status(401).json({ message: auth.message });
    }

    try {
      let curso = await Cursos.findByPk(curso_id, {
        include: [
          {
            association: "turmas",
            order: [
              ["classe", "ASC"],
              ["letra", "ASC"],
            ],
            include: [{ association: "alunos", attributes: ["nome_completo"] }],
          },
        ],
      });

      if (!curso) {
        return res.status(404).json({ message: "Nenhuma turma encontrada!" });
      }

      curso = curso.toJSON();
      curso = curso.turmas.map((turma) => ({
        ...turma,
        alunos: turma.alunos.length,
      }));

      return res.json({ curso });
    } catch (error) {
      return res.status(400).json({
        message:
          "Ocorreu um erro ao buscar as turmas desse curso. Tente mais tarde.",
      });
    }
  }
}

module.exports = new GeralController();
