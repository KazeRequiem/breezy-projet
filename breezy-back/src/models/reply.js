const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
    sequelize.define(
        "Reply",
        {
            id_message: { type: DataTypes.INTEGER, primaryKey: true},
            id_message_reply: { type: DataTypes.INTEGER, primaryKey: true },
        },
        { tableName: "reply", timestamps: false }
    );