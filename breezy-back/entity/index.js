const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "postgre",
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
// ###TO FINISH### I'm fed up to finish them now, it's just boring screw it 

db.User.hasMany(db.Message, { foreignKey: "id_user" });
db.Message.belongsTo(db.User, { foreignKey: "id_user" });

