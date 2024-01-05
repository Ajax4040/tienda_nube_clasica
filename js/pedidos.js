// Cargar el contador del carrito desde localStorage
inicializarContadorCarrito();

// Agrega la clase 'visible' a todos los productos cuando la página se carga
document.querySelectorAll('.product').forEach(product => {
    product.classList.add('visible');
});

const mainElement = document.querySelector('main');

mainElement.addEventListener('click', function(event) {
    // Verificar si el clic fue en un botón de producto
    if (event.target && event.target.classList.contains('product__btn')) {
        // Lógica para manejar el clic en el botón de agregar
        console.log("Se detectó un clic en un botón agregar al pedido.");
        manejarBotonAgregarAlPedido(event.target);
    } else if (event.target && event.target.classList.contains('incremento')) {
        console.log("Se detectó un clic en un botón de incremento.");
        // Lógica para manejar el clic en el botón de incremento
        const input = event.target.previousElementSibling;
        input.value = parseInt(input.value) + 1;
    } else if (event.target && event.target.classList.contains('decremento')) { 
        console.log("Se detectó un clic en un botón de decremento.");       
        // Evento para detectar cuando el usuario hace clic en un botón de decremento
        const input = event.target.nextElementSibling;
        input.value = Math.max(0, parseInt(input.value) - 1);
    } else if (event.target && event.target.classList.contains('btn-agregar')) {
        console.log("Se detectó un clic en un botón de agregar.");
        const cantidadContainer = event.target.parentElement;
        const productBtn = cantidadContainer.previousElementSibling;
        const input = cantidadContainer.querySelector('.cantidad-input');
        
        if(parseInt(input.value) > 0) {
            agregarAlPedido(event.target);;
            actualizarContadorCarrito(cartCount + 1);
            Swal.fire({
                title: "Producto agregado!",
                text: "Se agrego el producto al pedido.",
                icon: "success"
                });
            productBtn.textContent = "AGREGADO";
            productBtn.classList.add('product__btn--added');
        }else{
            Swal.fire({
                title: "Atencion!",
                text: "No has agregado ningun producto al pedido.",
                icon: "warning"
                });
        }

        cantidadContainer.style.display = 'none'; // Oculta el contenedor de cantidad
        input.value = 0; // Resetea el input a 0
        // Lógica para manejar el clic en el botón de agregar al carrito
    }
});

function manejarBotonAgregarAlPedido(button) {
    const cantidadContainer = button.nextElementSibling;
    if (button.classList.contains('product__btn--added')) {
        // Lógica para eliminar producto del carrito
        elminarProductoDelCarrito(button);
    } else {
        // Mostrar/ocultar el contenedor de cantidad
        cantidadContainer.style.display = (cantidadContainer.style.display === 'block') ? 'none' : 'block';
    }
}

//-------------------------------------------------------------------------
//Funciones para agregar productos desde el DOM al localStorage

function agregarAlPedido(button) {
    console.log("Se entra a la función agregar producto al pedido.");
    let productoDom = button.closest('.product'); // Encuentra el elemento .product más cercano al botón

    if (productoDom) {
        let codigo = parseInt(productoDom.id);
        const cantidadInput = parseInt(productoDom.querySelector('.cantidad-input').value);

        // URL de la API de MockAPI
        let url = 'https://657e48c43e3f5b189463a0ed.mockapi.io/categorias';

        // Realizar una solicitud a la API para obtener todas las categorías
        fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud a la API');
            }
            return response.json();
        })
        .then(categorias => {
            let productoEncontrado = false;

            // Buscar el producto en cada categoría
            for (let categoria of categorias) {
                let producto = categoria.productos.find(p => p.codigo === codigo);
                if (producto) {
                    console.log("Producto encontrado: ", producto);
                    // Llamar a cargarPedidoLocalStorage con los datos del producto
                    let pedidoActual = obtenerDeLocalStorage('carrito') || [];
                    pedidoActual.push({
                        codigo: producto.codigo, 
                        descripcion: producto.descripcion, 
                        precio: producto.precio, 
                        cantidad: cantidadInput, 
                        subTotal: producto.precio * cantidadInput
                    });
                    console.log("Pedido actual como se guardo en localStorage: ", pedidoActual);
                    guardarEnLocalStorage('carrito', pedidoActual);
                    productoEncontrado = true;
                    break; // Salir del bucle una vez encontrado el producto
                }
            }

            if (!productoEncontrado) {
                console.log("Producto no encontrado.");
            }
        })
        .catch(error => {
            console.error("Error al obtener los datos:", error);
        });

    } else {
        console.error("No se pudo encontrar el contenedor del producto.");
    }
}

//-------------------------------------------------------------------------
//Funciones para elminar productos desde el DOM al localStorage

function elminarProductoDelCarrito(button) {
    let producto = button.closest('.product'); 
    if (producto) {
        let codigo = producto.id;

        // Solicitar confirmación y eliminar si se confirma
        if (eliminarPedidoLocalStorage(codigo)) {
            // Solo actualizar el botón y el contador si se confirma la eliminación
            console.log("2) Se cambiará el texto del botón a 'Agregar al pedido'");
            button.classList.remove('product__btn--added');
            button.textContent = "";
            const productoHTML = `<i class="fas fa-shopping-cart"></i> Agregar al pedido`;
            button.insertAdjacentHTML('afterBegin', productoHTML);
            actualizarContadorCarrito(Math.max(0, cartCount - 1));
            Swal.fire({
                title: "Borrado!",
                text: "Su producto ha sido removido del pedido",
                icon: "success"
                });
        }else{
            console.log("2) No se cambiará el texto del botón a 'Agregar al pedido'");
        }
    } else {
        console.error("No se pudo encontrar el contenedor del producto.");
    }
}

function eliminarPedidoLocalStorage(codigo) {
    let carrito = obtenerDeLocalStorage('carrito') || [];
    let productoEnCarrito = carrito.find(producto => producto.codigo === parseInt(codigo));

    if (productoEnCarrito) {
        let confirmacion = confirm("¿Desea eliminar el producto del pedido?");

        if (confirmacion) {
            carrito = carrito.filter(producto => producto.codigo !== parseInt(codigo));
            console.log(carrito);
            guardarEnLocalStorage('carrito', carrito);
            console.log("En eliminarPedidoLocalStorage se retorna verdadero");
            return true;
        } else {
            console.log("En eliminarPedidoLocalStorage se retorna falso");
            return false;
        }
    }
    return false;
}

//-------------------------------------------------------------------------
//Funciones generales

function inicializarContadorCarrito() {
    let cartCount = 0;
    let contadorGuardado = localStorage.getItem('cartCount');
    if (contadorGuardado !== null) {
        cartCount = parseInt(contadorGuardado);
    }
    actualizarContadorCarrito(cartCount);
}

function actualizarContadorCarrito(nuevoContador) {
    cartCount = nuevoContador;
    localStorage.setItem('cartCount', cartCount);
    cartLink.textContent = `PEDIDOS (${cartCount})`;
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

