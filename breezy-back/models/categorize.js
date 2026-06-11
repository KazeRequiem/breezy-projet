const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
    sequelize.define(
        "Categorize",
        {
            id_tag: { type: DataTypes.INTEGER, primaryKey: true },
            id_message: { type: DataTypes.INTEGER, primaryKey: true},
        },
        { tableName: "categorize", timestamps: false }
    );