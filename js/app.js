// Ejecutar cuando el HTML se halla descargado
document.addEventListener('DOMContentLoaded', function(){ 
    
    // creando objeto general
    const email = {
        email: '',
        asunto: '',
        mensaje: ''
    }
    

    //seleccionar los elementos de la interfaz(Inputs)
    const inputEmail = document.querySelector('#email');
    const inputAsunto = document.querySelector('#asunto');
    const inputMensaje = document.querySelector('#mensaje');
    const formulario = document.querySelector('#formulario');
    const btnSubmit = document.querySelector('#formulario button[type=submit]');
    const btnReset = document.querySelector('#formulario button[type=reset]');
    const spinner = document.querySelector('#spinner');
    
    //asignar eventos a los inputs seleccionados
    //blur sirve para validar cuando el usuario deja el input
    // con value accedemos lo que se escribe en el input
    inputEmail.addEventListener('input', validar);
    inputAsunto.addEventListener('input', validar);
    inputMensaje.addEventListener('input', validar);
    formulario.addEventListener('submit', enviarEmail);

    btnReset.addEventListener('click', function(event){
        event.preventDefault();

        resetFormulario();
    })

    //función para enviar el email
async function enviarEmail(event){
    event.preventDefault();
    //Mostrar el spinner mientras se procesa el envío
    spinner.classList.add('flex');
    spinner.classList.remove('hidden');


    // Enviar los datos al backend
    try{
        const respuesta = await fetch('http://localhost:3000/api/email',{
        //los headers indican el formato de los datos se utiliza content-type application/-json para decirle los datos que envió son en foRmatos JSON
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(email) // enviamos el contenido a nuestro objeto email
                // y para que que el cuerpo enviado sea compatible utilizamos JSON.stringify
                //convierte el objeto JavaScript en una cadena de texto JSON
            });
        // obtener la respuesta del servidor
        const resultado = await respuesta.json();

        // Comprobar si el envío fue exitoso
        // .ok indica el estado http está dentro del rango de éxito 200 al 299 la definimos en el backend
        if(!respuesta.ok || !resultado.ok){
            //indicamos a javaScript que mande un error con throw new Error
            throw new Error(
                resultado.message || 'No se pudo enviar el correo'
            );
        }
        // Crear una alerta de éxito
        const alertaExito = document.createElement('p');
        alertaExito.classList.add(
            'bg-green-500', 
            'text-white', 
            'p-3', 
            'text-center',
            'rounded-lg',
            'mt-10', 
            'font-bold', 
            'text-sm', 
            'uppercase'
            );
        // Utilizar el mensaje real del backend
        alertaExito.textContent = resultado.message;
        formulario.appendChild(alertaExito);
        //limpiamos el formulario
        resetFormulario();
        // Eliminar la alerta de éxito después de 3 segundos
        setTimeout(() => {
            alertaExito.remove();
                
        },3000);


    }catch(error){
         // creamos una alerta si ocurre un error
        const alertaError = document.createElement('p');
        alertaError.classList.add(
            'bg-red-600',
            'text-white',
            'p-3',
            'text-center',
            'rounded-lg',
            'mt-10', 
            'font-bold', 
            'text-sm', 
        );
        alertaError.textContent = 'Error de conexión con el servidor';
        formulario.appendChild(alertaError);
        // Eliminar la alerta de error después de 3 segundos
        setTimeout(() => {
            alertaError.remove();
                
        },3000);
        

    }finally {
        //ocultar el spinner, haya éxito o error
        spinner.classList.remove('flex');
        spinner.classList.add('hidden');
        
    }
}

    // crearla función validar
    function validar(event){
        //console.log(event.target.parentElement.nextElementSibling);
        if(event.target.value.trim() === ''){
            mostrarAlerta(`El campo ${event.target.id} es obligatorio`, event.target.parentElement);
            email[event.target.name] = '';
            comprobarEmail();
            return;

        }
        //llamamos la función de validar email
        if(event.target.id === 'email' && !validaEmail(event.target.value)){
            mostrarAlerta('El email no es válido', event.target.parentElement);
            email[event.target.name] = '';
            comprobarEmail();
            return;
        }
        limpiarAlerta(event.target.parentElement);

        //asignar los valores al objeto
        email[event.target.name] = event.target.value.trim().toLowerCase();
        
        // Comprobar el objeto email
        comprobarEmail();
        
    }

    //función para mostrar la alerta
    function mostrarAlerta(mensaje, referencia){
       limpiarAlerta(referencia);
        //generar alerta con HTML
        const error = document.createElement('p');
        error.textContent = mensaje;
        error.classList.add('bg-red-600', 'text-white', 'p-2', 'text-center');
        //inyectar el error al formulario
        referencia.appendChild(error);
    }


    //creando función para limpiar la alerta
    function limpiarAlerta(referencia){
         // Comprobamos si ya existe una alerta
        const alerta = referencia.querySelector('.bg-red-600');
        if(alerta){
            alerta.remove();
        }
    }

    //función para validar un email válido
    function validaEmail(email){
        const regex =  /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;
        const resultado = regex.test(email);
        return resultado;
    }

    //función para comprobar el objeto email
    function comprobarEmail(){
        if(Object.values(email).includes('')){
            btnSubmit.classList.add('opacity-50');
            btnSubmit.disabled = true;
            return;   

        }
        btnSubmit.classList.remove('opacity-50');
        btnSubmit.disabled = false;
        
    }

    //función para reset el formulario
    function resetFormulario(){
        // reiniciar el objeto
        email.email = '';
        email.asunto = '';
        email.mensaje = '';

        formulario.reset();
        comprobarEmail();
    }

});