document.addEventListener("DOMContentLoaded", function() {

    cargarProductos();

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
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const telefono = document.getElementById('telefono').value;
        const direccion = document.getElementById('direccion').value;
        const comentarios = document.getElementById('comentarios').value;

        let pedido = validarDatosCliente(carrito, nombre, email, telefono, direccion,comentarios);
        if (pedido) {
            pedidoConfirmado(carrito, nombre, email, telefono, direccion,comentarios);
            // Aquí puedes hacer lo que necesites con los datos
            // Por ejemplo, enviarlos a un servidor con AJAX
        }
    }); 
    
});

//-------------------------------------------------------------------------
// Carga los productos del carrito en el DOM en forma de tabla

function cargarProductos() {
    console.log("Se llama a la funcion de cargar productos al DOM");
    const tableBody = document.querySelector("tbody");
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    if (carrito.length > 0) {
        console.log("Hay productos en el carrito. Se cargan en el DOM en filas los productos.");
        tableBody.innerHTML = "";
        carrito.forEach((producto) => tableBody.innerHTML += retornarFilaHTML(producto));
        botonEliminarProductos();
    } else {
        console.log("Se llamo a la funcion de cargar productos y no hay productos en el carrito.");
        tableBody.innerHTML = "";
        tableBody.innerHTML = '<tr><td colspan="4">No hay productos en el pedido.</td></tr>';
    }
}

// Retorna una fila de la tabla en forma de HTML con los datos del producto
function retornarFilaHTML(producto) {
    return `<tr>
                <td>${producto.cantidad}</td>
                <td>${producto.id}</td>
                <td>${producto.descripcion}</td>
                <td>$${producto.precio}</td>
                <td><button id="${producto.id}" class="btnEliminarPedido">Eliminar</button></td>
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

    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    const idx = carrito.findIndex((producto) => producto.id === idProducto);
    console.log("El producto con id " + idProducto + " se encuentra en la posición " + idx + " del carrito.");
    if (idx !== -1) {
        carrito.splice(idx, 1); // Elimina el producto del carrito
        localStorage.setItem('carrito', JSON.stringify(carrito));
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

function validarDatosCliente(carrito, nombre, email, telefono, direccion, comentarios) {
    console.log("2)A) Se llama a la funcion de validar datos del cliente.");
    let regexEmail = /\S+@\S+\.\S+/;
    let regexTelefono = /^\d{10}$/;
    console.log({carrito, nombre, email, telefono, direccion, comentarios});

    if (carrito.length === 0) {
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

function pedidoConfirmado(carrito, nombre, email, telefono, direccion, comentarios) {
    // Si todas las validaciones pasan, podrías continuar con el proceso
    let datosCliente = {
        nombre: nombre,
        email: email,
        telefono: telefono,
        direccion: direccion,
        comentarios: comentarios
    };

    // Aquí puedes hacer lo que necesites con los datos
    console.log({datosCliente});
    carrito = [];
    console.log({carrito});
    localStorage.setItem('carrito', JSON.stringify(carrito)); // Establece el carrito a un array vacío
    localStorage.setItem('cartCount', 0); // Establece el contador a cero
    console.log("3)A) Se vacio el carrito y se llama a la funcion de cargar productos.");
    cargarProductos();
    confirmarPedidoAudio();
    borrarDatosFormulario();
    mensajesAlUsuario('Pedido exitoso!','En breve lo contactaremos por wsp.', 'success');
}

function confirmarPedidoAudio() {
    console.log("Se activa audio de confirmacion de pedido.");
    let audio = document.getElementById('sonidoConfirmacion');
    audio.volume = 0.3; // Ajusta el volumen al 50%
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