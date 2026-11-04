/* Viamar · barra de reserva fixa para telemóvel nas páginas interiores.
 * (A index tem a sua própria, no HTML.) Aparece depois de 320 px de scroll,
 * esconde-se enquanto o aviso de cookies ou o menu estão abertos.
 * O tracking de cliques é feito pelo listener global de cada página
 * (qualquer <a href*="fareharbor.com/embeds/book">). */
(function () {
  'use strict';
  if (document.getElementById('ctaSticky')) return;
  var T = {
    pt: ['Época 2027 · Berlenga', 'desde', 'reservas abertas', 'Reservar 2027 →'],
    en: ['2027 season · Berlenga', 'from', 'bookings open', 'Book 2027 →'],
    es: ['Temporada 2027 · Berlenga', 'desde', 'reservas abiertas', 'Reservar 2027 →'],
    fr: ['Saison 2027 · Berlenga', 'depuis', 'réservations ouvertes', 'Réserver 2027 →']
  };
  var FH = { pt: 'pt-pt', en: 'en-us', es: 'es-es', fr: 'fr-fr' };
  function build() {
    var l = (document.documentElement.getAttribute('data-lang') || document.documentElement.lang || 'pt').slice(0, 2).toLowerCase();
    if (!T[l]) l = 'pt';
    var t = T[l];
    var css = document.createElement('style');
    css.textContent =
      '.cta-sticky{position:fixed;left:0;right:0;bottom:0;z-index:480;display:none;align-items:center;gap:12px;background:#07111f;border-top:1px solid rgba(6,182,212,.28);padding:11px 14px calc(11px + env(safe-area-inset-bottom));transform:translateY(120%);transition:transform .35s cubic-bezier(.22,1,.36,1);box-shadow:0 -10px 30px rgba(0,0,0,.35);font-family:inherit}' +
      '.cta-sticky.show{transform:none}.cta-sticky .cs-info{flex:1;min-width:0;line-height:1.25}' +
      '.cta-sticky .cs-l1{font-size:11px;color:#7fd3e6;font-weight:700;letter-spacing:.04em;text-transform:uppercase}' +
      '.cta-sticky .cs-l2{font-size:15px;color:#fff;font-weight:800;display:flex;align-items:baseline;gap:6px;flex-wrap:wrap}' +
      '.cta-sticky .cs-from,.cta-sticky .cs-note{font-size:11px;color:#b4c4d6;font-weight:600}' +
      '.cta-sticky .cs-btn{flex:none;background:#f59e0b;color:#3a2400;font-weight:800;font-size:14.5px;padding:13px 20px;border-radius:11px;text-decoration:none;white-space:nowrap;box-shadow:0 6px 18px rgba(245,158,11,.4)}' +
      '@media(max-width:768px){.cta-sticky{display:flex}body{padding-bottom:calc(72px + env(safe-area-inset-bottom))}}' +
      'body:has(.cookie-banner:not(.hidden)) .cta-sticky,body.menu-open .cta-sticky,body.nav-open .cta-sticky{transform:translateY(120%)!important}';
    document.head.appendChild(css);
    var b = document.createElement('div');
    b.className = 'cta-sticky'; b.id = 'ctaSticky';
    b.innerHTML = '<div class="cs-info"><div class="cs-l1">' + t[0] + '</div><div class="cs-l2"><span class="cs-from">' + t[1] + '</span> 19,90€ <span class="cs-note">' + t[2] + '</span></div></div>' +
      '<a class="cs-btn" href="https://fareharbor.com/embeds/book/viamar-berlenga/items/?full-items=yes&flow=738388&language=' + FH[l] + '">' + t[3] + '</a>';
    document.body.appendChild(b);
    function tick() { b.classList.toggle('show', window.scrollY > 320); }
    window.addEventListener('scroll', tick, { passive: true });
    tick();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
