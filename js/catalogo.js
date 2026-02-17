/* =================================================
   CATALOGO PRINCIPAL
================================================= */
function openEditModal(perfume) {

    document.getElementById("adminDisponible").value =
    perfume.disponible === false ? "false" : "true";

    const modal = document.getElementById("adminModal");
    modal.style.display = "flex";

    resetAdminState();

    document.getElementById("adminMarca").value = perfume.marca || "";
    document.getElementById("adminNombre").value = perfume.nombre || "";
    document.getElementById("adminSubtitulo").value = perfume.subtitulo || "";
    document.getElementById("adminImagen").value = perfume.imagen || "";
    document.getElementById("adminGenero").value = perfume.genero || "";
    document.getElementById("adminPrecioOriginal").value = perfume.precioOriginal || "";
    document.getElementById("adminPrecioFinal").value = perfume.precioFinal || "";

    // ===== CARGAR NOTAS =====
    ["salida","corazon","fondo"].forEach(tipo => {

        if (!perfume.notas || !perfume.notas[tipo]) return;

        perfume.notas[tipo].forEach(nota => {

            const container = document.querySelector(`.tag-container[data-tipo="${tipo}"]`);
            addTag(nota, tipo, container);

        });
    });

    //==== cargar IMAGEN Seleccionar imagen visualmente
    // 
    document.querySelectorAll(".admin-image-item").forEach(item => {
        item.classList.remove("selected");
        const img = item.querySelector("img");
        if (img.src.includes(perfume.imagen)) {
            item.classList.add("selected");
        }
    });

    document.getElementById("adminImagen").value = perfume.imagen;


    // ===== CARGAR USO =====
    if (perfume.uso) {
            Object.keys(perfume.uso).forEach(tipo => {

                usoSeleccionado[tipo] = { ...perfume.uso[tipo] };

                const item = document.querySelector(`.uso-admin-item .${tipo}`)?.closest(".uso-admin-item");
                if (!item) return;

                const icon = item.querySelector(".uso-admin-icon");
                const range = item.querySelector(".uso-range");
                const value = item.querySelector(".uso-range-value");

                if (perfume.uso[tipo].activo) {
                    icon.classList.add("activo");
                }
                range.value = perfume.uso[tipo].porcentaje;
                value.textContent = perfume.uso[tipo].porcentaje + "%";
            });
        }
        window.editingPerfumeId = perfume.id;
}
function renderPerfumes(filtro = "all") {

    filtroActual = filtro;
    const grid = document.getElementById("perfumeGrid");
    if (!grid) return;

    grid.innerHTML = "";

    let todosPerfumes = obtenerPerfumesActuales();
    let perfumesFiltrados;

    if (filtro === "all") {
        perfumesFiltrados = todosPerfumes;
    }
    else if (filtro === "hombre") {
        perfumesFiltrados = todosPerfumes.filter(p =>
            p.genero === "hombre" || p.genero === "unisex"
        );
    }
    else if (filtro === "mujer") {
        perfumesFiltrados = todosPerfumes.filter(p =>
            p.genero === "mujer" || p.genero === "unisex"
        );
    }

    let listaFinal = mostrandoTodo
        ? perfumesFiltrados
        : perfumesFiltrados.slice(0, LIMITE);

    listaFinal.forEach(perfume => {

        const card = document.createElement("a");
        card.href = `perfume.html?id=${perfume.id}`;
        card.classList.add("perfume-card");

        let descuento = null;

        if (perfume.precioOriginal > perfume.precioFinal) {
            descuento = Math.round(
                ((perfume.precioOriginal - perfume.precioFinal) / perfume.precioOriginal) * 100
            );
        }

        card.innerHTML = `
            <div class="perfume-sub1"> ${perfume.subtitulo ? `<span class="perfume-sub">${perfume.subtitulo}</span>` : ""} </div>
            
            ${descuento ? `<div class="discount-badge">-${descuento}%</div>` : ""}

            <div class="image-container">
                <img src="${perfume.imagen}" alt="${perfume.nombre}">
            </div>

            <div class="perfume-info">
                <div class="perfume-title-block">
                    <div class="perfume-main-line">
                        <h3 class="perfume-name">${perfume.nombre}</h3>
                        
                    </div>
                    <div class="perfume-brand">${perfume.marca}</div>
                </div>

                <div class="price-container">
                    <span class="final-price">$${perfume.precioFinal.toLocaleString()}</span>
                    <span class="original-price">$${perfume.precioOriginal.toLocaleString()}</span>
                </div>
                <div class="view-more">
                    Ver detalles
                </div>

            </div>

            ${perfume.disponible === false ? `
                <div class="no-disponible-badge">NO DISPONIBLE</div>
            ` : ""}
        `;

        if (perfume.disponible === false) {
            card.classList.add("no-stock");
        }
        // ===== CONTROLES ADMIN =====
        if (isAdminMode()) {

            const adminControls = document.createElement("div");
            adminControls.classList.add("admin-card-controls");

            adminControls.innerHTML = `
                <button class="edit-btn">✏️</button>
                <button class="delete-btn">🗑</button>
            `;

            card.appendChild(adminControls);

            adminControls.querySelector(".edit-btn").addEventListener("click", (e) => {
                e.preventDefault();
                openEditModal(perfume);
            });

            adminControls.querySelector(".delete-btn").addEventListener("click", (e) => {
                e.preventDefault();
                deletePerfume(perfume.id);
            });
        }


        grid.appendChild(card);
    });

    renderBotonMostrarMas(perfumesFiltrados.length);
}

