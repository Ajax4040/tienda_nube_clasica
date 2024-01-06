cargarProductos();

crearFooter();

//-------------------------------------------------------------------------
//Funcion para el menu desplegable
const menu = document.getElementById('sideMenu');
const menuIcon = document.querySelector('.fas.fa-bars');
const menuLinks = menu.querySelectorAll('a');

menuIcon.addEventListener('click', function() {
    menu.classList.toggle('open');
});

menuLinks.forEach(link => {
    link.addEventListener('click', function() {
        menu.classList.remove('open');
    });
});

// Posiciones de inicio y fin del deslizamiento
let startX = 0;
let endX = 0;

// Evento para detectar cuando el usuario comienza a tocar la pantalla
menu.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX; // Almacena la posición X inicial del toque
}, false);

// Evento para detectar cuando el usuario deja de tocar la pantalla
menu.addEventListener('touchend', function(e) {
    endX = e.changedTouches[0].clientX; // Almacena la posición X final del toque

    // Verifica si el deslizamiento fue hacia la izquierda y si el menú está abierto
    if (startX > endX && menu.classList.contains('open')) {
        menu.classList.remove('open'); // Cierra el menú
    }
}, false);

//-------------------------------------------------------------------------
//Funciones para el formulario de pedidos para la entrega al cliente

document.getElementById('confirmar-pedido').addEventListener('click', function(event) {
    console.log("1)A) Se dio click en el boton de confirmar pedido.");
    event.preventDefault(); // Previene el envío por defecto del formulario

    let carrito2 = obtenerDeLocalStorage('carrito2') || [];
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('telefono').value;
    const direccion = document.getElementById('direccion').value;
    const comentarios = document.getElementById('comentarios').value;
    
    let totalPedido = 0;
    console.log(carrito2);
    carrito2.forEach((producto) => totalPedido += Number(producto.subTotal));
    
    let pedido = validarDatosCliente(carrito2, nombre, email, telefono, direccion,comentarios);
    
    if (pedido) {
        pedidoConfirmado(carrito2, nombre, email, telefono, direccion,comentarios);
        console.log("Se envia mensaje por whatsapp.");

        let mensaje = `Hola! Mi nombre es ${nombre}. Estoy realizando un pedido:\n\n`;

        carrito2.forEach((producto, indice) => {
            mensaje += `*${indice + 1})* Descripción: ${producto.descripcion}, Cantidad: ${producto.cantidad}, Precio: $${producto.precio}, Codigo: ${producto.codigo}, *Subtotal: $${producto.subTotal}*\n`;
        });

        mensaje += `\n*Total del pedido: $${totalPedido.toFixed(2)}*\n\n`;

        mensaje += `\n*Información de contacto:*\n`;
        mensaje += `*Email:* ${email}\n`;
        mensaje += `*Teléfono:* ${telefono}\n`;
        mensaje += `*Dirección:* ${direccion}\n`;
        mensaje += `*Comentarios:* ${comentarios}`;

        window.open(`https://wa.me/5491144132895?text=${encodeURIComponent(mensaje)}`, '_blank');
    }
}); 
    
//-------------------------------------------------------------------------
// Carga los productos del carrito2 en el DOM en forma de tabla

function cargarProductos() {
    console.log("Se llama a la funcion de cargar productos al DOM");
    const tableBody = document.querySelector("tbody");
    let carrito2 = obtenerDeLocalStorage('carrito2') || [];

    if (carrito2.length > 0) {
        console.log("Hay productos en el carrito2. Se cargan en el DOM en filas los productos.");
        tableBody.innerHTML = "";
        carrito2.forEach((producto) => tableBody.innerHTML += retornarFilaHTML(producto));
        botonEliminarProductos();
        //Agregar el total del pedido en formato flotante
        let totalPedido = 0;
        carrito2.forEach((producto) => totalPedido += Number(producto.subTotal));
        tableBody.innerHTML += `<tr><td colspan="4" id="total">Total del pedido: $${totalPedido.toFixed(2)}</td></tr>`;

    } else {
        console.log("Se llamo a la funcion de cargar productos y no hay productos en el carrito2.");
        tableBody.innerHTML = "";
        tableBody.innerHTML = '<tr><td colspan="4">No hay productos en el pedido.</td></tr>';
    }
}

// Retorna una fila de la tabla en forma de HTML con los datos del producto
function retornarFilaHTML(producto) {
    return `<tr>
                <td>${producto.cantidad}</td>
                <td>${producto.codigo}</td>
                <td>${producto.descripcion}</td>
                <td>$${producto.subTotal}</td>
                <td><button id="${producto.codigo}" class="btnEliminarPedido">Eliminar</button></td>
            </tr>`;
}

// Agrega los eventos a los botones de eliminar productos
function botonEliminarProductos() {
    console.log("Se llama a la funcion de agregar eventos a los botones de eliminar productos.");
    const tableBody = document.querySelector("tbody");

    tableBody.addEventListener("click", (event) => {
        if (event.target.classList.contains("btnEliminarPedido")) {
            const idProducto = event.target.id;
            confirmarEliminacion(idProducto, eliminarProductoDelCarrito);
        }
    });
}

