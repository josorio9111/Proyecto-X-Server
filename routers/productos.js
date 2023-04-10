const router = require("express").Router();
const { check } = require("express-validator");
const { validarCampos, validarJWT, isAdminRole, validarArchivo, validarJWTFirebase } = require("../middlewares");
const productos = require("../controllers/productos");
const { existeIdProducto, existeIdCategoria } = require("../helpers");

router.get("/", [
  validarJWTFirebase
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

// router.post(
//   "/",
//   [
//     validarJWT,
//     check("nombre", "El nombre es obligatorio").notEmpty(),
//     check("categoria", "La categoria es obligatoria").notEmpty(),
//     check("categoria").custom(existeIdCategoria),
//     validarCampos,
//   ],
//   productos.create
// );

router.post(
  "/",
  [
    validarJWT,
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
    validarJWT,
    check("id", "No es un Id de Mongo").isMongoId(),
    check("id").custom(existeIdProducto),
    validarCampos
  ],
  productos.update
);

router.delete(
  "/:id",
  [
    validarJWT,
    check("id", "No es un Id de Mongo").isMongoId(),
    check("id").custom(existeIdProducto),
    validarCampos
  ],
  productos.destroy
);

module.exports = router;
