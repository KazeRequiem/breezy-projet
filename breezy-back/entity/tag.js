const{ DataTypes } = require("sequelize");

module.exports = (sequelize) =>
    sequelize.define(
        "Tag",
        {
            id_tag: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            name: { type: DataTypes.STRING(280), allowNull: false },
        },
        { tableName: "tag", timestamps: false }
    )