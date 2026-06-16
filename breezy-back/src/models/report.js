const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
    sequelize.define(
        "Report",
        {
            id_message: { type: DataTypes.INTEGER, primaryKey: true },
            id_user: { type: DataTypes.INTEGER, primaryKey: true },
        },
        { tableName: "report", timestamps: false }
    );