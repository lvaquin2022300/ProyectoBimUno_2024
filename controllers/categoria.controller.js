const { response, json } = require('express');
const Categoria = require('../models/categoria');
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const categoriasGet = async (req, res = response) => {
    const { limite, desde } = req.query;
    const query = { estado: true };

    const [total, categorias] = await Promise.all([
        Categoria.countDocuments(query),
        Categoria.find(query)
            .skip(Number(desde))
            .limit(Number(limite))
    ]);

    res.status(200).json({
        total,
        categorias
    });
}

const getCategoriaByid = async (req, res) => {
    const { id } = req.params;
    const categorias = await Categoria.findOne({ _id: id });

    res.status(200).json({
        categorias
    });
}

const categoriasPut = async (req, res) => {
    const { id } = req.params;
    const { _id, ...resto } = req.body;
    const { admin } = req.body;
    const token = req.header("x-token");

    if (!token) {
        return res.status(401).json({
          msg: "No hay token en el encabezado",
        });
    }

    const Admin = await Usuario.findOne({ correo: admin });
    if (!Admin) {
        return res.status(400).json({
            msg: 'el admin asignado no existe'
        })
    }

    if (Admin.role !== "ADMIN_ROLE") {
        return res.status(400).json({
            msg: 'Un cliente no puede editar categorias'
        });
    }

    const categorias = await Categoria.findByIdAndUpdate(id, resto);

    res.status(200).json({
        msg: 'Categoria actualizada',
        categorias
    })
}

const categoriasDelete = async (req, res) => {
    const { id } = req.params;
    const { admin } = req.body;
    const token = req.header("x-token");

    if (!token) {
        return res.status(401).json({
          msg: "No hay token en el encabezado",
        });
    }

    const Admin = await Usuario.findOne({ correo: admin });
    if (!Admin) {
        return res.status(400).json({
            msg: 'el admin asignado no existe'
        })
    }

    if (Admin.role !== "ADMIN_ROLE") {
        return res.status(400).json({
            msg: 'Un cliente no puede eliminar categorias'
        });
    }

    const categorias = await Categoria.findByIdAndUpdate(id, { estado: false });

    await Producto.updateMany({ categoria: categorias.nombre }, { categoria: 'default' });

    const nombreCat = categorias.nombre;

    res.status(200).json({
        msg_1: 'Categoria eliminada',
        msg_2: 'los productos de la categoria ' + nombreCat + ' han sido puestos en una categoria default',
        msg_3: categorias
    });
}

const categoriasPost = async (req, res) => {
    const { nombre, admin } = req.body;
    const token = req.header("x-token");

    if (!token) {
        return res.status(401).json({
          msg: "No hay token en el encabezado",
        });
    }

    const Admin = await Usuario.findOne({ correo: admin });
    if (!Admin) {
        return res.status(400).json({
            msg: 'el admin asignado no existe'
        })
    }

    if(Admin.estado === false){
        return res.status(400).json({
            msg: 'el admin asignado se encuentra deshabilitado'
        })
    }

    if (Admin.role !== "ADMIN_ROLE") {
        return res.status(400).json({
            msg: 'Un cliente no puede crear categorias'
        });
    }

    const categorias = new Categoria({ nombre });

    await categorias.save();
    res.status(200).json({
        categorias
    });
}


module.exports = {
    categoriasDelete,
    categoriasPost,
    categoriasGet,
    getCategoriaByid,
    categoriasPut
}