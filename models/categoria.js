const { Schema, model} = require('mongoose');

const CategoriaSchema = Schema ({
    nombre: {
        type: String,
        required: [true, 'Nombre obligatorio']
    },
    estado:{
        type: Boolean,
        default: true
    }
});

CategoriaSchema.methods.toJSON = function(){
    const { __v, _id, ...categoria} = this.toObject();
    categoria.cid = _id;
    return categoria;
}

module.exports = model('Categoria', CategoriaSchema);