function renderBotonMostrarMas(total) {

    const existente = document.getElementById("mostrarMasBtn");
    if (existente) existente.remove();

    if (mostrandoTodo || total <= LIMITE) return;

    const btn = document.createElement("button");
    btn.id = "mostrarMasBtn";
    btn.textContent = "Mostrar todos";

    btn.addEventListener("click", () => {
        mostrandoTodo = true;
        renderPerfumes(filtroActual);
    });

    document.querySelector(".container").appendChild(btn);
}

function initCatalogo() {

    const grid = document.getElementById("perfumeGrid");
    if (!grid) return;

    const filterButtons = document.querySelectorAll(".filter-btn");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {

            mostrandoTodo = false;

            document.querySelector(".filter-btn.active")?.classList.remove("active");
            button.classList.add("active");

            const filtro = button.dataset.filter;
            renderPerfumes(filtro);
        });
    });

    renderPerfumes("all");
}

/* =================================================
   ANIMACION SCROLL
================================================= */

function initScrollTopButton() {

    const btn = document.getElementById("scrollTopBtn");
    if (!btn) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 600) {
            btn.classList.add("show");
        } else {
            btn.classList.remove("show");
        }
    });

    btn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

function initWelcomeTooltip() {

    const tooltip = document.getElementById("welcomeTooltip");
    const closeBtn = document.getElementById("closeTooltip");

    if (!tooltip || !closeBtn) return;

    const yaVisto = localStorage.getItem("tooltipVisto");

    if (!yaVisto) {

        setTimeout(() => {

            const firstCard = document.querySelector(".perfume-card");
            if (!firstCard) return;

            const rect = firstCard.getBoundingClientRect();

            tooltip.style.top = window.scrollY + rect.top - 55 + "px";
            tooltip.style.left = rect.left + 10 + "px";

            tooltip.classList.add("show");
            firstCard.classList.add("highlight");

        }, 800);
    }

    function cerrarTooltip() {

        tooltip.classList.remove("show");

        const firstCard = document.querySelector(".perfume-card");
        if (firstCard) {
            firstCard.classList.remove("highlight");
        }

        localStorage.setItem("tooltipVisto", "true");

        window.removeEventListener("scroll", cerrarTooltip);
        document.removeEventListener("click", detectarClickCard);
    }

    function detectarClickCard(e) {
        if (e.target.closest(".perfume-card")) {
            cerrarTooltip();
        }
    }

    // Cerrar con botón
    closeBtn.addEventListener("click", cerrarTooltip);

    // Cerrar al hacer scroll
    window.addEventListener("scroll", cerrarTooltip, { once: true });

    // Cerrar al tocar cualquier card
    document.addEventListener("click", detectarClickCard);
}
