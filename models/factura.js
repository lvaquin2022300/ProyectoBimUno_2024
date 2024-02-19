const { Schema, model} = require('mongoose');

const FacturaSchema = Schema ({
    Cliente: {
        type: String,
        required: [true, 'Cliente obligatorio']
    },
    fecha_emisión:{
        type: Date,
        default: Date.now()
    },
    en_compra:{
        type: Boolean,
        default: true
    },
    estado:{
        type: Boolean,
        default: true
    }
});

FacturaSchema.methods.toJSON = function(){
    const { __v, _id, ...factura} = this.toObject();
    factura.fid = _id;
    return factura;
}

module.exports = model('Factura', FacturaSchema);