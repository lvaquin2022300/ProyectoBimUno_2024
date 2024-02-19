const { Int32 } = require('bson');
const { Schema, model} = require('mongoose');

const ProductoSchema = Schema ({
    nombre: {
        type: String,
        required: [true, 'Nombre obligatorio']
    },
    categoria: {
        type: String,
        required: [true, 'Categoria obligatoria']
    },
    stock: {
        type: Number
    },
    estado:{
        type: Boolean,
        default: true
    }
});

ProductoSchema.methods.toJSON = function(){
    const { __v, _id, ...producto} = this.toObject();
    producto.pid = _id;
    return producto;
}

module.exports = model('Producto', ProductoSchema);