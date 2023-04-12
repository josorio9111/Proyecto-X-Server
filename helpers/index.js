const dbValidator = require("./db.validator");
const crearRoles = require("./crear-roles.helper");
const subirArchivo = require("./subir-archivo");

module.exports = {
  ...dbValidator,
  ...crearRoles,
  ...subirArchivo,
};
