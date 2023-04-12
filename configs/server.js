const express = require("express");
const cookieParser = require("cookie-parser");
const createError = require("http-errors");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const { dbConnectt } = require("../database/db.connect");
const logger = require('morgan')
const admin = require("firebase-admin");
const { validarJWTFirebase } = require("../middlewares");

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT;
    this.server = require('http').createServer(this.app);
    // this.io = require('socket.io')(this.server);
    this.path = {
      buscar: "/api/buscar",
      uploads: "/api/uploads",
      categoriaPath: "/api/categorias",
      productoPath: "/api/productos",
    };

    //Database
    this.database();

    // Init Firebase Admin
    this.initFirebaseAdmin()

    // Middlewares
    this.middlewares();

    // Rutas
    this.routers();

    // handle Error
    this.handeError();
  }

  middlewares() {
    // CORS
    this.app.use(cors());
    // HTTP Interceptor
    this.app.use(logger("tiny")); //Quite morgan
    // Parser body to json
    this.app.use(express.json());
    // Peticiones con URlEncoded
    this.app.use(express.urlencoded({ extended: true }));
    // Cookie
    this.app.use(cookieParser());
    // FileUpload - Carga de archivos
    this.app.use(
      fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
        createParentPath: true
      })
    );
  }

  routers() {
    // api/uploads
    this.app.use(this.path.uploads, require("../routers/uploads"));
    // Lo puse de segundo para que la ruta de arriba no valide el midddleware
    this.app.all('*', validarJWTFirebase)
    // api/categorias
    this.app.use(this.path.categoriaPath, require("../routers/categorias"));
    // api/productos
    this.app.use(this.path.productoPath, require("../routers/productos"));
    // api/buscar
    this.app.use(this.path.buscar, require("../routers/buscar"));
    
  }

  async database() {
    await dbConnectt();
  }

  async initFirebaseAdmin() {
   await admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
      })
    })
  }

  sockets() {
    this.io.on('connection', client => socketControllers(client, this.io));
  }

  handeError() {
    // catch 404 and forward to error handler
    this.app.use(function (req, res, next) {
      next(createError(404));
    });
    // error handler
    this.app.use(function (err, req, res, next) {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get("env") === "development" ? err : {};

      res.status(err.status || 500);
      res.json({ error: err.status || 500, url: req.url });
    });
  }

  listen() {
    this.server.listen(this.port, () => {
      console.log("Example app listening on port: ", this.port);
    });
  }
}

module.exports = Server;
