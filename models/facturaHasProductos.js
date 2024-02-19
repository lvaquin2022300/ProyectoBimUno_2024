const { Schema, model, Types } = require('mongoose');

const FacturaHasProductoSchema = Schema ({
    factura: {
        type: Types.ObjectId,
        ref: 'Factura',
        required: [true, 'Factura obligatoria']
    },
    producto: {
        type: String,
        required: [true, 'Producto obligatorio']
    },
    estado:{
        type: Boolean,
        default: true
    }
});

module.exports = model('FacturaHasProducto', FacturaHasProductoSchema);