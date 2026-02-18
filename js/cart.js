// ===== OBTENER CARRITO =====
function obtenerCarrito() {
    return JSON.parse(localStorage.getItem("carrito")) || [];
}

// ===== GUARDAR CARRITO =====
function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

// ===== AGREGAR AL CARRITO =====
function agregarAlCarrito(idPerfume) {

    let carrito = obtenerCarrito();

    let item = carrito.find(p => p.id === idPerfume);

    if (item) {
        if (item.cantidad < 2) {
            item.cantidad++;
        } else {
            alert("Solo puedes agregar máximo 2 unidades de este perfume.");
        }
    } else {
        carrito.push({
            id: idPerfume,
            cantidad: 1
        });
    }

    guardarCarrito(carrito);
    actualizarContadorCarrito();
}

// ===== ACTUALIZAR CONTADOR =====
function actualizarContadorCarrito() {

    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const contador = document.getElementById("cartCount");

    if (!contador) return;

    const total = carrito.reduce((acc, item) => acc + item.cantidad, 0);

    // Solo animar si cambia
    if (parseInt(contador.textContent) !== total) {

        contador.textContent = total;

        contador.classList.remove("animate");
        void contador.offsetWidth; // reinicia animación
        contador.classList.add("animate");

    } else {
        contador.textContent = total;
    }
}


function renderCarrito() {

    const container = document.getElementById("cartContainer");
    if (!container) return;

    let carrito = obtenerCarrito();
    let perfumesActuales = obtenerPerfumesActuales();

    if (carrito.length === 0) {
        container.innerHTML = "<p class='cart-empty'>Tu carrito está vacío. Agrega perfumes del catálogo para poder generar el pedido</p>";
        return;
    }

    let totalGeneral = 0;
    let html = `<div class="cart-table-vertical">`;

    carrito.forEach(item => {

        let perfume = perfumesActuales.find(p => p.id === item.id);
        if (!perfume) return;

        let subtotal = perfume.precioFinal * item.cantidad;
        totalGeneral += subtotal;

        html += `
            <div class="cart-row">

                <div class="cart-row-left">
                    <input type="checkbox" class="cart-check" 
                    data-id="${item.id}" 
                    ${item.activo !== false ? "checked" : ""}>

                    <img src="${perfume.imagen}" class="cart-img-small">
                </div>

                <div class="cart-row-center">
                    <div class="cart-name">
                        ${perfume.nombre.toLowerCase()} ${perfume.subtitulo}
                    </div>

                    <div class="cart-meta">
                        <select class="cart-qty-select" data-id="${item.id}">
                            <option value="1" ${item.cantidad === 1 ? "selected" : ""}>1 pz</option>
                            <option value="2" ${item.cantidad === 2 ? "selected" : ""}>2 pz</option>
                        </select>

                        <span class="cart-subtotal">
                            $${subtotal.toLocaleString()}
                        </span>
                    </div>
                </div>

                <div class="cart-row-right">
                    <button class="cart-remove" data-id="${item.id}">
                        ✕
                    </button>
                </div>

            </div>
        `;
    });

    html += `
        </div>

        <div class="vaciar">
            <button id="vaciarCarrito" class="btn-vaciar">
                    Vaciar carrito
                </button>
            
            <div class="cart-total" id="cartTotal">
                Total: $${totalGeneral.toLocaleString()}
            </div>
        </div>

        <div class="carrito-actions">
        
            

            <button id="whatsappPedido" class="btn-whatsapp">
                Hacer pedido por WhatsApp
            </button>
        </div>
    `;
    html += `
        <div class="cart-message-preview">
            <div class="cart-preview-title">
                El mensaje automático que se enviará será:
            </div>
            <div id="previewMessage" class="cart-preview-box">
            </div>
        </div>
    `;

    container.innerHTML = html;

    initCartControls();
    actualizarTotalDinamico();
    actualizarPreviewMensaje();


}
function actualizarPreviewMensaje() {

    const preview = document.getElementById("previewMessage");
    if (!preview) return;

    let carrito = obtenerCarrito();
    let perfumesActuales = obtenerPerfumesActuales();

    let activos = carrito.filter(item => item.activo !== false);

    if (activos.length === 0) {
        preview.textContent = "Selecciona productos para generar el mensaje.";
        return;
    }

    let mensaje = "Hola, quisiera información sobre el siguiente pedido:\n\n";
    let total = 0;

    activos.forEach(item => {

        let perfume = perfumesActuales.find(p => p.id === item.id);
        if (!perfume) return;

        let subtotal = perfume.precioFinal * item.cantidad;
        total += subtotal;

        mensaje += `• ${perfume.nombre} ${perfume.subtitulo.toLowerCase()} (${item.cantidad}x) - $${subtotal.toLocaleString()}\n`;
    });

    mensaje += `\nTotal: $${total.toLocaleString()}`;

    preview.textContent = mensaje;
}


