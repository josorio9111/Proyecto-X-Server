const { check } = require("express-validator");
const router = require("express").Router();
const categorias = require("../controllers/categorias");
const { existeIdCategoria } = require("../helpers/db.validator");
const { validarCampos, isAdminRole } = require("../middlewares");

router.post(
  "/",
  [
    check("nombre", "El nombre es obligatorio").notEmpty(),
    validarCampos,
  ],
  categorias.create
);

router.get("/", categorias.findAll);

router.get(
  "/:id",
  [
    check("id", "No es un Id de Mongo").isMongoId(),
    check("id").custom(existeIdCategoria),
    validarCampos,
  ],
  categorias.findOne
);

router.put(
  "/:id",
  [
    check("id", "No es un Id de Mongo").isMongoId(),
    check("id").custom(existeIdCategoria),
    validarCampos,
  ],
  categorias.update
);

router.delete(
  "/:id",
  [
    isAdminRole,
    check("id", "No es un Id de Mongo").isMongoId(),
    check("id").custom(existeIdCategoria),
    validarCampos,
  ],
  categorias.destroy
);

module.exports = router;
