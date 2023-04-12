const path = require("path");
const fs = require("fs");
const { response } = require("express");
const models = require("../models");
const { subirArchivo, tienePermisosProducto } = require("../helpers");
const Productos = models.productos;
const Categorias = models.categorias;

exports.create_foto = async (req, res = response) => {
  const { usuario, estado, disponible, ...data } = req.body;
  data.usuario = req.uid;
  data.nombre = data.nombre.toLowerCase();
  const productoDB = await Productos.findOne({ nombre: data.nombre });
  if (productoDB) {
    return res.status(400).json({
      message: `El producto ${productoDB.nombre} ya existe`
    });
  }
  try {
    const pathArchivo = await subirArchivo(req.files, undefined, "productos");
    data.img = pathArchivo;
    const producto = new Productos(data);
    await producto.save();
    res.status(201).json(producto);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

exports.findAll = async (req, res = response) => {
  const { limite = 5, desde = 0, q = "" } = req.query;
  const condition = {
    estado: true,
    nombre: { $regex: new RegExp(q), $options: "i" },
  };
  try {
    const [total, productos] = await Promise.all([
      Productos.countDocuments({ estado: true }),
      Productos.find(condition)
        .populate("usuario", "nombre")
        .populate("categoria", "nombre")
        .skip(Number(desde))
        .limit(Number(limite)),
    ]);
    res.status(200).send({ total, productos });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

exports.findOne = async (req = request, res = response) => {
  const { id } = req.params;
  try {
    const categoriaDB = await Productos.find({ id, estado: true })
      .populate("usuario", "nombre")
      .populate("categoria", "nombre");
    res.status(200).json(categoriaDB);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req = request, res = response) => {
  const { estado, usuario, ...data } = req.body;
  const { id } = req.params;
  data.usuario = req.uid;

  const permiso = await tienePermisosProducto(id, req.uid);
  if (!permiso) {
    return res.status(500).json({ menssage: 'No tiene permisos para realizar el cambio' });
  }
  // Si viene lo actualizo o sino lo dejo igual
  if (data.nombre) {
    data.nombre = data.nombre.toLowerCase();
  }
  // Si viene lo actualizo o sino lo dejo igual
  if (data.categoria) {
    const categoria = await Categorias.findById(data.categoria);
    if (!categoria) {
      return res.status(401).json({
        message: `No existe una categoria con el id: ${data.categoria}`,
      });
    }
  }
  // Si viene la foto la actulizo
  if (req.files.archivo) {
    const producto = await Productos.findById(id);
    //Limpiar imagenes de las colecciones
    if (producto.img) {
      const pathImg = path.join(__dirname, "../uploads/", 'productos', producto.img);
      if (fs.existsSync(pathImg)) {
        fs.unlinkSync(pathImg);
      }
    }
    // Subir nueva foto
    const pathArchivo = await subirArchivo(req.files, undefined, "productos");
    data.img = pathArchivo;
  }
  try {
    const producto = await Productos.findByIdAndUpdate(id, data, {
      new: true,
    })
      .populate("usuario", "nombre")
      .populate("categoria", "nombre");
    res.status(200).json(producto);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

exports.destroy = async (req = request, res = response) => {
  const { id } = req.params;
  const permiso = await tienePermisosProducto(id, req.uid);
  if (!permiso) {
    return res.status(500).json({ menssage: 'No tiene permisos para realizar el cambio' });
  }
  try {
    const producto = await Productos.findByIdAndUpdate(
      id,
      { estado: false },
      { new: true }
    )
      .populate("usuario", "nombre")
      .populate("categoria", "nombre");
    // TODO: Eliminar archivo de la foto del producto, solo se le cambia el estado cuando se elimina
    if (producto.img) {
      const pathImg = path.join(__dirname, "../uploads/", 'productos', producto.img);
      if (fs.existsSync(pathImg)) {
        fs.unlinkSync(pathImg);
      }
    }
    res.status(200).json(producto);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};
