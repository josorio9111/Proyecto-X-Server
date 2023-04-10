const mongoose = require("mongoose");
const dbConfig = require("../database/db.config.js");
const { crearRoles } = require("../helpers/crear-roles.helper.js");

mongoose.set("strictQuery", true);

mongoose.Promise = global.Promise;
const models = {};

models.url = dbConfig.url;
models.mongoose = mongoose;
models.categorias = require("./categorias.js")(mongoose); // Models
models.productos = require("./productos.js")(mongoose); // Models
models.usuarios = require("./usuarios")(mongoose); // Models
models.roles = require("./roles.js")(mongoose); // Models
crearRoles(models.roles);

module.exports = models;
