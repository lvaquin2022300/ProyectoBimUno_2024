const { Router } = require('express');
const { check } = require('express-validator');
const { validarJWT } = require('../middlewares/validar-jwt');

const { validarCampos } = require('../middlewares/validar-campos');
const { existeCategoriaById } = require('../helpers/db-validators');

const { categoriasPost, categoriasGet, getCategoriaByid, categoriasPut, categoriasDelete } = require('../controllers/categoria.controller');

const router = Router();

router.get("/", categoriasGet);

router.get(
    "/:id",
    [
        check("id", "El id no es un formato válido de MongoDB").isMongoId(),
        check("id").custom(existeCategoriaById),
        validarCampos
    ], getCategoriaByid);

router.put(
    "/:id",
    [
        validarJWT,
        check("id", "El id no es un formato válido de MongoDB").isMongoId(),
        check("id").custom(existeCategoriaById),
        validarCampos
    ], categoriasPut);

router.delete(
    "/:id",
    [
        validarJWT,
        check("id", "El id no es un formato válido de MongoDB").isMongoId(),
        check("id").custom(existeCategoriaById),
        validarCampos
    ], categoriasDelete);


router.post(
    "/",
    [
        validarJWT,
        check("nombre", "El nombre es obligatorio").not().isEmpty(),
        validarCampos,
    ], categoriasPost);

module.exports = router;