function eliminarProductoDelCarrito(idProducto) {
    let carrito2 = obtenerDeLocalStorage('carrito2') || [];
    const idx = carrito2.findIndex((producto) => producto.codigo === parseInt(idProducto));

    console.log("El producto con id " + idProducto + " se encuentra en la posición " + idx + " del carrito2.");
    if (idx !== -1) {
        carrito2.splice(idx, 1); // Elimina el producto del carrito2
        guardarEnLocalStorage('carrito2', carrito2); // Guarda el carrito2 encriptado en localStorage
        actualizarContadorCarrito(); // Actualiza el contador en localStorage y en la interfaz
        cargarProductos(); // Recarga la tabla para reflejar el producto eliminado
        mensajesAlUsuario('Producto eliminado', 'El producto se eliminó correctamente del pedido.', 'success');
    }
}

function actualizarContadorCarrito() {
    let cartCount = parseInt(localStorage.getItem('cartCount'));

    if(cartCount > 0) {
    // Decrementa el contador por uno. Evita valores negativos.
    cartCount = Math.max(0, cartCount - 1);
    localStorage.setItem('cartCount', cartCount);
    }else{
        localStorage.setItem('cartCount', 0);
    }
    
}

function mensajesAlUsuario(titulo,texto,icono){
    Swal.fire({
        title: titulo,
        text: texto,
        icon: icono
      });
}

function mensajePedidoExitoso(callback) {
    Swal.fire({
        title: "Pedido realizado!",
        text: "Tu pedido se realizó correctamente. Nos pondremos en contacto a la brevedad.",
        icon: "success",
        showCancelButton: false,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Aceptar"
    }).then((result) => {
        if (result.isConfirmed) {
            callback();
        }
    });
}

function confirmarEliminacion(idProducto, callback) {
    Swal.fire({
        title: "Desea eliminar el producto?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Aceptar"
    }).then((result) => {
        if (result.isConfirmed) {
            callback(idProducto);
        }
    });
}

function validarDatosCliente(carrito2, nombre, email, telefono, direccion, comentarios) {
    console.log("2)A) Se llama a la funcion de validar datos del cliente.");
    let regexEmail = /\S+@\S+\.\S+/;
    let regexTelefono = /^\d{10}$/;
    console.log({carrito2, nombre, email, telefono, direccion, comentarios});

    if (carrito2.length === 0) {
        mensajesAlUsuario('Error en el Pedido', 'No hay productos en el pedido.', 'error');
        return;
    }

    if (nombre.length === 0) {
        mensajesAlUsuario('Error en el Nombre', 'Por favor, ingrese su nombre.', 'error');
        return;
    }

    if (!regexEmail.test(email)) {
        mensajesAlUsuario('Error en el Email', 'Por favor, ingrese un email válido.', 'error');
        return;
    }

    if (!regexTelefono.test(telefono)) {
        mensajesAlUsuario('Error en el Teléfono', 'El teléfono debe tener 10 dígitos.', 'error');
        return;
    }

    if (direccion.length < 5) {
        mensajesAlUsuario('Error en la Dirección', 'Por favor, ingrese una dirección válida.', 'error');
        return;
    }
    
    return true;

}

function pedidoConfirmado(carrito2, nombre, email, telefono, direccion, comentarios) {
    // Si todas las validaciones pasan, podrías continuar con el proceso
    let datosCliente = {
        nombre: nombre,
        email: email,
        telefono: telefono,
        direccion: direccion,
        comentarios: comentarios
    };

    console.log({datosCliente});
    carrito2 = [];
    guardarEnLocalStorage('carrito2', carrito2); // Guarda el carrito2 vacio encriptado en localStorage
    localStorage.setItem('cartCount', 0); // Establece el contador a cero
    console.log("3)A) Se vacio el carrito2 y se llama a la funcion de cargar productos.");
    cargarProductos();
    confirmarPedidoAudio();
    borrarDatosFormulario();
    mensajePedidoExitoso(volverAlInicio);
}

function volverAlInicio() {
    console.log("Se llama a la funcion de volver al inicio.");
    window.location.href = "../index.html";
}

function confirmarPedidoAudio() {
    console.log("Se activa audio de confirmacion de pedido.");
    let audio = document.getElementById('sonidoConfirmacion');
    audio.volume = 0.3; // Volumen al 50%
    audio.play();
}

function borrarDatosFormulario() {
    console.log("Se borran los datos del formulario.");
    document.getElementById('nombre').value = "";
    document.getElementById('email').value = "";
    document.getElementById('telefono').value = "";
    document.getElementById('direccion').value = "";
    document.getElementById('comentarios').value = "";
}

function guardarEnLocalStorage(clave, valor) {
    const valorEncriptado = CryptoJS.AES.encrypt(JSON.stringify(valor), 'lalavanderia').toString();
    localStorage.setItem(clave, valorEncriptado);
}

function obtenerDeLocalStorage(clave) {
    const valorEncriptado = localStorage.getItem(clave);
    if (valorEncriptado) {
        const bytes = CryptoJS.AES.decrypt(valorEncriptado, 'lalavanderia');
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    }
    return null;
}

//Funcion crear un parrafo con el año actual en el footer
function crearFooter() {
    console.log("Se llama a la funcion de crear el footer.");
    const añoActual = new Date().getFullYear();
    const footer = document.querySelector('.footer');
    const parrafo = document.createElement('p');
    parrafo.textContent = `Copyright ${añoActual}. Designed by Apx.Jul`;
    footer.appendChild(parrafo);
}