function initCartControls() {

    // Checkbox recalcula total
    document.querySelectorAll(".cart-check").forEach(check => {

        check.addEventListener("change", () => {

            let carrito = obtenerCarrito();
            const id = parseInt(check.dataset.id);

            const item = carrito.find(p => p.id === id);
            if (item) {
                item.activo = check.checked;
            }

            guardarCarrito(carrito);

            actualizarTotalDinamico();
        });
    });

    document.querySelectorAll(".cart-qty-select").forEach(select => {
        select.addEventListener("change", () => {
            actualizarCantidad(select.dataset.id, select.value);
            renderCarrito();
        });
    });



    // ===== ELIMINAR INDIVIDUAL =====
    document.querySelectorAll(".cart-remove").forEach(btn => {
        btn.addEventListener("click", () => {

            let carrito = obtenerCarrito();
            const id = parseInt(btn.dataset.id);

            carrito = carrito.filter(item => item.id !== id);

            guardarCarrito(carrito);
            renderCarrito();
            actualizarContadorCarrito();
        });
    });

    // ===== CAMBIAR CANTIDAD =====
    document.querySelectorAll(".cart-qty-select").forEach(select => {

        select.addEventListener("change", () => {

            let carrito = obtenerCarrito();
            const id = parseInt(select.dataset.id);

            const item = carrito.find(p => p.id === id);

            if (item) {
                item.cantidad = parseInt(select.value);
            }

            guardarCarrito(carrito);
            renderCarrito();
            actualizarContadorCarrito();
        });

    });

    // ===== VACIAR CARRITO =====
    const btnVaciar = document.getElementById("vaciarCarrito");

    if (btnVaciar) {
        btnVaciar.addEventListener("click", () => {

            if (!confirm("¿Deseas vaciar el carrito?")) return;

            localStorage.removeItem("carrito");
            renderCarrito();
            actualizarContadorCarrito();
        });
    }

    // ===== WHATSAPP =====
    const btnWhatsapp = document.getElementById("whatsappPedido");

    if (btnWhatsapp) {

        btnWhatsapp.addEventListener("click", () => {

            let carrito = obtenerCarrito();
            let perfumesActuales = obtenerPerfumesActuales();

            // Filtrar solo activos
            let activos = carrito.filter(item => item.activo !== false);

            if (activos.length === 0) {
                alert("Selecciona al menos un perfume para hacer el pedido.");
                return;
            }

            let mensaje = "Hola, quisiera información sobre el siguiente pedido:%0A%0A";
            let total = 0;

            activos.forEach(item => {

                let perfume = perfumesActuales.find(p => p.id === item.id);
                if (!perfume) return;

                let subtotal = perfume.precioFinal * item.cantidad;
                total += subtotal;

                mensaje += `• ${perfume.nombre} ${perfume.subtitulo} (${item.cantidad}x) - $${subtotal.toLocaleString()}%0A`;
            });

            mensaje += `%0ATotal: $${total.toLocaleString()}`;

            const numero = "529811855240"; 

            window.open(`https://wa.me/${numero}?text=${mensaje}`, "_blank");
        });
    }

}

function actualizarTotalDinamico() {

    const checks = document.querySelectorAll(".cart-check");
    const totalEl = document.getElementById("cartTotal");

    let carrito = obtenerCarrito();
    let perfumesActuales = obtenerPerfumesActuales();

    let nuevoTotal = 0;
    
    checks.forEach(check => {

        const id = parseInt(check.dataset.id);
        const row = check.closest(".cart-row");

        const item = carrito.find(p => p.id === id);
        const perfume = perfumesActuales.find(p => p.id === id);

        if (!item || !perfume) return;

        if (item.activo !== false) {
            nuevoTotal += perfume.precioFinal * item.cantidad;
            row.classList.remove("cart-disabled");

        } else {

            row.classList.add("cart-disabled");

        }
    });
    actualizarPreviewMensaje();
    totalEl.textContent = "Total: $" + nuevoTotal.toLocaleString();
}


