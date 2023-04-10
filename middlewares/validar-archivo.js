const { response } = require("express");

exports.validarArchivo = (req , res = response, next) => {
  if (!req.files || Object.keys(req.files).length === 0 || !req.files.archivo) {
    res.status(400).json({ message: "No hay archivo para subir" });
    return;
  }
  next();
};
