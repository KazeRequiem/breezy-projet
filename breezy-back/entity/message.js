const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "Message",
    {
      id_message: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      content: { type: DataTypes.STRING(280), allowNull: false },
      image_url: { type: DataTypes.STRING(255) },
      video_url: { type: DataTypes.STRING(255) },
      date_publication: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      id_user: { type: DataTypes.INTEGER, allowNull: false },
    },
    { tableName: "message", timestamps: false }
  );