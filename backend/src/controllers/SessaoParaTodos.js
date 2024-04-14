const Alunos = require("../models/Alunos");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const { Op } = require("sequelize");
const SessaoController = require("../controllers/SessaoController");

class SessaoParaTodos {
  async store(req, res) {
    const { bi = "", senha } = req.body;

    if (!bi) {
      return res.status(404).json({ message: "Usuario nao encontrado" });
    }

    const aluno = await Alunos.findOne({
      where: {
        [Op.or]: [{ bi }, { id: Number(bi) || 1 }],
      },
    });

    if (!aluno) {
      req.body.username = bi;
      return SessaoController.store(req, res);
    }

    if (!(await bcrypt.compare(senha, aluno.senha))) {
      return res.status(401).json({ message: "Senha incorreta" });
    }

    aluno.senha = undefined;

    const token = generateToken({
      id: aluno.id,
    });

    return res.json({ aluno, token });
  }
}

module.exports = new SessaoParaTodos();
