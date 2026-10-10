/* Illustrations SVG des produits (aucune image externe, aucun droit à gérer).
   Remplaçables par de vraies photos au moment de la migration Shopify. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Art = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var GOLD = '#c9a24b', GOLD2 = '#f1d98f', BLACK = '#171717';

  function mix(hex, to, amt) {
    var h = hex.replace('#', '');
    var c = [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); });
    var t = to === 'w' ? 255 : 0;
    return '#' + c.map(function (v) {
      return ('0' + Math.round(v + (t - v) * amt).toString(16)).slice(-2);
    }).join('');
  }

  function defs(id, color) {
    return '<defs>' +
      '<linearGradient id="bg' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + mix(color, 'w', 0.9) + '"/><stop offset="1" stop-color="' + mix(color, 'w', 0.72) + '"/></linearGradient>' +
      '<linearGradient id="g' + id + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + GOLD + '"/><stop offset=".45" stop-color="' + GOLD2 + '"/><stop offset="1" stop-color="' + GOLD + '"/></linearGradient>' +
      '<linearGradient id="k' + id + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a2a2a"/><stop offset=".4" stop-color="#4a4a4a"/><stop offset="1" stop-color="#121212"/></linearGradient>' +
      '</defs>';
  }

  var shapes = {
    lipstick: function (c, id) {
      return '<ellipse cx="200" cy="352" rx="70" ry="9" fill="#000" opacity=".12"/>' +
        '<rect x="168" y="232" width="64" height="116" rx="6" fill="url(#g' + id + ')"/>' +
        '<rect x="163" y="205" width="74" height="32" rx="4" fill="url(#k' + id + ')"/>' +
        '<path d="M176 205V142q0-8 8-11l40-16v90z" fill="' + c + '"/>' +
        '<path d="M184 205V145l10-4v64z" fill="#fff" opacity=".18"/>';
    },
    gloss: function (c, id) {
      return '<ellipse cx="200" cy="352" rx="60" ry="8" fill="#000" opacity=".12"/>' +
        '<rect x="176" y="165" width="48" height="185" rx="12" fill="' + c + '" opacity=".92"/>' +
        '<rect x="183" y="175" width="9" height="160" rx="4" fill="#fff" opacity=".35"/>' +
        '<rect x="172" y="150" width="56" height="26" rx="4" fill="url(#g' + id + ')"/>' +
        '<rect x="176" y="86" width="48" height="68" rx="8" fill="url(#k' + id + ')"/>';
    },
    liner: function (c, id) {
      return '<g transform="rotate(-38 200 210)">' +
        '<rect x="184" y="70" width="32" height="240" rx="3" fill="url(#k' + id + ')"/>' +
        '<rect x="184" y="150" width="32" height="12" fill="url(#g' + id + ')"/>' +
        '<path d="M184 310h32l-16 44z" fill="#e8cfa8"/>' +
        '<path d="M193 338h14l-7 16z" fill="' + c + '"/></g>';
    },
    eyeliner: function (c, id) {
      return '<g transform="rotate(-40 200 210)">' +
        '<rect x="188" y="70" width="24" height="230" rx="10" fill="url(#k' + id + ')"/>' +
        '<rect x="188" y="200" width="24" height="9" fill="url(#g' + id + ')"/>' +
        '<path d="M193 300h14l-3 44h-8z" fill="#2b2b2b"/>' +
        '<path d="M198 338h4l-2 14z" fill="' + c + '"/></g>';
    },
    mascara: function (c, id) {
      return '<ellipse cx="200" cy="354" rx="55" ry="8" fill="#000" opacity=".12"/>' +
        '<rect x="176" y="190" width="48" height="162" rx="10" fill="url(#k' + id + ')"/>' +
        '<rect x="176" y="250" width="48" height="12" fill="url(#g' + id + ')"/>' +
        '<rect x="184" y="84" width="32" height="112" rx="8" fill="url(#k' + id + ')"/>' +
        '<rect x="180" y="180" width="40" height="14" rx="3" fill="url(#g' + id + ')"/>';
    },
    foundation: function (c, id) {
      return '<ellipse cx="200" cy="354" rx="75" ry="9" fill="#000" opacity=".12"/>' +
        '<rect x="153" y="188" width="94" height="162" rx="18" fill="' + mix(c, 'w', 0.55) + '" opacity=".6"/>' +
        '<rect x="153" y="228" width="94" height="122" rx="18" fill="' + c + '"/>' +
        '<rect x="163" y="200" width="9" height="140" rx="4" fill="#fff" opacity=".4"/>' +
        '<rect x="184" y="150" width="32" height="42" fill="url(#g' + id + ')"/>' +
        '<rect x="191" y="108" width="18" height="46" rx="3" fill="url(#k' + id + ')"/>' +
        '<rect x="191" y="104" width="44" height="12" rx="5" fill="url(#k' + id + ')"/>';
    },
    concealer: function (c, id) {
      return '<ellipse cx="200" cy="354" rx="50" ry="8" fill="#000" opacity=".12"/>' +
        '<rect x="182" y="190" width="36" height="160" rx="8" fill="url(#k' + id + ')"/>' +
        '<rect x="182" y="258" width="36" height="22" fill="' + c + '"/>' +
        '<rect x="186" y="150" width="28" height="44" fill="url(#g' + id + ')"/>' +
        '<path d="M190 150l10-52 10 52z" fill="' + c + '"/>';
    },
    blush: function (c, id) { return compact(c, id, 'round', false); },
    highlighter: function (c, id) { return compact(c, id, 'round', true); },
    contour: function (c, id) {
      return '<ellipse cx="200" cy="332" rx="140" ry="10" fill="#000" opacity=".12"/>' +
        '<rect x="62" y="118" width="276" height="200" rx="18" fill="url(#k' + id + ')"/>' +
        '<rect x="62" y="118" width="276" height="200" rx="18" fill="none" stroke="url(#g' + id + ')" stroke-width="4"/>' +
        '<rect x="82" y="138" width="116" height="160" rx="10" fill="' + mix(c, 'w', 0.25) + '"/>' +
        '<rect x="206" y="138" width="116" height="160" rx="10" fill="' + mix(c, 'k', 0.3) + '"/>';
    },
    palette: function (c, id, o) {
      var pans = o.pans || 12, rows = 3, cols = Math.ceil(pans / rows);
      var W = 280, H = 210, x0 = 60, y0 = 105, pad = 18, gap = 7;
      var pw = (W - pad * 2 - gap * (cols - 1)) / cols, ph = (H - pad * 2 - gap * (rows - 1)) / rows;
      var out = '<ellipse cx="200" cy="332" rx="150" ry="10" fill="#000" opacity=".12"/>' +
        '<rect x="' + x0 + '" y="' + y0 + '" width="' + W + '" height="' + H + '" rx="16" fill="url(#k' + id + ')"/>' +
        '<rect x="' + x0 + '" y="' + y0 + '" width="' + W + '" height="' + H + '" rx="16" fill="none" stroke="url(#g' + id + ')" stroke-width="4"/>';
      for (var i = 0; i < pans; i++) {
        var r = Math.floor(i / cols), k = i % cols;
        var t = ((i * 37) % 100) / 100;
        var col = t < 0.34 ? mix(c, 'w', 0.15 + t) : t < 0.67 ? mix(c, 'k', t - 0.3) : mix(c, 'w', 0.6 - (t - 0.67));
        out += '<rect x="' + (x0 + pad + k * (pw + gap)) + '" y="' + (y0 + pad + r * (ph + gap)) + '" width="' + pw + '" height="' + ph + '" rx="5" fill="' + col + '"/>';
        if (i % 4 === 1) out += '<rect x="' + (x0 + pad + k * (pw + gap)) + '" y="' + (y0 + pad + r * (ph + gap)) + '" width="' + pw + '" height="' + (ph / 2) + '" rx="5" fill="#fff" opacity=".18"/>';
      }
      return out;
    },
    brushes: function (c, id) {
      var out = '<ellipse cx="200" cy="352" rx="80" ry="8" fill="#000" opacity=".1"/>';
      [-24, -8, 8, 24].forEach(function (a, i) {
        var bristle = i % 2 ? mix(c, 'w', 0.55) : c;
        out += '<g transform="rotate(' + a + ' 200 350)">' +
          '<rect x="193" y="170" width="14" height="180" rx="6" fill="url(#k' + id + ')"/>' +
          '<rect x="191" y="150" width="18" height="30" fill="url(#g' + id + ')"/>' +
          '<path d="M189 152q-4-44 11-64q15 20 11 64z" fill="' + (c === '#1b1b1b' ? '#3a3a3a' : bristle) + '"/></g>';
      });
      return out;
    },
    gift: function (c, id) {
      return '<ellipse cx="200" cy="344" rx="130" ry="10" fill="#000" opacity=".12"/>' +
        '<rect x="80" y="170" width="240" height="170" rx="10" fill="url(#k' + id + ')"/>' +
        '<rect x="70" y="140" width="260" height="50" rx="8" fill="url(#g' + id + ')"/>' +
        '<rect x="186" y="140" width="28" height="200" fill="' + c + '"/>' +
        '<path d="M200 140c-40-50-80-30-60 0zM200 140c40-50 80-30 60 0z" fill="' + c + '"/>' +
        '<circle cx="200" cy="142" r="12" fill="' + mix(c, 'k', 0.2) + '"/>';
    }
  };

  function compact(c, id, shape, shimmer) {
    var out = '<ellipse cx="200" cy="332" rx="115" ry="9" fill="#000" opacity=".12"/>' +
      '<circle cx="200" cy="218" r="112" fill="url(#k' + id + ')"/>' +
      '<circle cx="200" cy="218" r="112" fill="none" stroke="url(#g' + id + ')" stroke-width="4"/>' +
      '<circle cx="200" cy="218" r="90" fill="' + c + '"/>' +
      '<path d="M120 190a90 90 0 0 1 90-62" stroke="#fff" stroke-width="10" fill="none" opacity=".25" stroke-linecap="round"/>';
    if (shimmer) for (var i = 0; i < 26; i++) {
      var a = i * 2.4, r = 14 + (i * 29) % 70;
      out += '<circle cx="' + (200 + Math.cos(a) * r).toFixed(1) + '" cy="' + (218 + Math.sin(a) * r).toFixed(1) + '" r="' + (1.2 + (i % 3)) + '" fill="#fff" opacity=".55"/>';
    }
    return out;
  }

  var uid = 0;
  function render(type, color, opts) {
    opts = opts || {};
    var id = ++uid, c = color || '#c68b7d';
    var body = (shapes[type] || shapes.lipstick)(c, id, opts);
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" role="img" aria-label="' + (opts.label || 'Produit') + '" preserveAspectRatio="xMidYMid slice">' +
      defs(id, c) + '<rect width="400" height="400" fill="url(#bg' + id + ')"/>' + body + '</svg>';
  }
  return { render: render, mix: mix };
});
