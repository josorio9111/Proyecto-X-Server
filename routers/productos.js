const router = require("express").Router();
const { check } = require("express-validator");
const { validarCampos, isAdminRole, validarArchivo } = require("../middlewares");
const productos = require("../controllers/productos");
const { existeIdProducto, existeIdCategoria } = require("../helpers");

router.get("/", [
],productos.findAll);

router.get(
  "/:id",
  [
    check("id", "No es un Id de Mongo").isMongoId(),
    check("id").custom(existeIdProducto),
    validarCampos,
  ],
  productos.findOne
);

router.post(
  "/",
  [
    check("nombre", "El nombre es obligatorio").notEmpty(),
    check("categoria", "La categoria es obligatoria").notEmpty(),
    check("categoria").custom(existeIdCategoria),
    validarArchivo,
    validarCampos
  ],
  productos.create_foto
);

router.put(
  "/:id",
  [
    check("id", "No es un Id de Mongo").isMongoId(),
    check("id").custom(existeIdProducto),
    validarCampos
  ],
  productos.update
);

router.delete(
  "/:id",
  [
    check("id", "No es un Id de Mongo").isMongoId(),
    check("id").custom(existeIdProducto),
    validarCampos
  ],
  productos.destroy
);

module.exports = router;
