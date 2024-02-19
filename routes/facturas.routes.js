const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middlewares/validar-jwt');

const { noExistenteEmail, existeFacturaById } = require('../helpers/db-validators');
const { validarCampos } = require('../middlewares/validar-campos');
const { facturasGet, facturasPost, finalizarCompra, productoFacturaPost, facturasGetByCliente, facturasDelete } = require('../controllers/factura.controller');

const router = Router();

router.get("/", facturasGet);

router.post(
    "/",
    [
        check("cliente", "El cliente es obligatorio").not().isEmpty(),
        check("cliente", "El cliente debe ser un correo").isEmail(),
        check("cliente").custom(noExistenteEmail),

        validarCampos,
    ], facturasPost);

router.post(
    "/cliente",
    [
        check("cliente", "El cliente es obligatorio").not().isEmpty(),
        check("cliente", "El cliente debe ser un correo").isEmail(),
        check("cliente").custom(noExistenteEmail),
    ], facturasGetByCliente);

router.post(
    "/agregarProducto",
    [
        validarCampos,
    ], productoFacturaPost);

router.post(
    "/finalizarCompra",
    [
        check("id_factura", "El id no es un formato válido de MongoDB").isMongoId(),
        validarCampos,
    ], finalizarCompra);

router.delete(
    "/:id",
    [
        validarJWT,
        check("id", "El id no es un formato válido de MongoDB").isMongoId(),
        check("id").custom(existeFacturaById),
        validarCampos,
    ], facturasDelete);

module.exports = router;