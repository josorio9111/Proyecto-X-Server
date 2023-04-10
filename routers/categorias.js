const { check } = require("express-validator");
const router = require("express").Router();
const categorias = require("../controllers/categorias");
const { existeIdCategoria } = require("../helpers/db.validator");
const { validarCampos, validarJWT, isAdminRole, validarJWTFirebase } = require("../middlewares");

router.post(
  "/",
  [
    validarJWTFirebase,
    check("nombre", "El nombre es obligatorio").notEmpty(),
    validarCampos,
  ],
  categorias.create
);

router.get("/", [
  validarJWTFirebase
],categorias.findAll);

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
    validarJWT,
    check("id", "No es un Id de Mongo").isMongoId(),
    check("id").custom(existeIdCategoria),
    validarCampos,
  ],
  categorias.update
);

router.delete(
  "/:id",
  [
    validarJWT,
    isAdminRole,
    check("id", "No es un Id de Mongo").isMongoId(),
    check("id").custom(existeIdCategoria),
    validarCampos,
  ],
  categorias.destroy
);

module.exports = router;
