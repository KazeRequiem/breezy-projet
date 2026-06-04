const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
    sequelize.define(
        "Follow",
        {
            id_user: { type: DataTypes.INTERGER, primaryKey: true},
            id_user_follow: { type:DataTypes.INTEGER, primaryKey: true},
        },
        { tableName: "follow", timestamps: false}
    );