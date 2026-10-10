(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fmt = function (n) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n); };
  var STORE = {}, PRODUCTS = [];

  /* ---------- Données ---------- */
  function expand(p) {
    p.variants = p.shades.map(function (s, i) {
      return { id: p.handle + '-' + i, title: s[0], color: s[1], sku: p.sku + '-' + String(i + 1).padStart(2, '0'), price: p.price };
    });
    return p;
  }
  function byHandle(h) { return PRODUCTS.filter(function (p) { return p.handle === h; })[0]; }
  function art(p, vi, label) {
    return Art.render(p.art, p.variants[vi || 0].color, { pans: p.pans, label: label || p.title });
  }

  /* ---------- Panier (localStorage) ---------- */
  var Cart = {
    items: [],
    load: function () { try { this.items = JSON.parse(localStorage.getItem('velora-cart')) || []; } catch (e) { this.items = []; } },
    save: function () { try { localStorage.setItem('velora-cart', JSON.stringify(this.items)); } catch (e) {} this.render(); },
    add: function (handle, vi, q) {
      var it = this.items.filter(function (i) { return i.handle === handle && i.vi === vi; })[0];
      if (it) it.qty += q; else this.items.push({ handle: handle, vi: vi, qty: q });
      this.save(); this.open();
    },
    change: function (idx, d) {
      var it = this.items[idx]; if (!it) return;
      it.qty += d; if (it.qty <= 0) this.items.splice(idx, 1);
      this.save();
    },
    count: function () { return this.items.reduce(function (a, i) { return a + i.qty; }, 0); },
    total: function () { return this.items.reduce(function (a, i) { var p = byHandle(i.handle); return a + (p ? p.price * i.qty : 0); }, 0); },
    open: function () { document.body.classList.add('cart-open'); },
    close: function () { document.body.classList.remove('cart-open'); },
    render: function () {
      var n = this.count();
      $$('.cart-count').forEach(function (e) { e.textContent = n; e.hidden = !n; });
      var box = $('#cart-items'); if (!box) return;
      var from = STORE.freeShippingFrom || 60, t = this.total();
      $('#cart-ship').innerHTML = t >= from
        ? '🎉 Livraison offerte !'
        : 'Plus que <strong>' + fmt(from - t) + '</strong> pour la livraison offerte';
      $('#cart-bar').style.width = Math.min(100, t / from * 100) + '%';
      box.innerHTML = this.items.length ? this.items.map(function (it, idx) {
        var p = byHandle(it.handle); if (!p) return '';
        var v = p.variants[it.vi] || p.variants[0];
        return '<li class="ci"><a class="ci-img" href="product.html?handle=' + p.handle + '">' + art(p, it.vi) + '</a>' +
          '<div class="ci-info"><a href="product.html?handle=' + p.handle + '">' + p.title + '</a>' +
          '<small>' + v.title + '</small>' +
          '<div class="qty sm"><button data-q="-1" data-i="' + idx + '" aria-label="Moins">−</button><span>' + it.qty + '</span><button data-q="1" data-i="' + idx + '" aria-label="Plus">+</button></div></div>' +
          '<strong>' + fmt(p.price * it.qty) + '</strong></li>';
      }).join('') : '<li class="empty">Votre panier est vide.<br><a href="index.html#boutique" class="btn btn-line">Découvrir la boutique</a></li>';
      $('#cart-total').textContent = fmt(t);
      $('#checkout').disabled = !this.items.length;
    }
  };

  /* ---------- Layout commun ---------- */
  function layout() {
    var cats = ['Lèvres', 'Yeux', 'Teint', 'Accessoires', 'Coffrets'];
    var head = '<div class="topbar">Livraison offerte dès 60 € · Échantillons offerts dès 40 € d\'achat</div>' +
      '<header class="header"><div class="wrap hrow">' +
      '<button class="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>' +
      '<a class="logo" href="index.html">VELORA<small>BEAUTY</small></a>' +
      '<nav class="nav" id="nav">' + cats.map(function (c) { return '<a href="index.html?cat=' + encodeURIComponent(c) + '#boutique">' + c + '</a>'; }).join('') +
      '<a href="index.html?cat=Promo#boutique" class="hot">Promos</a></nav>' +
      '<button class="cart-btn" aria-label="Ouvrir le panier"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8zM9 8V6a3 3 0 0 1 6 0v2"/></svg><span class="cart-count" hidden>0</span></button>' +
      '</div></header>';
    var foot = '<footer class="footer"><div class="wrap fgrid">' +
      '<div><a class="logo light" href="index.html">VELORA<small>BEAUTY</small></a><p>Maquillage haute performance, vegan et cruelty-free. Fait pour sublimer toutes les beautés.</p></div>' +
      '<div><h4>Boutique</h4>' + cats.map(function (c) { return '<a href="index.html?cat=' + encodeURIComponent(c) + '#boutique">' + c + '</a>'; }).join('') + '</div>' +
      '<div><h4>Aide</h4><a href="#">Livraison &amp; retours</a><a href="#">Nous contacter</a><a href="#">FAQ</a><a href="#">Mentions légales</a></div>' +
      '<div><h4>Suivez-nous</h4><a href="#">Instagram</a><a href="#">TikTok</a><a href="#">YouTube</a></div>' +
      '</div><div class="copy">© ' + new Date().getFullYear() + ' Velora Beauty · Site vitrine de démonstration</div></footer>' +
      '<div class="overlay"></div><aside class="drawer" aria-label="Panier"><div class="dh"><h3>Votre panier</h3><button class="x" aria-label="Fermer">×</button></div>' +
      '<div class="ship"><div id="cart-ship"></div><div class="bar"><i id="cart-bar"></i></div></div>' +
      '<ul id="cart-items"></ul><div class="df"><div class="tot"><span>Sous-total</span><strong id="cart-total"></strong></div>' +
      '<button class="btn btn-dark" id="checkout">Commander</button><small>Démo : le paiement sera géré par Shopify.</small></div></aside>';
    document.body.insertAdjacentHTML('afterbegin', head);
    document.body.insertAdjacentHTML('beforeend', foot);
    $('.burger').onclick = function () {
      var o = document.body.classList.toggle('menu-open'); this.setAttribute('aria-expanded', o);
    };
    $$('.nav a').forEach(function (a) { a.addEventListener('click', function () { document.body.classList.remove('menu-open'); }); });
    $('.cart-btn').onclick = function () { Cart.open(); };
    $('.overlay').onclick = $('.drawer .x').onclick = function () { Cart.close(); };
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') Cart.close(); });
    $('#cart-items').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-q]'); if (b) Cart.change(+b.dataset.i, +b.dataset.q);
    });
    $('#checkout').onclick = function () {
      alert('Démo : sur la version Shopify, ce bouton mène au paiement sécurisé.');
    };
  }

  /* ---------- Cartes produit ---------- */
  function card(p) {
    var sw = p.variants.slice(0, 5).map(function (v, i) {
      return '<button class="sw' + (i ? '' : ' on') + '" data-vi="' + i + '" style="background:' + v.color + '" title="' + v.title + '" aria-label="' + v.title + '"></button>';
    }).join('') + (p.variants.length > 5 ? '<span class="more">+' + (p.variants.length - 5) + '</span>' : '');
    return '<article class="card" data-handle="' + p.handle + '">' +
      '<a class="cimg" href="product.html?handle=' + p.handle + '">' + (p.badge ? '<span class="badge">' + p.badge + '</span>' : '') + art(p, 0) + '</a>' +
      '<div class="cbody"><small class="ctype">' + p.type + '</small>' +
      '<h3><a href="product.html?handle=' + p.handle + '">' + p.title + '</a></h3>' +
      '<div class="cprice">' + fmt(p.price) + (p.compareAt ? ' <s>' + fmt(p.compareAt) + '</s>' : '') + '</div>' +
      '<div class="sws">' + sw + '</div>' +
      '<button class="btn btn-dark add" data-vi="0">Ajouter au panier</button></div></article>';
  }
  function bindCards(root) {
    root.addEventListener('click', function (e) {
      var c = e.target.closest('.card'); if (!c) return;
      var p = byHandle(c.dataset.handle), vi = +(c.dataset.vi || 0);
      var s = e.target.closest('.sw');
      if (s) {
        vi = +s.dataset.vi; c.dataset.vi = vi;
        $$('.sw', c).forEach(function (x) { x.classList.toggle('on', x === s); });
        $('.cimg svg', c).outerHTML = art(p, vi);
      } else if (e.target.closest('.add')) {
        Cart.add(p.handle, vi, 1);
      }
    });
  }

  /* ---------- Page d'accueil ---------- */
  function home() {
    var heroArt = $('#hero-art');
    if (heroArt) {
      var pick = ['palette-desert-dore', 'rouge-velours-liquide-mat', 'gloss-cristal-volume'];
      heroArt.innerHTML = pick.map(function (h, i) {
        var p = byHandle(h); return '<div class="h' + i + '">' + art(p, 0) + '</div>';
      }).join('');
    }
    var cat = new URLSearchParams(location.search).get('cat') || 'Tout';
    var sort = 'pop';
    var grid = $('#grid'), chips = $('#chips');
    var cats = ['Tout', 'Lèvres', 'Yeux', 'Teint', 'Accessoires', 'Coffrets', 'Promo'];
    chips.innerHTML = cats.map(function (c) { return '<button class="chip" data-c="' + c + '">' + c + '</button>'; }).join('');
    function draw() {
      $$('.chip', chips).forEach(function (b) { b.classList.toggle('on', b.dataset.c === cat); });
      var list = PRODUCTS.filter(function (p) {
        return cat === 'Tout' || (cat === 'Promo' ? !!p.compareAt : p.type === cat);
      });
      if (sort === 'asc') list.sort(function (a, b) { return a.price - b.price; });
      if (sort === 'desc') list.sort(function (a, b) { return b.price - a.price; });
      grid.innerHTML = list.length ? list.map(card).join('') : '<p class="empty">Aucun produit dans cette catégorie.</p>';
      $('#count').textContent = list.length + ' produit' + (list.length > 1 ? 's' : '');
    }
    chips.onclick = function (e) { var b = e.target.closest('.chip'); if (b) { cat = b.dataset.c; draw(); } };
    $('#sort').onchange = function () { sort = this.value; draw(); };
    bindCards(grid);
    draw();
    var nf = $('#news'); if (nf) nf.onsubmit = function (e) {
      e.preventDefault(); nf.innerHTML = '<p class="ok">Merci ! Vous êtes bien inscrite ✨ (démo)</p>';
    };
  }

  /* ---------- Page produit ---------- */
  function productPage() {
    var h = new URLSearchParams(location.search).get('handle');
    var p = byHandle(h), root = $('#product');
    if (!p) { root.innerHTML = '<div class="wrap"><p class="empty">Produit introuvable. <a href="index.html">Retour à la boutique</a></p></div>'; return; }
    document.title = p.title + ' – Velora Beauty';
    var vi = 0, q = 1;
    function draw() {
      var v = p.variants[vi];
      root.innerHTML = '<div class="wrap pgrid">' +
        '<div class="pimg">' + (p.badge ? '<span class="badge">' + p.badge + '</span>' : '') + art(p, vi) + '</div>' +
        '<div class="pinfo"><nav class="crumb"><a href="index.html">Accueil</a> / <a href="index.html?cat=' + encodeURIComponent(p.type) + '#boutique">' + p.type + '</a></nav>' +
        '<h1>' + p.title + '</h1>' +
        '<div class="pprice">' + fmt(p.price) + (p.compareAt ? ' <s>' + fmt(p.compareAt) + '</s>' : '') + '</div>' +
        '<p class="lead">' + p.short + '</p>' +
        '<div class="opt"><span>Teinte : <strong>' + v.title + '</strong></span><div class="pws">' +
        p.variants.map(function (x, i) { return '<button class="sw lg' + (i === vi ? ' on' : '') + '" data-vi="' + i + '" style="background:' + x.color + '" title="' + x.title + '" aria-label="' + x.title + '"></button>'; }).join('') +
        '</div></div>' +
        '<div class="buy"><div class="qty"><button data-d="-1" aria-label="Moins">−</button><span>' + q + '</span><button data-d="1" aria-label="Plus">+</button></div>' +
        '<button class="btn btn-dark grow" id="addp">Ajouter au panier · ' + fmt(p.price * q) + '</button></div>' +
        '<ul class="perks"><li>🚚 Livraison offerte dès 60 €</li><li>🌿 Vegan &amp; cruelty-free</li><li>↩️ Retours sous 30 jours</li></ul>' +
        '<details open><summary>Description</summary><p>' + p.description + '</p></details>' +
        '<details><summary>Détails</summary><ul class="dl">' + p.details.map(function (d) { return '<li>' + d + '</li>'; }).join('') + '</ul></details>' +
        '<p class="sku">Réf. ' + v.sku + '</p></div></div>';
    }
    root.addEventListener('click', function (e) {
      var s = e.target.closest('.sw'), d = e.target.closest('[data-d]');
      if (s) { vi = +s.dataset.vi; draw(); }
      else if (d) { q = Math.max(1, Math.min(10, q + +d.dataset.d)); draw(); }
      else if (e.target.closest('#addp')) { Cart.add(p.handle, vi, q); }
    });
    draw();
    var rel = PRODUCTS.filter(function (x) { return x.handle !== p.handle; })
      .sort(function (a, b) { return (b.type === p.type) - (a.type === p.type); }).slice(0, 4);
    var r = $('#related'); r.innerHTML = rel.map(card).join(''); bindCards(r);
  }

  /* ---------- Init ---------- */
  fetch('data/products.json').then(function (r) { return r.json(); }).then(function (d) {
    STORE = d.store; PRODUCTS = d.products.map(expand);
    Cart.load(); layout(); Cart.render();
    var page = document.body.dataset.page;
    if (page === 'home') home(); else if (page === 'product') productPage();
  }).catch(function (e) {
    document.body.insertAdjacentHTML('afterbegin', '<p style="padding:2rem;text-align:center">Impossible de charger le catalogue. Lancez le site via un serveur (voir README).</p>');
    console.error(e);
  });
})();
