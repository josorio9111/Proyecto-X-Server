const router = require("express").Router();
const busqueda = require("../controllers/buscar");

router.get("/:coleccion/:termino", busqueda.buscar);

module.exports = router;
