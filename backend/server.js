require('dotenv').config();
const express  = require ('express');
const nodemailer = require('nodemailer');
const cors = require('cors');



// crear la aplicación de express
const app = express();

//Definimos el puerto del servidor
const PORT = 3000;
// Agregamos el middleware de cors
app.use(cors({
    origin: 'http://127.0.0.1:5500'
}));

// Middleware para interpretar los cuerpos en formato JSON
app.use(express.json());


// Configurar el transporte de correo con Gmail
// createTransport crea el objeto de conexión al servidor de correo
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD

    }

});

app.get('/', (req, res) => {
    res.send('Servidor de correo funcionando correctamente');
});



//verificando que nodemailer pueda conectarse con el servidor SMTP
transporter.verify()
    .then(()=>{
        console.log('Conexión con Gmail establecida correctamente');
    })
    .catch((error)=>{
        console.error('Error al conectar con Gmail: ', error.message);
    });

// RUTA POST PARA PROBAR LA RECEPCIÓN DE LOS DATOS
app.post('/api/prueba', (req,res) => {
    const { email, asunto, mensaje} = req.body;
    //Validar que los campos estén presentes
    // Eliminar espacios al inicio y al final
    // y que el tipo de dato sea string
    if(typeof email !== 'string' || typeof asunto !== 'string' || typeof mensaje !== 'string'){
        return res.status(400).json({
            ok: true,
            message: 'Los campos deben contener texto válido'
        });
    }
    const emailLimpio = email.trim();
    const asuntoLimpio = asunto.trim();
    const mensajeLimpio = mensaje.trim();

    if(!emailLimpio || !asuntoLimpio || !mensajeLimpio){
        return res.status(400).json({
            ok:false,
            message: 'Todos los campos son obligatorios'
        });
    }
    // Validar el formato del correo
    const regex =  /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;
    if(!regex.test(emailLimpio)){
        return res.status(400).json({
            ok: false,
            message: 'El formato del correo electrónico no es válido'
        });
    }
    //responder si los datos son correctos

    res.json({
        ok: true,
        message: 'Datos recibidos y validados correctamente',
        datos: {
            email: emailLimpio,
            asunto: asuntoLimpio,
            mensaje: mensajeLimpio
        }

    });
});

// RUTA POST PARA ENVIAR CORREOS REALES
app.post('/api/email', async (req,res) => {
    const {email, asunto,mensaje } = req.body;
    //Validar que los campos estén presentes
    // Eliminar espacios al inicio y al final
    // y que el tipo de dato sea string
    if(typeof email !== 'string' || typeof asunto !== 'string' || typeof mensaje !== 'string'){
        return res.status(400).json({
            ok: true,
            message: 'Los campos deben contener texto válido'
        });
    }
    const emailLimpio = email.trim();
    const asuntoLimpio = asunto.trim();
    const mensajeLimpio = mensaje.trim();

    // validar los campos obligatorios
    if(!emailLimpio || !asuntoLimpio || !mensajeLimpio){
        return res.status(400).json({
            ok:false,
            message: 'Todos los campos son obligatorios'
        });
    }

    // Validar el formato del correo
    const regex =  /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;
    if(!regex.test(emailLimpio)){
        return res.status(400).json({
            ok: false,
            message: 'El formato del correo electrónico no es válido'
        });
    }

    try {
        // preparar y enviar el correo
        // sendMail es la instrucción que pide Nodemailer enviar un correo
        await transporter.sendMail({
            from: `"Formulario de Contacto" <${process.env.SMTP_USER}>`,
            to: emailLimpio,
            subject: asuntoLimpio,
            text: mensajeLimpio
        });
        // Responder cuando el envío haya sido capturado
        return res.status(200).json({
            ok:true,
            message: 'Correo enviado correctamente'
        });
        
    } catch (error) {
        console.error('Error al enviar el correo:', error.message);
        return res.status(500).json({
            ok:false,
            message: 'No se pudo enviar el correo'
        });
        
    }
});
//Inicializar el servidor 
app.listen(PORT, () => {
    console.log(`Aplicación corriendo en http://localhost:${PORT}`);
});