const { response, json } = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const Usuario = require('../models/usuario');
const { generarJWT } = require("../helpers/generar-jwt");

const usuariosGet = async (req, res = response) => {
    const { limite, desde } = req.query;
    const query = { estado: true };

    const [total, usuarios] = await Promise.all([
        Usuario.countDocuments(query),
        Usuario.find(query)
            .skip(Number(desde))
            .limit(Number(limite))
    ]);

    res.status(200).json({
        total,
        usuarios
    });
}

const getUsuarioByid = async (req, res) => {
    const { id } = req.params;
    const usuario = await Usuario.findOne({ _id: id });

    res.status(200).json({
        usuario
    });
}

const usuariosPut = async (req, res) => {
    const { id } = req.params;
    const { _id, password, google, correo, role, ...resto } = req.body;
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

    const usuario = await Usuario.findByIdAndUpdate(id, resto);

    res.status(200).json({
        msg: 'Usuario actualizado a admin',
    })
}

const usuariosPutRole = async (req, res) => {
    const { id } = req.params;
    const { _id, password, google, correo, nombre, ...resto } = req.body;
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
            msg: 'Un cliente no puede actualizar usuarios a admin'
        });
    }

    const usuario = await Usuario.findByIdAndUpdate(id, resto);

    res.status(200).json({
        msg: 'Usuario actualizado a admin',
        usuario
    })
}

const usuariosDelete = async (req, res) => {
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
            msg: 'Un cliente no puede eliminar usuarios'
        });
    }

    const usuario = await Usuario.findByIdAndUpdate(id, { estado: false });

    res.status(200).json({
        msg: 'Usuario eliminado'
    });
}

const usuariosPost = async (req, res) => {
    const { nombre, correo, password, role } = req.body;
    const usuario = new Usuario({ nombre, correo, password, role });

    const salt = bcryptjs.genSaltSync();
    usuario.password = bcryptjs.hashSync(password, salt);

    await usuario.save();
    res.status(200).json({
        usuario
    });
}

const usuariosClientPut = async (req, res) => {
    const { id } = req.params;
    const { _id, password, google, correo, role, ...resto } = req.body;
    const { cliente } = req.body;
    const token = req.header("x-token");

    if (!token) {
        return res.status(401).json({
            msg: "No hay token en el encabezado",
        });
    }

    const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
    const client = await Usuario.findById(uid);
    const usuario = await Usuario.findById(uid);
    if (!usuario) {
        return res.status(401).json({
            msg: "Usuario no existe en la base de datos",
        });
    }
    if (!usuario.estado) {
        return res.status(401).json({
            msg: "Token no válido - usuario con estado:false",
        });
    }

    if (client.correo !== cliente) {
        return res.status(400).json({
            msg: 'El correo asignado no coincide con el token proporcionado'
        })
    }
    if (client._id.toString() !== id) {
        return res.status(400).json({
            msg: 'El correo asignado no coincide con el usuario a editar'
        })
    }

    const usuarioso = await Usuario.findByIdAndUpdate(id, resto, { new: true });
    const nombre = usuarioso.nombre;

    res.status(200).json({
        msg: 'Tu usuario ha sido actualizado',
        nombre_nuevo: nombre
    });
}

const usuariosClientDelete = async (req, res) => {
    const { id } = req.params;
    const { cliente } = req.body;
    const token = req.header("x-token");

    if (!token) {
        return res.status(401).json({
            msg: "No hay token en el encabezado",
        });
    }

    const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
    const client = await Usuario.findById(uid);
    const usuario = await Usuario.findById(uid);
    if (!usuario) {
        return res.status(401).json({
            msg: "Usuario no existe en la base de datos",
        });
    }
    if (!usuario.estado) {
        return res.status(401).json({
            msg: "Token no válido - usuario con estado:false",
        });
    }

    if (client.correo !== cliente) {
        return res.status(400).json({
            msg: 'El correo asignado no coincide con el token proporcionado'
        })
    }
    if (client._id.toString() !== id) {
        return res.status(400).json({
            msg: 'El correo asignado no coincide con el usuario a eliminar'
        })
    }

    const usuarioso = await Usuario.findByIdAndUpdate(id, { estado: false });

    res.status(200).json({
        msg: 'Tu usuario ha sido eliminado',
        usuarioso
    });
}

const usuariosLogin = async (req, res) => {
    const { correo, password } = req.body;

    try {
        const usuario = await Usuario.findOne({ correo });

        if (!usuario) {
            return res.status(400).json({
                msg: 'Usuario no encontrado'
            });
        }

        if (!usuario.estado) {
            return res.status(400).json({
                msg: 'Usuario borrado de la base de datos'
            })
        }

        const passwordValido = bcryptjs.compareSync(password, usuario.password);

        if (!passwordValido) {
            return res.status(400).json({
                msg: 'Contraseña incorrecta'
            });
        }

        const token = await generarJWT(usuario.id)

        res.status(200).json({
            msg_1: 'Inicio de sesión exitoso',
            msg_2: 'Bienvenido ' + usuario.nombre,
            msg_3: 'Este su token =>' + token,
        });

    } catch (e) {
        console.log(e);
        res.status(500).json({
            msg: 'Error inesperado'
        })
    }

}


module.exports = {
    usuariosDelete,
    usuariosPost,
    usuariosGet,
    getUsuarioByid,
    usuariosPut,
    usuariosLogin,
    usuariosPutRole,
    usuariosClientDelete,
    usuariosClientPut
}