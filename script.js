/* =================================================
   INICIALIZACION GLOBAL
================================================= */
document.addEventListener("DOMContentLoaded", () => {

    if (typeof initCatalogo === "function") initCatalogo();
    if (typeof initScrollTopButton === "function") initScrollTopButton();
    if (typeof initAdminModal === "function") initAdminModal();
    if (typeof initDiscountCalculation === "function") initDiscountCalculation();
    if (typeof initImageSelectorModal === "function") initImageSelectorModal();
    if (typeof loadImageGrid === "function") loadImageGrid();
    if (typeof initTagsSystem === "function") initTagsSystem();
    if (typeof initUsoAdmin === "function") initUsoAdmin();
    if (typeof initExportPerfumes === "function") initExportPerfumes();
    if (typeof initAdminSubmit === "function") initAdminSubmit();
    if (typeof renderDetallePerfume === "function") renderDetallePerfume();
    if (typeof initWelcomeTooltip === "function") initWelcomeTooltip();
    if (typeof actualizarContadorCarrito === "function") actualizarContadorCarrito();
    if (typeof renderCarrito === "function") renderCarrito();
    
});
/* =================================================
   SINCRONIZAR AL VOLVER CON BOTÓN ATRÁS (MÓVIL)
================================================= */

window.addEventListener("pageshow", function () {

    // Actualizar contador siempre
    if (typeof actualizarContadorCarrito === "function") {
        actualizarContadorCarrito();
    }

    // Si estamos en carrito, volver a renderizar
    if (typeof renderCarrito === "function") {
        renderCarrito();
    }

});
