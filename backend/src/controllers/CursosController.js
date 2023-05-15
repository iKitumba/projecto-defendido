const Cursos = require("../models/Cursos");
const verifyTheAuthorization = require("../utils/verifyTheAuthorization");

class CursosController {
  async index(req, res) {
    const cursos = await Cursos.findAll({
      attributes: ["id", "titulo", "diminuitivo", "created_at"],
    });

    return res.json({ cursos });
  }

  async show(req, res) {
    const { tipo_usuario, usuario_id } = req;
    const auth = verifyTheAuthorization(tipo_usuario);

    if (!auth.can) {
      return res.status(401).json({ message: auth.message });
    }

    try {
      let cursos = await Cursos.findAll({
        attributes: ["id", "titulo", "diminuitivo", "created_at"],
        include: [
          {
            association: "turmas",
            order: ["classe", "ASCI"],
            include: [{ association: "alunos", attributes: ["nome_completo"] }],
          },
        ],
      });
      cursos = cursos.map((curso) => curso.toJSON());
      cursos = cursos.map((curso) => ({
        ...curso,
        turmas: curso.turmas.map((turma) => ({
          ...turma,
          alunos: turma.alunos.length,
        })),
      }));

      return res.json({ cursos });
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: "Infelizmente não consegui buscar os cursos. Tente novamente",
      });
    }
  }

  async store(req, res) {
    const { titulo, diminuitivo } = req.body;

    const { tipo_usuario, usuario_id } = req;

    const auth = verifyTheAuthorization(tipo_usuario);

    if (!auth.can) {
      return res.status(401).json({ message: auth.message });
    }
    if (!titulo) {
      return res
        .status(400)
        .json({ message: "O titulo do curso é obrigatorio" });
    }

    try {
      const curso = await Cursos.create({
        titulo,
        diminuitivo,
        criado_por: usuario_id,
      });

      return res.status(201).json({ curso });
    } catch (error) {
      console.log(error);
      return res.status(409).json({
        error: error.errors[0].message,
        message: "Ja existe um curso com esse titulo ou diminuitivo",
      });
    }
  }

  async update(req, res) {
    const { curso_id } = req.params;
    const { titulo, diminuitivo } = req.body;

    const { tipo_usuario, usuario_id } = req;

    const auth = verifyTheAuthorization(tipo_usuario);

    if (!auth.can) {
      return res.status(401).json({ message: auth.message });
    }

    const curso = await Cursos.findByPk(curso_id);

    if (!curso) {
      return res.status(404).json({ message: "Curso não encontrado" });
    }

    if (!titulo) {
      return res
        .status(400)
        .json({ message: "Por favor informe o titulo do curso" });
    }

    if (!diminuitivo) {
      return res
        .status(400)
        .json({ message: "Por favor informe a SIGLA do curso" });
    }

    await curso.update({ titulo, diminuitivo }); // diminuitivo === "SIGLA OU ABREVIAÇÃO"

    return res.json({ curso });
  }
}

module.exports = new CursosController();
