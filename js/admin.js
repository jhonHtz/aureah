/* =================================================
   MODAL ADMIN
================================================= */
function initAdminModal() {

    if (!isAdminMode()) return;

    const btn = document.getElementById("adminToggle");
    const modal = document.getElementById("adminModal");
    const closeBtn = document.querySelector(".close-admin");

    if (btn) btn.style.display = "block";

    btn?.addEventListener("click", () => {
        modal.style.display = "flex";
    });

    closeBtn?.addEventListener("click", () => {
        modal.style.display = "none";
    });
}
/* =================================================
   CALCULO DESCUENTO
================================================= */
function initDiscountCalculation() {

    const original = document.getElementById("adminPrecioOriginal");
    const final = document.getElementById("adminPrecioFinal");
    const discount = document.getElementById("adminDescuento");

    if (!original || !final) return;

    function calculate() {

        const o = parseFloat(original.value);
        const f = parseFloat(final.value);

        if (o && f && f < o) {
            const percent = Math.round(((o - f) / o) * 100);
            discount.value = percent + "%";
        } else {
            discount.value = "";
        }
    }

    original.addEventListener("input", calculate);
    final.addEventListener("input", calculate);
}
/* =================================================
   CARGAR IMAGENES
================================================= */
function loadImageGrid() {

    const grid = document.getElementById("adminImageGrid");
    const hiddenInput = document.getElementById("adminImagen");
    const preview = document.getElementById("selectedImagePreview");

    if (!grid || typeof imagenesDisponibles === "undefined") return;

    grid.innerHTML = "";

    imagenesDisponibles.forEach(nombreArchivo => {

        const ruta = "assets/img/perfumes/" + nombreArchivo;

        const item = document.createElement("div");
        item.classList.add("admin-image-item");

        item.innerHTML = `
            <img src="${ruta}">
            <span>${nombreArchivo}</span>
        `;

        item.addEventListener("click", () => {

            hiddenInput.value = ruta;

            preview.innerHTML = `
                <img src="${ruta}">
                <small>${nombreArchivo}</small>
            `;

            document.getElementById("imageSelectorModal").style.display = "none";
        });

        grid.appendChild(item);
    });
}
function initImageSelectorModal() {

    const openBtn = document.getElementById("openImageSelector");
    const modal = document.getElementById("imageSelectorModal");
    const closeBtn = document.querySelector(".close-image-selector");

    if (!openBtn) return;

    openBtn.addEventListener("click", () => {
        modal.style.display = "flex";
    });

    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });
}
/* =================================================
   SISTEMA DE TAGS (NOTAS)
================================================= */
let notasSeleccionadas = {
    salida: [],
    corazon: [],
    fondo: []
};
function initTagsSystem() {
    function normalizarTexto(texto) {
    return texto
        .normalize("NFD")                // separa letras y tildes
        .replace(/[\u0300-\u036f]/g, "") // elimina tildes
        .toLowerCase();
}

    const inputs = document.querySelectorAll(".tag-input");

    if (!inputs.length) return;

    inputs.forEach(input => {

        const tipo = input.dataset.tipo;
        const dropdown = document.querySelector(`.tag-dropdown[data-tipo="${tipo}"]`);
        const container = document.querySelector(`.tag-container[data-tipo="${tipo}"]`);

        input.addEventListener("input", () => {

            const value = normalizarTexto(input.value);
            dropdown.innerHTML = "";

            if (!value) {
                dropdown.style.display = "none";
                return;
            }

            const resultados = Object.keys(notasDisponibles)
                .filter(nota =>
                    normalizarTexto(nota).includes(value) &&
                    !notasSeleccionadas[tipo].includes(nota)
                );

            resultados.forEach(nota => {

                const option = document.createElement("div");
                option.classList.add("tag-option");
                option.textContent = nota;

                option.addEventListener("click", () => {
                    addTag(nota, tipo, container);
                    input.value = "";
                    dropdown.style.display = "none";
                });

                dropdown.appendChild(option);
            });

            dropdown.style.display = resultados.length ? "block" : "none";
        });

    });
}
function addTag(nota, tipo, container) {

    if (notasSeleccionadas[tipo].includes(nota)) return;

    notasSeleccionadas[tipo].push(nota);

    const tag = document.createElement("div");
    tag.classList.add("tag");
    tag.innerHTML = `${nota} <span>&times;</span>`;

    tag.querySelector("span").addEventListener("click", () => {
        notasSeleccionadas[tipo] =
            notasSeleccionadas[tipo].filter(n => n !== nota);
        tag.remove();
    });

    container.appendChild(tag);
}
/* =================================================
   GUARDAR PERFUME DESDE MODAL
================================================= */
function initAdminSubmit() {

    const form = document.getElementById("adminForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {

        e.preventDefault();

        const disponible = document.getElementById("adminDisponible").value === "true";
        const marca = document.getElementById("adminMarca").value;
        const nombre = document.getElementById("adminNombre").value;
        const subtitulo = document.getElementById("adminSubtitulo").value;
        const imagen = document.getElementById("adminImagen").value;
        const precioOriginal = parseFloat(document.getElementById("adminPrecioOriginal").value);
        const precioFinal = parseFloat(document.getElementById("adminPrecioFinal").value);
        const genero = document.getElementById("adminGenero").value;

        if (!precioFinal || precioFinal >= precioOriginal) {
            alert("El precio final debe ser menor al original.");
            return;
        }
        const id = window.editingPerfumeId || Date.now();
        const nuevoPerfume = {
            id,
            marca,
            nombre,
            subtitulo,
            genero, 
            precioOriginal,
            precioFinal,
            imagen,
            notas: notasSeleccionadas,
            uso: usoSeleccionado,
            disponible
        };

        let perfumesGuardados = JSON.parse(localStorage.getItem("perfumesExtra")) || [];

        if (window.editingPerfumeId) {

            const index = perfumesGuardados.findIndex(p => p.id === window.editingPerfumeId);

            if (index !== -1) {
                // Ya existe en localStorage → reemplazar
                perfumesGuardados[index] = nuevoPerfume;
            } else {
                // Es perfume base → agregar como edición
                perfumesGuardados.push(nuevoPerfume);
            }

            window.editingPerfumeId = null;

        } else {
            perfumesGuardados.push(nuevoPerfume);
        }

        localStorage.setItem("perfumesExtra", JSON.stringify(perfumesGuardados));

        alert("Perfume agregado correctamente.");
        form.reset();
        location.reload();
    });
}
/*************** MANTENER LA INFORMACIÓN DEL PERFUME *********************/
function resetAdminState() {

    notasSeleccionadas = {
        salida: [],
        corazon: [],
        fondo: []
    };

    usoSeleccionado = {};

    document.querySelectorAll(".tag-container").forEach(c => c.innerHTML = "");
}

