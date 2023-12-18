document.addEventListener("DOMContentLoaded", function() {
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

    let mensajeContenedor = document.createElement('div');
    mensajeContenedor.id = 'mensajeConfirmacion';
    document.body.appendChild(mensajeContenedor);

    //Funciones para agregar categorias------------------------------------------------------
    const btnAgregarCategoria = document.getElementById('btnAgregarCategoria');
    const nombreCategoriaInput = document.getElementById('nombreCategoria');
    
    btnAgregarCategoria.addEventListener('click', function() {
        let nombreCategoria = nombreCategoriaInput.value.trim();
    
        if (nombreCategoria === "") {
            mensajesAlUsuario("Atencion!","No has ingresado ninguna categoria.","warning");
            return;
        }
    
        let categoriaSlug = convertirANombreSlug(nombreCategoria);

        // Crea el objeto de la categoría para mandarlo a mockAPI
        let nuevaCategoria = {
            categoria: categoriaSlug,  // Cambiado de 'id' a 'categoria'
            nombre: nombreCategoria,
            productos: []
        };

        // Enviar la categoría a mockAPI
        enviarCategoriaAMockAPI(nuevaCategoria);

        /*
        // Llama a almacenarCategoria para el localStorage
        if (almacenarCategoria(nombreCategoria, categoriaSlug)) {
            console.log("Categoria agregada al localStorage.");
            //mostrarMensajeConfirmacion("Categoría agregada");
        }
        */
    });
    
    function almacenarCategoria(nombreCategoria, categoriaSlug) {
        let categorias = JSON.parse(localStorage.getItem('categorias')) || [];
    
        if (categorias.some(categoria => categoria.id === categoriaSlug)) {
            console.log("Ya existe una categoria con ese nombre en localStorage.");
            //mensajesAlUsuario("Atencion!","Ya existe una categoria con ese nombre.","warning");
            return false;
        }
    
        let nuevaCategoria = { id: categoriaSlug, nombre: nombreCategoria, productos: [] };
        categorias.push(nuevaCategoria);
        localStorage.setItem('categorias', JSON.stringify(categorias));
        return true;
    }
    

    //Funciones para eliminar categorias--------------------------------------------------------
    const btnEliminarCategoria = document.getElementById('btnEliminarCategoria');
    const btnEliminarCategorias = document.getElementById('btnEliminarCategorias');
    const categoriaEliminarInput = document.getElementById('categoriaEliminar');
    
    btnEliminarCategoria.addEventListener('click', function() {
        let categoriaNombre = categoriaEliminarInput.value.trim();
    
        if (categoriaNombre === "") {
            mensajesAlUsuario("Atencion!","No has ingresado ninguna categoria.","warning");
            return;
        }
    
        let categoriaSlug = convertirANombreSlug(categoriaNombre);

        // Enviar petición DELETE a mockAPI
        eliminarCategoriaMockAPI(categoriaSlug);
        
        // Llama a eliminarCategoria y usa su valor de retorno
        if (eliminarCategoriaLocalStorage(categoriaNombre, categoriaSlug)) {
            console.log("Categoria eliminada del localStorage.");
            //mostrarMensajeConfirmacion("Categoría eliminada");
        }

    });

    function eliminarCategoriaLocalStorage(categoriaNombre,categoriaSlug) {
        let categorias = JSON.parse(localStorage.getItem('categorias')) || [];//Obtiene el array de categorias de localStorage y se transform a un array de JS
        console.log("Categoria slug: "+categoriaSlug);
        let indice = categorias.findIndex(categoria => categoria.id === categoriaSlug);
    
        if (indice === -1) {
            console.log("No existe la categoria "+categoriaNombre+" en localStorage");
            //mensajesAlUsuario("Atencion!","No existe la categoria "+categoriaNombre,"warning");
            return;
        }
        categorias.splice(indice, 1);//Elimina el elemento del array categorias empezando desde la posición 1
        localStorage.setItem('categorias', JSON.stringify(categorias));//Se vuelve a guardar el array actualizado en localStorage en formato JSON
        return true;
    }

    //Funcion para eliminar todas las categorias------------------------------
    btnEliminarCategorias.addEventListener('click', function() {
        if (confirm("¿Estás seguro de que deseas eliminar todas las categorías?")) {
            localStorage.clear();
            console.log("Se eliminaron todas las categorías de localStorage.");
            eliminarTodasLasCategorias();
            //mostrarMensajeConfirmacion("Todas las categorías han sido eliminadas");
        } 
    });

    //--------------------------------PRODUCTOS-----------------------------------------
    //Funciones para agregar productos--------------------------------------------------
    const agregarACategoria = document.getElementById('agregarACategoria');
    const productoImagen = document.getElementById('productoImagen');
    const productoDescripcion = document.getElementById('productoDescripcion');
    const productoCodigo = document.getElementById('productoCodigo');
    const productoPrecio = document.getElementById('productoPrecio');
    const btnAgregarProducto = document.getElementById('btnAgregarProducto');

    btnAgregarProducto.addEventListener('click', function() {
        const categoriaNombre = agregarACategoria.value.trim();
        let categoriaSlug = convertirANombreSlug(categoriaNombre);
        const descripcion = productoDescripcion.value;
        const codigo = parseInt(productoCodigo.value, 10);
        const precio = parseFloat(productoPrecio.value);
        const imagen = productoImagen.value;

        // Verificar si el código del producto ya existe
        if (document.getElementById('producto' + codigo)) {
            mensajesAlUsuario("Atencion!","Ya existe un producto con el código: " + codigo,"warning");
            return;
        }
        
        // Verificar que la descripción no esté vacía y sea menor a 15 caracteres
        if (descripcion.length > 15) {
            mensajesAlUsuario("Atencion!","La descripción del producto no debe exceder los 15 caracteres.","warning");
            return;
        }

        // Verificar que el código sea mayor a cero
        if (isNaN(codigo) || codigo <= 0) {
            mensajesAlUsuario("Atencion!","El código del producto debe ser un número mayor a cero.","warning");
            return;
        }
        
        // Verificar que el precio sea mayor a cero
        if (isNaN(precio) || precio <= 0) {
            mensajesAlUsuario("Atencion!","El precio del producto debe ser un número mayor a cero.","warning");
            return;
        }
        
        // Obtener la categoría de mockAPI, agregar el producto y actualizar
        agregarProductoAMockAPI(categoriaSlug, { codigo, descripcion, precio, imagen });

        // Agregar producto a localStorage y al DOM y usa su valor de retorno
        if (agregarProductoALocalStorage(categoriaSlug, codigo, descripcion, precio, imagen)) {
            console.log("Producto agregado a localStorage.");
            //mostrarMensajeConfirmacion("Producto agregado");
        }
    });

    function agregarProductoALocalStorage(categoriaNombre, codigo, descripcion, precio, imagen) {
        let categorias = JSON.parse(localStorage.getItem('categorias')) || [];
    
        // Verificar si el código del producto ya existe en cualquier categoría
        let codigoExiste = categorias.some(categoria => 
            categoria.productos && categoria.productos.some(prod => prod.codigo === codigo)
        );
    
        if (codigoExiste) {
            //mensajesAlUsuario("Atencion!","Ya existe un producto con el código: " + codigo,"warning");
            return false;
        }
    
        let categoriaIndex = categorias.findIndex(cat => cat.id === categoriaNombre);
        if (categoriaIndex === -1) {
            //mensajesAlUsuario("Atencion!","No existe la categoria "+categoriaNombre,"warning");
            return false;
        }
    
        let categoria = categorias[categoriaIndex];
        let nuevoProducto = { codigo, descripcion, precio, imagen };
        if (!categoria.productos) categoria.productos = [];
        categoria.productos.push(nuevoProducto);
    
        categorias[categoriaIndex] = categoria;
        localStorage.setItem('categorias', JSON.stringify(categorias));
        return true;
    }

    //Funciones para eliminar productos---------------------------------------------------------
    const btnEliminarProducto = document.getElementById('btnEliminarProducto');
    const productoEliminarInput = document.getElementById('productoEliminar');
    
    btnEliminarProducto.addEventListener('click', function() {
        const productoNumero = productoEliminarInput.value.trim();
    
        if (productoNumero === "") {
            mensajesAlUsuario("Atencion!","No has ingresado ningún código de producto.","warning");
            return;
        }

        eliminarProductoMockAPI(productoNumero);
    
        if (eliminarProductoLocalStorage(productoNumero)) {
            console.log("Producto eliminado del localStorage.");
            //mostrarMensajeConfirmacion("Producto eliminado");
        } else {
            //mensajesAlUsuario("Atencion!","No existe ningún producto con el código: " + productoNumero,"warning");
        }
    });
    
    function eliminarProductoLocalStorage(codigoProducto) {
        let categorias = JSON.parse(localStorage.getItem('categorias')) || [];
        let productoEliminado = false;
    
        categorias.forEach(categoria => {
            if (categoria.productos) {
                const productoIndex = categoria.productos.findIndex(producto => producto.codigo.toString() === codigoProducto);
                if (productoIndex !== -1) {
                    categoria.productos.splice(productoIndex, 1); // Elimina el producto
                    productoEliminado = true;
                }
            }
        });
    
        if (productoEliminado) {
            localStorage.setItem('categorias', JSON.stringify(categorias));
            return true;
        } else {
            return false;
        }
    }

    function eliminarProductoMockAPI(codigoProducto) {
        console.log("1) Se intenta eliminar producto de mockAPI.");
        fetch('https://657e48c43e3f5b189463a0ed.mockapi.io/categorias')
        .then(res => res.json())
        .then(categorias => {
            let productoEliminado = false;
            let categoriaActualizada;
    
            categorias.forEach(categoria => {
                if (categoria.productos) {
                    const productoIndex = categoria.productos.findIndex(producto => producto.codigo.toString() === codigoProducto);
                    if (productoIndex !== -1) {
                        categoria.productos.splice(productoIndex, 1); // Elimina el producto
                        productoEliminado = true;
                        categoriaActualizada = categoria;
                    }
                }
            });
    
            if (productoEliminado) {
                // Actualizar la categoría en mockAPI
                return fetch(`https://657e48c43e3f5b189463a0ed.mockapi.io/categorias/${categoriaActualizada.categorias}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(categoriaActualizada)
                });
            } else {
                throw new Error('Producto no encontrado');
            }
        })
        .then(res => {
            if (res.ok) {
                console.log("Producto eliminado en mockAPI.");
                mostrarMensajeConfirmacion("Producto eliminado");
            } else {
                throw new Error('Error al eliminar el producto');
            }
        })
        .catch(error => {
            console.log(error.message + " en mockAPI.");
            mensajesAlUsuario("Error", error.message, "error");
        });
    }
    
    //-------------------------FUNCIONES GENERICAS-------------------------
    //Funcion para convertir a slug-----------------------------------------
    function convertirANombreSlug(nombre) {
        return nombre
            .toLowerCase()
            .replace(/ /g, '-')  // Reemplaza espacios con guiones
            .replace(/[^\w-]+/g, '');  // Elimina caracteres que no sean alfanuméricos o guiones
    }

    //Funcion generica de mensaje de confirmación-------------------------
    function mostrarMensajeConfirmacion(mensaje) {
        let mensajeContenedor = document.getElementById('mensajeConfirmacion');
    
        mensajeContenedor.textContent = mensaje;
        mensajeContenedor.style.left = '50%'; // Mueve hacia la posición final
        mensajeContenedor.style.opacity = '1'; // Hace visible el mensaje
    
        // Espera un tiempo antes de comenzar el desvanecimiento
        setTimeout(() => {
            mensajeContenedor.style.opacity = '0'; // Comienza a desvanecer
        }, 3000); // El mensaje permanece visible durante 3 segundos antes de desvanecerse
    
        // Ocultar completamente después del desvanecimiento
        setTimeout(() => {
            mensajeContenedor.style.left = '-100%'; // Mueve fuera de la pantalla
        }, 3500); // Espera un poco más para que la transición de opacidad termine
    }
    
    function mensajesAlUsuario(titulo,texto,icono){
        Swal.fire({
            title: titulo,
            text: texto,
            icon: icono
          });
    }

    //Funcion para enviar categoria a mockAPI----------------------------------
    function enviarCategoriaAMockAPI(categoria) {
        console.log("1) Se intenta crear la nueva categoria en mockAPI.");
    
        fetch('https://657e48c43e3f5b189463a0ed.mockapi.io/categorias')
        .then(res => res.json())
        .then(categoriasExistentes => {
            // Comprobar si ya existe una categoría con el mismo slug
            if (categoriasExistentes.some(cat => cat.categoria === categoria.categoria)) {
                throw new Error('La categoría ya existe');
            }
            // Si no existe, proceder a crear una nueva categoría
            return fetch('https://657e48c43e3f5b189463a0ed.mockapi.io/categorias', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(categoria)
            });
        })
        .then(res => {
            if (res.ok) {
                return res.json();
            }
            throw new Error('Error al agregar la categoría');
        })
        .then(() => {
            mostrarMensajeConfirmacion("Categoría agregada");
            console.log("Categoria agregada en mockAPI.");
            // Aquí puedes actualizar la UI o realizar otras acciones necesarias
        })
        .catch(error => {
            mensajesAlUsuario("Error", error.message, "error");
            console.log(error.message + " en mockAPI.");
        });
    }
    
    
    //Funcion para eliminar categoria de mockAPI----------------------------------
    function eliminarCategoriaMockAPI(slugCategoria) {
        console.log("1) Se intenta eliminar categoría de mockAPI.");

        // Primero, obtén todas las categorías de mockAPI
        fetch('https://657e48c43e3f5b189463a0ed.mockapi.io/categorias')
        .then(res => res.json())
        .then(categorias => {
            // Encuentra la categoría con el slug correspondiente
            const categoria = categorias.find(cat => cat.categoria === slugCategoria);
            if (!categoria) {
                throw new Error('Categoría no encontrada');
            }
            // El ID numérico para la categoría
            return categoria.categorias;
        })
        .then(categoriaId => {
            // Ahora, envía la petición DELETE usando el ID numérico
            return fetch('https://657e48c43e3f5b189463a0ed.mockapi.io/categorias/' + categoriaId, {
                method: 'DELETE'
            });
        })
        .then(res => {
            if (res.ok) {
                mostrarMensajeConfirmacion("Categoría eliminada");
                // Actualizar la UI según sea necesario
            } else {
                throw new Error('Error al eliminar la categoría');
            }
        })
        .catch(error => {
            mensajesAlUsuario("Error", error.message, "error");
            console.log(error.message + " en mockAPI.");
        });
    }

    function eliminarTodasLasCategorias() {
        fetch('https://657e48c43e3f5b189463a0ed.mockapi.io/categorias')
        .then(res => res.json())
        .then(categorias => {
            // Crea un array de promesas para las peticiones DELETE
            const promesasEliminar = categorias.map(categoria => {
                return fetch('https://657e48c43e3f5b189463a0ed.mockapi.io/categorias/' + categoria.categorias, {
                    method: 'DELETE'
                });
            });
    
            // Usa Promise.all para esperar a que todas las peticiones se completen
            return Promise.all(promesasEliminar);
        })
        .then(() => {
            mostrarMensajeConfirmacion("Todas las categorías han sido eliminadas");
            console.log("Todas las categorías han sido eliminadas de mockAPI.");
        })
        .catch(error => {
            mensajesAlUsuario("Error", error.message, "error");
            console.log(error.message + " en mockAPI.");
        });
    }

    //Funcion para agregar producto a mockAPI----------------------------------
    function agregarProductoAMockAPI(categoriaSlug, nuevoProducto) {
        fetch(`https://657e48c43e3f5b189463a0ed.mockapi.io/categorias?search=${categoriaSlug}`)
        .then(res => res.json())
        .then(categorias => {
            if (categorias.length === 0) {
                throw new Error('Categoría no encontrada');
            }
            let categoria = categorias[0];
            if (!categoria.productos) {
                categoria.productos = [];
            }
    
            // Verificar si el código del producto ya existe en la categoría
            if (categoria.productos.some(prod => prod.codigo === nuevoProducto.codigo)) {
                throw new Error('Ya existe un producto con el código: ' + nuevoProducto.codigo);
            }
    
            categoria.productos.push(nuevoProducto);
    
            // Actualizar la categoría en mockAPI
            return fetch(`https://657e48c43e3f5b189463a0ed.mockapi.io/categorias/${categoria.categorias}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(categoria)
            });
        })
        .then(res => {
            if (res.ok) {
                console.log("Producto agregado en mockAPI.");
                mostrarMensajeConfirmacion("Producto agregado");
            } else {
                throw new Error('Error al agregar el producto');
            }
        })
        .catch(error => {
            console.log(error.message + " en mockAPI.");
            mensajesAlUsuario("Error", error.message, "error");
        });
    }
    
});