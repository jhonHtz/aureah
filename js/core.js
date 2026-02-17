// ===== VARIABLES GLOBALES =====

let mostrandoTodo = false;
let filtroActual = "all";
const LIMITE = 20;

/* =================================================
   UTILIDAD ADMIN
================================================= */

// ===== ADMIN MODE =====

function isAdminMode() {
    return window.location.search.includes("admin=aurea117");
}

// ===== PERFUMES ACTUALES (BASE + EDICIONES) =====

function obtenerPerfumesActuales() {

    let perfumesExtra = JSON.parse(localStorage.getItem("perfumesExtra")) || [];

    let mapaEditados = {};
    perfumesExtra.forEach(p => {
        mapaEditados[p.id] = p;
    });

    let baseActualizada = perfumes.map(p =>
        mapaEditados[p.id] || p
    );

    let nuevos = perfumesExtra.filter(p =>
        !perfumes.some(base => base.id === p.id)
    );

    return [...baseActualizada, ...nuevos];
}
