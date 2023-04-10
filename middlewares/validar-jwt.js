const { request, response } = require("express");
const jsonwebtoken = require("jsonwebtoken");
const Usuarios = require("../models").usuarios;
const admin = require("firebase-admin");

const validarJWT = async (req = request, res = response, next) => {
  const token = req.header("x-token");
  if (!token) {
    return res.status(401).json({ message: "No hay token en la petición" });
  }
  try {
    const { id } = jsonwebtoken.verify(token, process.env.JWTKey);
    const usuario = await Usuarios.findById(id);
    //Verificar usuario
    if (!usuario) {
      return res.status(401).json({ message: "El usuario no existe en la basedatos" });
    }
    // Verificar el Estado
    if (!usuario.estado) {
      return res.status(401).json({ message: "El usuario fue eliminado" });
    }
    req.usuario = usuario;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "El token no es válido" });
  }
};


const validarJWTFirebase = async (req = request, res = response, next) => {
  const token = req.header("x-token");
  if (!token) {
    return res.status(401).json({ message: "No hay token en la petición" });
  }
  try {
    admin.auth().verifyIdToken(token).then((decodedToken) => {
      req.uid = decodedToken.uid;
      next()
    })
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "El token no es válido" });
  }
};

module.exports = { validarJWT, validarJWTFirebase };
