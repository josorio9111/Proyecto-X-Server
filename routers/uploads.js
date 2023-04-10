const router = require("express").Router();
const { check } = require("express-validator");
const upload = require("../controllers/uploads");
const { coleccionesPermitidas } = require("../helpers");
const { validarCampos, validarArchivo, validarJWT } = require("../middlewares");

// router.put(
//   "/:coleccion/:id",
//   [
//     validarJWT,
//     check("id", "No es un Id de Mongo").isMongoId(),
//     check("coleccion").custom((c) => coleccionesPermitidas(c, ["usuarios", "productos"])),
//     validarArchivo,
//     validarCampos,
//   ],
//   upload.actualizarImagen
//   // upload.actualizarImagenCloudinary
// );

router.get(
  "/:coleccion/:id",
  [
    check("id", "No es un Id de Mongo").isMongoId(),
    check("coleccion").custom((c) => coleccionesPermitidas(c, ["usuarios", "productos"])),
    validarCampos,
  ],
  upload.mostrarImagen
);

module.exports = router;
