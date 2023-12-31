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

// Variables para almacenar las posiciones de inicio y fin del deslizamiento
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

// Evento para detectar cuando el usuario hace clic en un enlace de categoría
document.querySelector('.side-menu__links-categorias').addEventListener('click', function(event) {
    // Verifica si el elemento clickeado es un enlace de categoría
    if (event.target && event.target.matches('.side-menu__link')) {
        // Cierra el menú desplegable
        menu.classList.remove('open');
    }
});
//Cargar footer
crearFooter();

//-------------------------------------------------------------------------
//Funciones de mensaje inicial
const categorias = localStorage.getItem('categorias');
const mensajeInicial = document.querySelector('.mensaje-inicial');

// Función para cargar categorías y productos desde mockAPI
cargarCategoriasDesdeMockAPI();

function cargarCategoriasDesdeMockAPI() {
    console.log("1) Cargando categorías desde mockAPI...");
    fetch('https://657e48c43e3f5b189463a0ed.mockapi.io/categorias')
    .then(res => res.json())
        .then(categorias => {
            if (categorias.length === 0) {
                mensajeBienvenida();
                console.log("No hay categorías en mockAPI.");
            } else {
                categorias.forEach(categoriaObj => {
                    agregarCategoriaAlDOM(categoriaObj.nombre, categoriaObj.categoria);
                    categoriaObj.productos.forEach(producto => {
                        agregarProductoAlDOM(categoriaObj.categoria, producto.codigo, producto.descripcion, producto.precio, producto.imagen);
                    });
                });
            }
            
            marcarProductosAgregados();
            console.log("Categorías cargadas desde mockAPI.");
    })
    .catch(error => {
        console.error('Error al cargar categorías desde mockAPI:', error);
    });
}

//-------------------------------------------------------------------------
//Funcion para cargar categorias y productos desde localStorage
function agregarCategoriaAlDOM(nombreCategoria, categoriaId) {
    const mainElement = document.querySelector('main');
    const categoriasMenu = document.querySelector('.side-menu__links-categorias');

    // Crear y añadir categoría al contenido principal
    const nuevaCategoriaDiv = document.createElement('div');
    nuevaCategoriaDiv.className = 'categoria';
    nuevaCategoriaDiv.id = categoriaId;

    const tituloCategoria = document.createElement('h2');
    tituloCategoria.className = 'categoria__title';
    tituloCategoria.textContent = nombreCategoria;

    nuevaCategoriaDiv.appendChild(tituloCategoria);
    mainElement.appendChild(nuevaCategoriaDiv);

    // Crear y añadir enlaces a side-menu__links-categorias
    const nuevoItemLista = document.createElement('li');
    const enlaceCategoria = document.createElement('a');
    enlaceCategoria.href = `#${categoriaId}`;
    enlaceCategoria.className = 'side-menu__link';
    enlaceCategoria.textContent = nombreCategoria;

    nuevoItemLista.appendChild(enlaceCategoria);
    categoriasMenu.appendChild(nuevoItemLista);
}

//-------------------------------------------------------------------------
//Funcion para agregar productos al DOM
function agregarProductoAlDOM(categoriaNombre, codigo, descripcion, precio, imagen) {
    const categoriaDiv = document.getElementById(categoriaNombre);
    if (!categoriaDiv) {
        alert("Categoría no encontrada en el DOM");
        return;
    }
    
    const productoHTML = `
    <div class="product" id="${codigo}">
        <div class="product__img">
            <img src="${imagen}" alt="${descripcion}" class="product__img lazyload">
        </div>
        <p class="product__description">${descripcion}</p>
        <p class="product__code">Código: ${codigo}</p>
        <p class="product__price">$${precio}</p>
        <button class="product__btn">
            <i class="fas fa-shopping-cart"></i> Agregar al pedido
        </button>
        <div class="cantidad" hidden>
            <div class="selector-cantidad">
                <button class="decremento">-</button>
                <input type="text" value="0" class="cantidad-input">
                <button class="incremento">+</button>
            </div>
            <button class="btn-agregar">AGREGAR</button>
        </div>
    </div>`;

categoriaDiv.insertAdjacentHTML('beforeend', productoHTML);
}

function mensajeBienvenida() {

    Swal.fire({
        title: "Bienvenido!",
        text: "En esta tienda nube de prueba, como administrador, puede agregar categorías y productos al inicio en la pagina de configuraciones. También, podrá probar como cliente la parte de realizar pedidos.",
        imageUrl: "https://www.emojiall.com/images/animations/joypixels/128px/waving_hand.gif",
        imageWidth: 100,
        imageHeight: 100,
        imageAlt: "Custom image"
    });
}

function marcarProductosAgregados() {
    let carrito2 = obtenerDeLocalStorage('carrito2') || [];
    carrito2.forEach(item => {
        let productoId = item.codigo.toString(); // Asegúrate de que sea una cadena
        console.log(`Buscando producto con ID: ${productoId}`);
        let productoDOM = document.getElementById(productoId);

        if (productoDOM) {
            console.log(`Producto encontrado en el DOM: ${productoId}`);
            let botonAgregar = productoDOM.querySelector('.product__btn');
            if (botonAgregar) {
                botonAgregar.classList.add('product__btn--added');
                botonAgregar.textContent = "AGREGADO";
            } else {
                console.log(`Botón no encontrado en el producto con ID: ${productoId}`);
            }
        } else {
            console.log(`Producto no encontrado en el DOM con ID: ${productoId}`);
        }
    });
}

//Funcion crear un parrafo con el año actual en el footer
function crearFooter() {
    const añoActual = new Date().getFullYear();
    const footer = document.querySelector('.footer');
    const parrafo = document.createElement('p');
    parrafo.textContent = `Copyright ${añoActual}. Designed by Apx.Jul`;
    footer.appendChild(parrafo);
}