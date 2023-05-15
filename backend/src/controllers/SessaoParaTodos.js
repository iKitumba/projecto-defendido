const Alunos = require("../models/Alunos");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const { Op } = require("sequelize");
const axios = require("axios");

class SessaoParaTodos {
  async store(req, res) {
    const { bi = "", senha } = req.body;

    if (!bi) {
      return res.status(404).json({ message: "Usuario nao encontrado" });
    }

    const aluno = await Alunos.findOne({
      where: {
        [Op.or]: [{ bi }, { id: bi }],
      },
    });

    if (!aluno) {
      try {
        const {
          data: { usuario, token },
        } = await axios.post(`${process.env.APP_URL}/usuarios/sessao`, {
          username: bi,
          senha,
        });
        return res.json({ usuario, token });
      } catch (error) {
        return res
          .status(error?.response.status || 400)
          .json(error?.response.data);
      }
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
