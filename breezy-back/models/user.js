const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "User",
    {
      id_user: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      username: { type: DataTypes.STRING(50), allowNull: false },
      email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      password: { type: DataTypes.STRING(255), allowNull: false },
      biography: { type: DataTypes.STRING(160) },
      profile_picture: { type: DataTypes.STRING(255) },
      role: {
        type: DataTypes.ENUM("user", "moderator", "admin"),
        defaultValue: "user",
        allowNull: false,
      },
      date_creation: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { tableName: "user", timestamps: false }
  );