const usoTipos = ["primavera","verano","otono","invierno","dia","noche"];

let usoSeleccionado = {};

function initUsoAdmin() {

    const grid = document.getElementById("usoAdminGrid");
    if (!grid) return;

    usoTipos.forEach(tipo => {

        usoSeleccionado[tipo] = {
            porcentaje: 50,
            activo: false
        };

        const item = document.createElement("div");
        item.classList.add("uso-admin-item");

        item.innerHTML = `
            <div class="uso-admin-icon ${tipo}">
                ${iconsUso[tipo]}
            </div>

            <input type="range" min="0" max="100" value="50" class="uso-range">

            <span class="uso-range-value">50%</span>
        `;

        const iconContainer = item.querySelector(".uso-admin-icon");
        const range = item.querySelector(".uso-range");
        const value = item.querySelector(".uso-range-value");
        

        // Toggle activo al hacer click en ícono
        iconContainer.addEventListener("click", () => {
            usoSeleccionado[tipo].activo = !usoSeleccionado[tipo].activo;
            iconContainer.classList.toggle("activo");
        });

        // Actualizar porcentaje
        range.addEventListener("input", () => {
            value.textContent = range.value + "%";
            usoSeleccionado[tipo].porcentaje = parseInt(range.value);
        });

        grid.appendChild(item);
    });
}
function initExportPerfumes() {

    const btn = document.getElementById("exportPerfumesBtn");
    if (!btn) return;

    function actualizarTextoBoton() {
        let perfumesActuales = obtenerPerfumesActuales();
        btn.textContent = `Descargar perfumes.js (${perfumesActuales.length})`;
    }

    actualizarTextoBoton();

    btn.addEventListener("click", () => {

        let perfumesFinales = obtenerPerfumesActuales();

        if (!perfumesFinales.length) {
            alert("No hay perfumes para exportar.");
            return;
        }

        const confirmar = confirm(
            "Se descargará perfumes.js con todos los cambios.\n\n¿Deseas continuar y limpiar las ediciones locales después?"
        );

        if (!confirmar) return;

        const contenido =
`const perfumes = ${JSON.stringify(perfumesFinales, null, 4)};`;

        const blob = new Blob([contenido], { type: "text/javascript" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "perfumes.js";
        a.click();

        URL.revokeObjectURL(url);

        // 🔥 Limpiar localStorage después de exportar
        localStorage.removeItem("perfumesExtra");

        // Recargar para volver a estado base limpio
        setTimeout(() => {
            location.reload();
        }, 500);
    });
}
