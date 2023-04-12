const { request, response } = require("express");
const admin = require("firebase-admin");

const validarJWTFirebase = async (req = request, res = response, next) => {
  const token = req.header("x-token");
  if (!token) {
    return res.status(401).json({ message: "No hay token en la petición" });
  }
  admin.auth().verifyIdToken(token).then((decodedToken) => {
    req.uid = decodedToken.uid;
    next()
  }).catch(error => {
    res.status(401).json({ message: error.message });
    console.log(error.message);
  })
};

module.exports = { validarJWTFirebase };
