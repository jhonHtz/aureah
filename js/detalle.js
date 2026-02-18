/* =================================================
   DETALLE PERFUME
================================================= */

function renderUsoIcon(nombre, data, label) {

    return `
        <div class="uso-item ${nombre} ${data.activo ? "activo" : ""}">
            ${iconsUso[nombre]}
            <span>${label}</span>
            <div class="uso-bar">
                <div class="uso-fill" style="width:${data.porcentaje}%"></div>
            </div>
        </div>
    `;
}

function renderDetallePerfume() {

    const container = document.getElementById("perfumeDetail");
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get("id"));

    let todosPerfumes = obtenerPerfumesActuales();

    const perfume = todosPerfumes.find(p => p.id === id);
    if (!perfume) return;

    let descuento = Math.round(
        ((perfume.precioOriginal - perfume.precioFinal) / perfume.precioOriginal) * 100
    );

    container.innerHTML = `
        <div class="detail-layout">

            <div class="detail-left">
                <div class="detail-image sticky-image">
                    <img src="${perfume.imagen}" alt="${perfume.nombre}">
                </div>
                ${perfume.disponible === false ? `
                    <div class="detail-no-stock">Este perfume está agotado por ahora</div>
                ` : ""}
                
                <div class="detail-basic">
                    <div class="detail-title-block">
                        <div class="detail-main-line">
                            <h2>${perfume.nombre}</h2>
                            ${perfume.subtitulo ? `<span class="detail-sub">${perfume.subtitulo}</span>` : ""}
                        </div>
                        <div class="detail-brand">${perfume.marca}</div>
                    </div>

                    <div class="detail-prices">
                        <span class="detail-final">$${perfume.precioFinal.toLocaleString()}</span>
                        <span class="detail-original">$${perfume.precioOriginal.toLocaleString()}</span>
                        <div class="detail-discount">Ahorra ${descuento}%</div>
                    </div>
                    <button class="detail-add-cart" data-id="${perfume.id}">
                        Agregar al carrito
                    </button>

                </div>
            </div>

            <div class="detail-right">

                ${["salida","corazon","fondo"].map(tipo => `
                    <div class="detail-section">
                        <h4>Notas de ${tipo.charAt(0).toUpperCase()+tipo.slice(1)}</h4>
                        <div class="notes-grid">
                            ${perfume.notas[tipo].map(nota => `
                                <div class="note-item">
                                    <img src="${notasDisponibles[nota]}" alt="${nota}">
                                    <span>${nota}</span>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                `).join("")}

                <div class="detail-section">
                    <h4>¿Cuándo usarlo?</h4>
                    <div class="uso-grid">
                        ${renderUsoIcon("primavera", perfume.uso.primavera, "Primavera")}
                        ${renderUsoIcon("verano", perfume.uso.verano, "Verano")}
                        ${renderUsoIcon("otono", perfume.uso.otono, "Otoño")}
                        ${renderUsoIcon("invierno", perfume.uso.invierno, "Invierno")}
                        ${renderUsoIcon("dia", perfume.uso.dia, "Día")}
                        ${renderUsoIcon("noche", perfume.uso.noche, "Noche")}
                    </div>
                </div>

            </div>
        </div>
    `;
    const addBtn = document.querySelector(".detail-add-cart");
    if (addBtn) {
        addBtn.addEventListener("click", () => {
            agregarAlCarrito(perfume.id);
        });
    }

}