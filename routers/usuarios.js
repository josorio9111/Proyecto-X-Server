const { check } = require("express-validator");
const router = require("express").Router();
const usuarios = require("../controllers/usuarios");

const { validarCampos, validarJWT, isAdminRole, tieneRole } = require("../middlewares");
const { esRoleValido, emailExiste, existeIdUsuario } = require("../helpers/db.validator");

// Create a new usuarios
router.post(
    "/",
    [
        check("nombre", "El nombre es obligatorio").notEmpty(),
        check("password", "El password debe tener 6 letras").isLength({ min: 6 }),
        check("email", "El correo no es válido").isEmail(),
        check("email").custom(emailExiste),
        check("role").custom(esRoleValido),   //Poner USER_ROLE por defecto y mandar en el body
        validarCampos
    ],
    usuarios.create
);

// Retorna todos los usuarios
router.get("/", usuarios.findAll);

// Retorna un usuario mediante el id
router.get(
    "/:id",
    [
        check("id", "No es un Id de Mongo").isMongoId(),
        check("id").custom(existeIdUsuario),
        validarCampos,
    ],
    usuarios.findOne
);

// // Update a usuarios with id
router.put(
    "/:id",
    [
        validarJWT,
        check("id", "No es un Id de Mongo").isMongoId(),
        check("id").custom(existeIdUsuario),
        validarCampos,
    ],
    usuarios.update
);

// Delete a usuarios with id
router.delete(
    "/:id",
    [
        validarJWT,
        isAdminRole,
        // tieneRole("ADMIN_ROLE", "VENTAS_ROLE"),
        check("id", "No es un Id de Mongo").isMongoId(),
        check("id").custom(existeIdUsuario),
        validarCampos,
    ],
    usuarios.destroy
);

router.get("/forgot/:email", [
    check("email", "El correo no es válido").isEmail(),
    validarCampos
], usuarios.forgot_password);

module.exports = router;
