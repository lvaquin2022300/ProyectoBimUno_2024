const { response, json } = require('express');
const Factura = require('../models/factura');
const FacturaHasProductos = require('../models/facturaHasProductos');
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const facturasGet = async (req, res = response) => {
    const { limite, desde } = req.query;
    const query = { estado: true };

    try {
        const [total, facturas] = await Promise.all([
            Factura.countDocuments(query),
            Factura.find(query)
                .skip(Number(desde))
                .limit(Number(limite))
        ]);
        const facturasConProductos = await Promise.all(facturas.map(async factura => {
            const productos = await FacturaHasProductos.find({ factura: factura._id }).select('producto');
            return {
                ...factura.toObject(),
                productos: productos.length > 0 ? productos.map(p => p.producto) : "sin productos aún"
            };
        }));

        res.status(200).json({
            total,
            facturas: facturasConProductos
        });
    } catch (error) {
        res.status(500).json({
            msg: 'Error al obtener las facturas'
        });
    }
};


const facturasGetByCliente = async (req, res = response) => {
    const { limite, desde } = req.query;
    const { cliente } = req.body;
    const query = { estado: true, Cliente: cliente };

    const clientes = await Usuario.findOne({ correo: cliente });
    if (!clientes) {
        return res.status(400).json({
            msg: 'el cliente asignado no existe'
        })
    }
    if (clientes.estado === false) {
        return res.status(400).json({
            msg: 'el cliente asignado se encuentra deshabilitado'
        })
    }

    const [total, facturas] = await Promise.all([
        Factura.countDocuments(query),
        Factura.find(query)
            .skip(Number(desde))
            .limit(Number(limite))
    ]);

    res.status(200).json({
        total,
        facturas
    });
}

const productoFacturaPost = async (req, res) => {
    const { cliente, producto } = req.body;

    const Clientes = await Usuario.findOne({ correo: cliente });

    if (!Clientes) {
        return res.status(400).json({
            msg: 'el cliente no existe'
        })
    }
    if (Clientes.estado === false) {
        return res.status(400).json({
            msg: 'el cliente asignado se encuentra deshabilitado'
        })
    }

    const Productos = await Producto.findOne({ nombre: producto });
    if (!Productos) {
        return res.status(400).json({
            msg: 'el producto no existe, por favor escoge otro producto o finaliza tu compra'
        })
    }
    if (Productos.estado === false) {
        return res.status(400).json({
            msg: 'el producto asignado se encuentra deshabilitado, por favor escoge otro producto o finaliza tu compra'
        })
    }
    if (Productos.stock === 0) {
        return res.status(400).json({
            msg: 'el producto asignado se encuentra agotado, por favor escoge otro producto o finaliza tu compra'
        })
    }

    const idProducto = Productos._id;
    const x = Productos.stock - 1;
    await Producto.findByIdAndUpdate(idProducto, {stock: x});

    let Facturas = await Factura.findOne({ Cliente: cliente, en_compra: true });

    if (!Facturas) {
        const factura = new Factura({ Cliente: cliente });
        Facturas = await factura.save();
    }

    const facturaId = Facturas._id;

    const facturaHasProductos = new FacturaHasProductos({ factura: facturaId, producto });

    await facturaHasProductos.save();

    const query = { estado: true, factura: facturaId };
    const { limite, desde } = req.query;

    const totalPromise = FacturaHasProductos.countDocuments(query);
    const productosPromise = FacturaHasProductos.find(query)
        .skip(Number(desde))
        .limit(Number(limite))
        .select('producto');

    try {
        const [total, productos] = await Promise.all([totalPromise, productosPromise]);
        res.status(200).json({
            msg: 'id factura: ' + facturaId,
            finalizar_compra: 'Cuando desees completar tu compra ve a finalizar compra y envia el id de la factura',
            total,
            productos: productos.map(p => p.producto)
        });
    } catch (error) {
        return res.status(500).json({ msg: 'Error al obtener los productos de la factura' });
    }
}


const facturasPost = async (req, res) => {
    const { cliente } = req.body;

    const clientes = await Usuario.findOne({ correo: cliente });
    if (!clientes) {
        return res.status(400).json({
            msg: 'el cliente asignado no existe'
        })
    }
    if (clientes.estado === false) {
        return res.status(400).json({
            msg: 'el cliente asignado se encuentra deshabilitado'
        })
    }
    const Cliente = clientes.correo;

    let Facturas = await Factura.findOne({ Cliente: Cliente, en_compra: true });

    if(Facturas){
        const id = Facturas._id;
        await Factura.findByIdAndUpdate(id, { en_compra: false });
    }

    const factura = new Factura({ Cliente });

    await factura.save();
    res.status(200).json({
        factura
    });
}

const finalizarCompra = async (req, res) => {
    const { id_factura } = req.body;
    const id = id_factura;

    let Facturas = await Factura.findOne({ _id: id });
    if (!Facturas) {
        return res.status(400).json({
            msg: 'la compra a finalizar no existe'
        })
    }
    if (Facturas.estado === false) {
        return res.status(400).json({
            msg: 'la factura a finalizar fue eliminada'
        })
    }
    if (Facturas.en_compra === false) {
        return res.status(400).json({
            msg: 'la compra a finalizar ya fué finalizada'
        })
    }
    
    try {
        const factura = await Factura.findByIdAndUpdate(id, { en_compra: false });
        const productosAdquiridos = await FacturaHasProductos.find({ factura: id }).select('producto');

        res.status(200).json({
            msg: 'compra finalizada',
            factura,
            productosAdquiridos: productosAdquiridos.map(p => p.producto)
        });
    } catch (error) {
        res.status(500).json({
            msg: 'Error al finalizar la compra'
        });
    }
};

const facturasDelete = async (req, res) => {
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
            msg: 'Un cliente no puede eliminar facturas'
        });
    }

    const facturas = await Factura.findByIdAndUpdate(id, { estado: false });

    res.status(200).json({
        msg_1: 'Factura eliminada',
        msg_3: facturas
    });
}

module.exports = {
    facturasGet,
    facturasPost,
    facturasGetByCliente,
    productoFacturaPost,
    finalizarCompra,
    facturasDelete
}
