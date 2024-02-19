const { Schema, model} = require('mongoose');

const UsuarioSchema = Schema ({
    nombre: {
        type: String,
        required: [true, 'Nombre obligatorio']
    },
    correo: {
        type: String,
        required: [true, 'Correo obligatorio']
    },
    password: {
        type: String,
        required: [true, 'Password obligatorio']
    },
    img:{
        type: String
    },
    role:{
        type: String,
        required: true,
        enum: ["CLIENT_ROLE", "ADMIN_ROLE"],
        default: "CLIENT_ROLE"
    },
    estado:{
        type: Boolean,
        default: true
    }
});

UsuarioSchema.methods.toJSON = function(){
    const { __v, password, _id, ...usuario} = this.toObject();
    usuario.uid = _id;
    return usuario;
}

module.exports = model('Usuario', UsuarioSchema);