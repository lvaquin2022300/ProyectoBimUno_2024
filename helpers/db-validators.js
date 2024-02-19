const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const Categoria = require('../models/categoria');
const Factura = require('../models/factura');

const existenteEmail = async (correo = '') => {
    const existeEmail = await Usuario.findOne({correo});
    if(existeEmail){
        throw new Error(`El email ${ correo } ya fue registrado`);
    }
}

const noExistenteEmail = async (correo = '') => {
    const existeEmail = await Usuario.findOne({correo});
    if(!existeEmail){
        throw new Error(`El email ${ correo } no existe`);
    }
}

const existeUsuarioById = async ( id = '') => {
    const existeUsuario = await Usuario.findOne({id});
    if(existeUsuario){
        throw new Error(`El usuario con el id: ${ id } no existe`);
    }
}

const existeFacturaById = async ( id = '') => {
    const existeFactura = await Factura.findOne({id});
    if(existeFactura){
        throw new Error(`La factura con el id: ${ id } no existe`);
    }
}

const existeProductoById = async ( id = '') => {
    const existeProduct = await Producto.findOne({id});
    if(existeProduct){
        throw new Error(`El producto con el id: ${ id } no existe`);
    }
}

const existeCategoriaById = async ( id = '') => {
    const existeCategoria = await Categoria.findOne({id});
    if(existeCategoria){
        throw new Error(`La categoria con el id: ${ id } no existe`);
    }
}

module.exports = {
    existenteEmail,
    existeUsuarioById,
    existeProductoById,
    noExistenteEmail,
    existeCategoriaById,
    existeFacturaById
}