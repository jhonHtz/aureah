/* =================================================
   CATALOGO PRINCIPAL
================================================= */
let aromasSeleccionados = [];

function cumpleFiltroAroma(perfume) {

    if (aromasSeleccionados.length === 0) return true;

    if (!perfume.notas) return false;

    // Obtener todas las notas del perfume
    const todasNotas = [
        ...(perfume.notas.salida || []),
        ...(perfume.notas.corazon || []),
        ...(perfume.notas.fondo || [])
    ];

    // Detectar familias presentes
    const familiasDetectadas = new Set();

    todasNotas.forEach(nota => {

        const ruta = notasDisponibles[nota];

        if (!ruta) return;

        aromasSeleccionados.forEach(aroma => {
            if (ruta.includes(`/${aroma}/`)) {
                familiasDetectadas.add(aroma);
            }
        });

    });

    // Debe contener TODAS las seleccionadas (AND)
    return aromasSeleccionados.every(aroma =>
        familiasDetectadas.has(aroma)
    );
}
function openEditModal(perfume) {
    

    document.getElementById("adminDisponible").value =
    perfume.disponible === false ? "false" : "true";

    const modal = document.getElementById("adminModal");
    modal.style.display = "flex";

    resetAdminState();
    initUsoAdmin();  // reconstruye el grid antes de pintar


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

            const item = document
                .querySelector(`.uso-admin-icon.${tipo}`)
                ?.closest(".uso-admin-item");

            if (!item) return;

            const icon = item.querySelector(".uso-admin-icon");
            const range = item.querySelector(".uso-range");
            const value = item.querySelector(".uso-range-value");

            const datos = perfume.uso[tipo];

            // Guardar estado en memoria
            usoSeleccionado[tipo] = { ...datos };

            // Pintar activo
            icon.classList.toggle("activo", datos.activo);

            // Actualizar slider
            range.value = datos.porcentaje;
            value.textContent = datos.porcentaje + "%";
        });
    }
        window.editingPerfumeId = perfume.id;
}
/*
let ordenActual = "random";

function ordenarPerfumes(lista) {

    let copia = [...lista];

    if (ordenActual === "random") {
        return copia.sort(() => Math.random() - 0.5);
    }

    if (ordenActual === "price-asc") {
        return copia.sort((a, b) => a.precioFinal - b.precioFinal);
    }

    if (ordenActual === "price-desc") {
        return copia.sort((a, b) => b.precioFinal - a.precioFinal);
    }

    return copia;
}*/

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

    perfumesFiltrados = perfumesFiltrados.filter(p =>
        cumpleFiltroAroma(p)
    );
    if (perfumesFiltrados.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                No encontramos perfumes con esa combinación.
            </div>
        `;
        return;
    }
    /*perfumesFiltrados = ordenarPerfumes(perfumesFiltrados);*/
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
                
                <button class="add-to-cart-btn" data-id="${perfume.id}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 
                                2 1.61h9.72a2 2 0 0 0 
                                2-1.61L23 6H6"></path>
                    </svg>
                </button>

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
        const addBtn = card.querySelector(".add-to-cart-btn");
        if (addBtn) {
            addBtn.addEventListener("click", (e) => {
                e.preventDefault();
                agregarAlCarrito(perfume.id);
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
    const sortButtons = document.querySelectorAll(".sort-btn");
    /*
    sortButtons.forEach(button => {
        button.addEventListener("click", () => {

            document.querySelector(".sort-btn.active-sort")?.classList.remove("active-sort");

            button.classList.add("active-sort");

            ordenActual = button.dataset.sort;

            mostrandoTodo = false;
            renderPerfumes(filtroActual);
        });
    });*/
    const openBtn = document.getElementById("openAromaFilter");
    const closeBtn = document.getElementById("closeAromaFilter");
    const overlay = document.getElementById("aromaOverlay");
    const panel = document.getElementById("aromaPanel");
    const chips = document.querySelectorAll(".aroma-chip");
    const applyBtn = document.getElementById("applyAromaFilter");

    openBtn.addEventListener("click", () => {
        overlay.classList.add("show");
        panel.classList.add("show");
    });

    function closePanel() {
        overlay.classList.remove("show");
        panel.classList.remove("show");
    }

    closeBtn.addEventListener("click", closePanel);
    overlay.addEventListener("click", closePanel);

    chips.forEach(chip => {
        chip.addEventListener("click", () => {
            chip.classList.toggle("active");

            const aroma = chip.dataset.aroma;

            if (aromasSeleccionados.includes(aroma)) {
                aromasSeleccionados = aromasSeleccionados.filter(a => a !== aroma);
            } else {
                aromasSeleccionados.push(aroma);
            }
        });
    });

    applyBtn.addEventListener("click", () => {
        mostrandoTodo = false;
        renderPerfumes(filtroActual);
        closePanel();
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
    document.addEventListener("click", cerrarTooltip);

    // Cerrar al hacer scroll
    window.addEventListener("scroll", cerrarTooltip, { once: true });

    // Cerrar al tocar cualquier card
    document.addEventListener("click", detectarClickCard);
}
/*
function mostrarTooltipInicial() {

    if (localStorage.getItem("tooltipVisto")) return;

    const tooltip = document.createElement("div");
    tooltip.classList.add("tooltip-card");
    tooltip.innerHTML = `
        <strong>Tip:</strong><br>
        Toca cualquier perfume para ver su información.
    `;

    document.body.appendChild(tooltip);

    setTimeout(() => {
        tooltip.classList.add("hide");
        localStorage.setItem("tooltipVisto", "true");
        setTimeout(() => tooltip.remove(), 300);
    }, 5000);

    window.addEventListener("scroll", () => {
        tooltip.classList.add("hide");
        setTimeout(() => tooltip.remove(), 500);
    });

    document.addEventListener("click", () => {
        tooltip.classList.add("hide");
        setTimeout(() => tooltip.remove(), 500);
    });
}

mostrarTooltipInicial();
*/
