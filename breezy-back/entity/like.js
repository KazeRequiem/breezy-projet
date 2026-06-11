const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
    sequelize.define(
        "Like",
        {
            id_user: { type: DataTypes.INTEGER, primaryKey: true},
            id_message: { type: DataTypes.INTEGER, primary: true},
        },
        { tableName: "like", timestamps: false}
    );