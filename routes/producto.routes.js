const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middlewares/validar-jwt');

const { validarCampos } = require('../middlewares/validar-campos');
const { existeProductoById } = require('../helpers/db-validators');

const { productoPost, productosGet, getProductoByid, productosPut, productosDeshabilitadosGet, productosDelete, productosAgotadosGet, productosNombreGet, getProductoByCategoria, productosMasVendidos } = require('../controllers/producto.controller');

const router = Router();

router.get("/", productosGet);

router.get(
    "/:id",
    [
        check("id", "El id no es un formato válido de MongoDB").isMongoId(),
        check("id").custom(existeProductoById),
        validarCampos
    ], getProductoByid);

router.put(
    "/:id",
    [
        validarJWT,
        check("id", "El id no es un formato válido de MongoDB").isMongoId(),
        check("id").custom(existeProductoById),
        validarCampos
    ], productosPut);

router.delete(
    "/:id",
    [
        validarJWT,
        check("id_factura", "El id no es un formato válido de MongoDB").isMongoId(),
        validarCampos
    ], productosDelete);


router.post(
    "/",
    [
        validarJWT,
        check("nombre", "El nombre es obligatorio").not().isEmpty(),
        check("categoria", "La categoria es obligatoria").not().isEmpty(),
        check("stock", "El stock debe ser un número").isNumeric(),
        validarCampos,
    ], productoPost);

router.post(
    "/nombre", productosNombreGet);

router.post(
    "/agotado",
    [
        validarJWT,
        validarCampos
    ], productosAgotadosGet);

router.post(
    "/categoria",
    [
        validarCampos
    ], getProductoByCategoria);

router.post(
    "/deshabilitados",
    [
        validarJWT,
        validarCampos
    ], productosDeshabilitadosGet);

router.post(
    "/masVendidos", productosMasVendidos);

module.exports = router;
