// models/ropa.js
module.exports = (sequelize, DataTypes) => {
  const Ropa = sequelize.define(
    "Ropa",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: DataTypes.STRING,
      color: DataTypes.STRING,
      imagen: DataTypes.STRING,
      fk_idcategoria: DataTypes.INTEGER,
    },
    {
      tableName: "ropa",
      timestamps: false,
    }
  );

  return Ropa;
};
