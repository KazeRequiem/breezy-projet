const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models");
const { getJwtSecret } = require("../config/secrets");

const User = db.User;