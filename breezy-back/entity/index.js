const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "postgres",
        logging: false,
    }
);

const db = { sequelize, Sequelize };

db.User = require("./user")(sequelize);
db.Message = require("./message")(sequelize);
db.Follow = require("./follow")(sequelize);
db.Like = require("./like")(sequelize);
db.Report = require("./report")(sequelize);
db.Reply = require("./reply")(sequelize);
db.Tag = require("./tag")(sequelize);
db.Categorize = require("./categorize")(sequelize);

// Database Associations

db.User.hasMany(db.Message, { foreignKey: "id_user" });
db.Message.belongsTo(db.User, { foreignKey: "id_user" });

db.User.belongsToMany(db.User, {
  through: db.Follow, as: "Following",
  foreignKey: "id_user", otherKey: "id_user_follow",
});
db.User.belongsToMany(db.User, {
  through: db.Follow, as: "Followers",
  foreignKey: "id_user_follow", otherKey: "id_user",
});

db.User.belongsToMany(db.Message, {
  through: db.Like, as: "LikedMessages",
  foreignKey: "id_user", otherKey: "id_message",
});
db.Message.belongsToMany(db.User, {
  through: db.Like, as: "LikedBy",
  foreignKey: "id_message", otherKey: "id_user",
});

db.User.belongsToMany(db.Message, {
  through: db.Report, as: "ReportedMessages",
  foreignKey: "id_user", otherKey: "id_message",
});
db.Message.belongsToMany(db.User, {
  through: db.Report, as: "ReportedBy",
  foreignKey: "id_message", otherKey: "id_user",
});

db.Message.belongsToMany(db.Message, {
  through: db.Reply, as: "Replies",
  foreignKey: "id_message", otherKey: "id_message_reply",
});

db.Message.belongsToMany(db.Tag, {
  through: db.Categorize,
  foreignKey: "id_message", otherKey: "id_tag",
});
db.Tag.belongsToMany(db.Message, {
  through: db.Categorize,
  foreignKey: "id_tag", otherKey: "id_message",
});

module.exports = db;

