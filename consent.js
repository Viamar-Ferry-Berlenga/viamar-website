/* Viamar · consentimento de cookies (Consent Mode v2 + pixel da Meta)
 *
 * Carrega SÍNCRONO no <head>, antes do gtag e do fbq, para que nenhum
 * pixel dispare antes da escolha do visitante.
 *   • Por omissão tudo fica "denied". O GA4 e o Google Ads só enviam pings
 *     sem cookies (modelação de conversões); a Meta não envia nada.
 *   • "Aceitar" → consent update + fbq('consent','grant') + PageView.
 *   • A escolha fica em localStorage['viamar_cookie'] ('all' | 'essential').
 *   • No rodapé aparece "Cookies", que volta a abrir o aviso (retirar o
 *     consentimento tem de ser tão fácil como dá-lo).
 */
(function () {
  'use strict';
  var KEY = 'viamar_cookie';
  var choice = null;
  try { choice = localStorage.getItem(KEY); } catch (e) {}

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  var G = { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' };
  var D = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' };
  gtag('consent', 'default', choice === 'all' ? G : Object.assign({ wait_for_update: 500 }, D));
  gtag('set', 'ads_data_redaction', choice !== 'all');
  window.__vConsent = choice === 'all' ? 'grant' : 'revoke';   // lido pelo snippet da Meta

  var TXT = {
    pt: { t: 'Privacidade e cookies', p: 'Usamos cookies de medição e publicidade só com o seu consentimento. Os essenciais funcionam sempre. <a href="/termos.html">Política de privacidade</a>', a: 'Aceitar', r: 'Só essenciais', m: 'Cookies' },
    en: { t: 'Privacy & cookies', p: 'We use measurement and advertising cookies only with your consent. Essential ones always work. <a href="/en/termos.html">Privacy policy</a>', a: 'Accept', r: 'Essential only', m: 'Cookies' },
    es: { t: 'Privacidad y cookies', p: 'Usamos cookies de medición y publicidad solo con tu consentimiento. Las esenciales funcionan siempre. <a href="/es/termos.html">Política de privacidad</a>', a: 'Aceptar', r: 'Solo esenciales', m: 'Cookies' },
    fr: { t: 'Confidentialité et cookies', p: 'Nous n’utilisons les cookies de mesure et de publicité qu’avec votre accord. Les essentiels fonctionnent toujours. <a href="/fr/termos.html">Politique de confidentialité</a>', a: 'Accepter', r: 'Essentiels uniquement', m: 'Cookies' }
  };
  function lang() {
    var l = (document.documentElement.getAttribute('data-lang') || document.documentElement.lang || 'pt').slice(0, 2).toLowerCase();
    return TXT[l] ? l : 'pt';
  }

  function decide(c) {
    try { localStorage.setItem(KEY, c); } catch (e) {}
    var el = document.getElementById('cookieBanner');
    if (el) el.classList.add('hidden');
    if (c === 'all') {
      gtag('consent', 'update', G);
      gtag('set', 'ads_data_redaction', false);
      if (typeof fbq === 'function') { fbq('consent', 'grant'); fbq('track', 'PageView'); }
    } else {
      gtag('consent', 'update', D);
      if (typeof fbq === 'function') fbq('consent', 'revoke');
    }
  }
  window.setCookieChoice = function (c) { decide(c === 'all' ? 'all' : 'essential'); };

  var CSS = '.cookie-banner{position:fixed;left:0;right:0;bottom:0;z-index:500;background:rgba(10,20,40,.98);border-top:1px solid rgba(255,255,255,.12);padding:14px 16px calc(14px + env(safe-area-inset-bottom));display:flex;align-items:center;justify-content:space-between;gap:12px 24px;flex-wrap:wrap;transition:transform .35s ease;font-family:inherit}' +
    '.cookie-banner.hidden{transform:translateY(115%);visibility:hidden}' +
    '.cookie-text{flex:1;min-width:240px}.cookie-text strong{display:block;font-size:13px;font-weight:700;color:#fff;margin-bottom:3px}' +
    '.cookie-text p{font-size:12.5px;color:rgba(255,255,255,.78);line-height:1.5;margin:0}.cookie-text a{color:#67d8ee;text-decoration:underline;text-underline-offset:2px}' +
    '.cookie-actions{display:flex;gap:10px;flex-shrink:0}' +
    '.cookie-accept,.cookie-reject{flex:1;min-height:44px;padding:0 20px;border-radius:10px;font:700 14px/1 inherit;font-family:inherit;cursor:pointer;white-space:nowrap}' +
    '.cookie-accept{background:#22b8d4;color:#0a1428;border:2px solid #22b8d4}.cookie-reject{background:transparent;color:#fff;border:2px solid rgba(255,255,255,.4)}' +
    '@media(max-width:600px){.cookie-actions{width:100%}}' +
    '.cookie-manage{background:none;border:0;color:rgba(255,255,255,.72);font:inherit;font-size:12px;text-decoration:underline;text-underline-offset:2px;cursor:pointer;padding:8px 4px}';

  function build() {
    var t = TXT[lang()];
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var b = document.createElement('div');
    b.className = 'cookie-banner hidden'; b.id = 'cookieBanner';
    b.setAttribute('role', 'dialog'); b.setAttribute('aria-label', t.t);
    b.innerHTML = '<div class="cookie-text"><strong>' + t.t + '</strong><p>' + t.p + '</p></div>' +
      '<div class="cookie-actions"><button type="button" class="cookie-accept">' + t.a + '</button>' +
      '<button type="button" class="cookie-reject">' + t.r + '</button></div>';
    document.body.appendChild(b);
    b.querySelector('.cookie-accept').addEventListener('click', function () { decide('all'); });
    b.querySelector('.cookie-reject').addEventListener('click', function () { decide('essential'); });
    if (!choice) requestAnimationFrame(function () { b.classList.remove('hidden'); });

    var f = document.querySelector('footer');
    if (f) {
      var m = document.createElement('button');
      m.type = 'button'; m.className = 'cookie-manage'; m.textContent = t.m;
      m.addEventListener('click', function () { b.classList.remove('hidden'); });
      var host = f.querySelector('.ft-bottom, .f-bottom, .f-legal') || f;
      host.appendChild(m);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
