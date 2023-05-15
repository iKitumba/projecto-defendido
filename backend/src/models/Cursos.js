const crypto = require("crypto");
const { Model, DataTypes } = require("sequelize");

class Cursos extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        titulo: DataTypes.STRING,
        diminuitivo: {
          type: DataTypes.STRING(10),
          unique: {
            msg: "Já existe um curso com esse diminuítivo",
          },
          validate: {
            isUppercase: {
              msg: "A sigla ou abreviação do curso deve ser toda em letras MAÍUSCULAS",
            },
          },
        },
      },
      {
        sequelize,
        hooks: {
          beforeCreate: (curso, _) => {
            curso.id = crypto.randomBytes(16).toString("base64url");
          },
        },
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Usuarios, {
      foreignKey: "criado_por",
      as: "usuario",
    });
    this.hasMany(models.Turmas, { foreignKey: "curso_id", as: "turmas" });
  }
}

module.exports = Cursos;
