const express = require('express');
const cors = require('cors');
const { dbConnection } = require('../db/config');

class Server{

    constructor(){
        this.app = express();
        this.port = process.env.PORT;
        this.usuariosPath = '/api/usuarios';
        this.productosPath = '/api/productos';
        this.categoriasPath = '/api/categorias';
        this.facturasPath = '/api/facturas';

        this.conectarDB();

        this.middlewares();

        this.routes();
    }

    async conectarDB(){
        await dbConnection();
    }

    middlewares(){
        this.app.use(express.static('public'));
        this.app.use(cors());
        this.app.use(express.json());
    }

    routes(){
        this.app.use(this.usuariosPath, require('../routes/user.routes'));
        this.app.use(this.productosPath, require('../routes/producto.routes'));
        this.app.use(this.categoriasPath, require('../routes/categoria.routes'));
        this.app.use(this.facturasPath, require('../routes/facturas.routes'));
    }

    listen(){
        this.app.listen(this.port, () => {
            console.log('Servidor ejecutado y escuchando en el puerto', this.port);
        });
    }
}


module.exports = Server;
