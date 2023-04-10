const { response, request } = require("express");
const bcrypt = require("bcryptjs");
const models = require("../models");
const { tienePermisosUsuario } = require("../helpers");

const Usuarios = models.usuarios;
const Roles = models.roles;

exports.create = async (req = request, res = response) => {
  const { nombre, email, password, role } = req.body;
  const usuario = new Usuarios({ nombre, email, password, role });

  // Encriptar password
  const salt = bcrypt.genSaltSync();
  usuario.password = bcrypt.hashSync(password, salt);
  try {
    const data = await usuario.save();
    res.status(201).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.findAll = async (req = request, res = response) => {
  const { limite = 5, desde = 0, q = "" } = req.query;
  const condition = {
    estado: true,
    nombre: { $regex: new RegExp(q), $options: "i" },
  };

  try {
    const [total, usuarios] = await Promise.all([
      Usuarios.countDocuments({ estado: true }),
      Usuarios.find(condition).skip(Number(desde)).limit(Number(limite)),
    ]);
    res.status(200).send({ total, usuarios });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.findOne = async (req = request, res = response) => {
  const id = req.params.id;
  try {
    const usuario = await Usuarios.findById(id);
    res.status(200).json(usuario);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req = request, res = response) => {
  const idParam = req.params.id;
  const { password, google, ...data } = req.body;
  // Pregunta si eres administrador o el usuario
  const permiso = await tienePermisosUsuario(idParam, req.usuario);
  if (!permiso) {
    return res.status(500).json({ menssage: 'No tiene permisos para realizar el cambio' });
  }
  // Si viene el password lo actulizo y lo encripto
  if (password) {
    const salt = bcrypt.genSaltSync();
    data.password = bcrypt.hashSync(password, salt);
  }
  // Si viene el role lo actulizo o sino lo dejo igual
  // if (data.role) {
  //   const existeRol = await Roles.findOne({ role: data.role });
  //   if (!existeRol) {
  //     return res.status(401).json({
  //       message: `No existe un rol con ese nombre: ${data.role}`
  //     });
  //   }
  // }
  
  // Si viene la imagen lo actulizo o sino lo dejo igual
  if (req.files.archivo) {
    const usua = await Usuarios.findById(idParam);
    //Limpiar imagenes de las colecciones
    if (usua.img) {
      const pathImg = path.join(__dirname, "../uploads/", 'usuarios', usua.img);
      if (fs.existsSync(pathImg)) {
        fs.unlinkSync(pathImg);
      }
    }
  }
  
  // Si viene un email lo actulizo o sino lo dejo igual
  if (data.email) {
    const existeEmail = await Roles.findOne({ email: data.email });
    if (!existeEmail) {
      return res.status(401).json({
        message: `No existe un email con ese nombre: ${data.email}`
      });
    }
  }

  try {
    const usuario = await Usuarios.findByIdAndUpdate(idParam, data, {
      new: true,
    });
    res.status(200).json(usuario);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.destroy = async (req = request, res = response) => {
  // findByIdAndDelete
  try {
    const idParam = req.params.id;
    const permiso = await tienePermisosProducto(idParam, req.usuario);
    if (!permiso) {
      return res.status(500).json({ menssage: 'No tiene permisos para realizar el cambio' });
    }
    const usuario = await Usuarios.findByIdAndUpdate(
      idParam,
      { estado: false },
      { new: true } // muestra el nuevo valor del usuario
    );
    res.status(200).json(usuario);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.forgot_password = async (req, res) => {
  const { email } = req.params;

  // const usuario = Usuarios.find({ estado: true, email });
  const usuario = await Usuarios.findOne({ estado: true, email });
  if (!usuario) {
    return res.status(400).json({ message: "Email no válido o usuario eliminado" })
  }
  // TODO: Mandar  correo con el link de cambiar password
  res.status(200).json({ usuario });
}

exports.forgot_password_link = async (req, res) => {
  const { id } = req.params;
  const { password, ...data } = req.body;

  // const usuario = Usuarios.find({ estado: true, email });
  const usuario = await Usuarios.findByIdAndUpdate(id, { password }, { new: true });
  if (!usuario) {
    return res.status(400).json({ message: "Email no válido o usuario eliminado" })
  }
  res.status(200).json({ usuario });
}
