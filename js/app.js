(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fmt = function (n) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n); };
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); };
  var STORE = {}, PRODUCTS = [];

  /* ---------- Données ---------- */
  function expand(p) {
    p.variants = p.shades.map(function (s, i) {
      return { id: p.handle + '-' + i, title: s[0], color: s[1], sku: p.sku + '-' + String(i + 1).padStart(2, '0'), price: p.price };
    });
    return p;
  }
  function byHandle(h) { return PRODUCTS.filter(function (p) { return p.handle === h; })[0]; }
  function tint(hex, amt) {
    var h = hex.replace('#', '');
    return '#' + [0, 2, 4].map(function (i) {
      var v = parseInt(h.substr(i, 2), 16);
      return ('0' + Math.round(v + (255 - v) * amt).toString(16)).slice(-2);
    }).join('');
  }
  /* Photo si disponible, sinon tuile « teinte » */
  function media(p, vi) {
    var img = (p.images && p.images[vi]) || p.image;
    if (img) return '<div class="media"><img src="' + esc(img) + '" alt="' + esc(p.vendor + ' ' + p.title) + '" loading="lazy"></div>';
    var v = p.variants[vi || 0];
    return '<div class="media"><div class="ph" style="--c:' + v.color + ';--t:' + tint(v.color, 0.82) + '">' +
      '<span class="ph-b">' + esc(p.vendor) + '</span><i class="ph-s"></i><span class="ph-n">' + esc(p.title.split(' – ')[0]) + '</span></div></div>';
  }

  /* ---------- Panier (localStorage) ---------- */
  var Cart = {
    items: [],
    load: function () { try { this.items = JSON.parse(localStorage.getItem('zephira-cart')) || []; } catch (e) { this.items = []; } },
    save: function () { try { localStorage.setItem('zephira-cart', JSON.stringify(this.items)); } catch (e) {} this.render(); },
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
    open: function () { document.body.classList.remove('search-open', 'menu-open'); document.body.classList.add('cart-open'); },
    close: function () { document.body.classList.remove('cart-open'); },
    render: function () {
      var n = this.count();
      $$('.cart-count').forEach(function (e) { e.textContent = n; e.hidden = !n; });
      var box = $('#cart-items'); if (!box) return;
      var from = STORE.freeShippingFrom || 60, t = this.total();
      $('#cart-ship').innerHTML = t >= from
        ? 'Livraison offerte sur cette commande.'
        : 'Plus que <strong>' + fmt(from - t) + '</strong> pour la livraison offerte.';
      $('#cart-bar').style.width = Math.min(100, t / from * 100) + '%';
      box.innerHTML = this.items.length ? this.items.map(function (it, idx) {
        var p = byHandle(it.handle); if (!p) return '';
        var v = p.variants[it.vi] || p.variants[0];
        return '<li class="ci"><a class="ci-img" href="product.html?handle=' + p.handle + '">' + media(p, it.vi) + '</a>' +
          '<div class="ci-info"><small>' + esc(p.vendor) + '</small><a href="product.html?handle=' + p.handle + '">' + esc(p.title) + '</a>' +
          '<small>' + esc(v.title) + '</small>' +
          '<div class="qty sm"><button data-q="-1" data-i="' + idx + '" aria-label="Moins">−</button><span>' + it.qty + '</span><button data-q="1" data-i="' + idx + '" aria-label="Plus">+</button></div></div>' +
          '<strong>' + fmt(p.price * it.qty) + '</strong></li>';
      }).join('') : '<li class="empty">Votre panier est vide.<br><a href="index.html#boutique" class="btn btn-line">Découvrir la boutique</a></li>';
      $('#cart-total').textContent = fmt(t);
      $('#checkout').disabled = !this.items.length;
    }
  };

  /* ---------- Layout commun ---------- */
  var ICON_SEARCH = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>';
  var ICON_BAG = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 8h14l-1 12H6zM9 8V6.5a3 3 0 0 1 6 0V8"/></svg>';
  function layout() {
    var cats = ['Lèvres', 'Yeux', 'Teint', 'Accessoires', 'Coffrets'];
    var head = '<div class="topbar">Livraison offerte dès 60 € &nbsp;·&nbsp; Retours sous 30 jours</div>' +
      '<header class="header"><div class="wrap hrow">' +
      '<button class="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span></button>' +
      '<nav class="nav" id="nav">' + cats.map(function (c) {
        var subs = (STORE.subs || {})[c] || [];
        return '<div class="nav-i"><a href="index.html?cat=' + encodeURIComponent(c) + '#boutique">' + c + '</a>' +
          (subs.length ? '<div class="drop">' + subs.map(function (s) { return '<a href="index.html?cat=' + encodeURIComponent(c) + '&sub=' + encodeURIComponent(s) + '#boutique">' + s + '</a>'; }).join('') + '</div>' : '') + '</div>';
      }).join('') +
      '<a href="index.html?cat=Promo#boutique" class="hot">Promos</a></nav>' +
      '<a class="logo" href="index.html">Zéphira<small>Beauty</small></a>' +
      '<div class="hact"><button class="ib search-btn" aria-label="Rechercher">' + ICON_SEARCH + '</button>' +
      '<button class="ib cart-btn" aria-label="Ouvrir le panier">' + ICON_BAG + '<span class="cart-count" hidden>0</span></button></div>' +
      '</div><div class="search"><div class="wrap"><input id="q" type="search" placeholder="Rechercher une marque, un produit…" autocomplete="off" aria-label="Rechercher"><div class="sres" id="sres"></div></div></div></header>';
    var foot = '<footer class="footer"><div class="wrap fgrid">' +
      '<div><a class="logo light" href="index.html">Zéphira<small>Beauty</small></a><p>Votre destination beauté : les plus grandes marques de maquillage, sélectionnées avec soin.</p></div>' +
      '<div><h4>Boutique</h4>' + cats.map(function (c) { return '<a href="index.html?cat=' + encodeURIComponent(c) + '#boutique">' + c + '</a>'; }).join('') + '</div>' +
      '<div><h4>Aide</h4><a href="#">Livraison &amp; retours</a><a href="#">Nous contacter</a><a href="#">FAQ</a><a href="#">Mentions légales</a></div>' +
      '<div><h4>Suivez-nous</h4><a href="#">Instagram</a><a href="#">TikTok</a><a href="#">YouTube</a></div>' +
      '</div><div class="copy">© ' + new Date().getFullYear() + ' Zéphira Beauty · Site en cours de finalisation</div></footer>' +
      '<div class="overlay"></div><aside class="drawer" aria-label="Panier"><div class="dh"><h3>Votre panier</h3><button class="x" aria-label="Fermer">×</button></div>' +
      '<div class="ship"><div id="cart-ship"></div><div class="bar"><i id="cart-bar"></i></div></div>' +
      '<ul id="cart-items"></ul><div class="df"><div class="tot"><span>Sous-total</span><strong id="cart-total"></strong></div>' +
      '<button class="btn btn-dark" id="checkout">Commander</button><small>Le paiement sécurisé sera géré par Shopify.</small></div></aside>';
    document.body.insertAdjacentHTML('afterbegin', head);
    document.body.insertAdjacentHTML('beforeend', foot);
    $('.burger').onclick = function () {
      document.body.classList.remove('search-open');
      var o = document.body.classList.toggle('menu-open'); this.setAttribute('aria-expanded', o);
    };
    $$('.nav a').forEach(function (a) { a.addEventListener('click', function () { document.body.classList.remove('menu-open'); }); });
    $('.cart-btn').onclick = function () { Cart.open(); };
    $('.overlay').onclick = $('.drawer .x').onclick = function () { Cart.close(); };
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { Cart.close(); document.body.classList.remove('search-open'); }
    });
    $('#cart-items').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-q]'); if (b) Cart.change(+b.dataset.i, +b.dataset.q);
    });
    $('#checkout').onclick = function () { alert('Le paiement sera disponible à l\'ouverture de la boutique.'); };
    /* recherche instantanée */
    $('.search-btn').onclick = function () {
      document.body.classList.remove('menu-open');
      var o = document.body.classList.toggle('search-open');
      if (o) setTimeout(function () { $('#q').focus(); }, 50);
    };
    $('#q').oninput = function () {
      var q = this.value.trim().toLowerCase(), out = $('#sres');
      if (q.length < 2) { out.innerHTML = ''; return; }
      var res = PRODUCTS.filter(function (p) { return (p.vendor + ' ' + p.title + ' ' + p.tags.join(' ')).toLowerCase().indexOf(q) > -1; }).slice(0, 8);
      out.innerHTML = res.length ? res.map(function (p) {
        return '<a class="sr" href="product.html?handle=' + p.handle + '"><span class="media-wrap">' + media(p, 0) + '</span><span><small>' + esc(p.vendor) + '</small><b>' + esc(p.title) + '</b></span><em>' + fmt(p.price) + '</em></a>';
      }).join('') : '<p class="empty" style="grid-column:1/-1;padding:16px 0">Aucun résultat pour « ' + esc(q) + ' ».</p>';
    };
  }

  /* ---------- Cartes produit ---------- */
  function card(p) {
    var sw = p.variants.length > 1 ? p.variants.slice(0, 6).map(function (v, i) {
      return '<button class="sw' + (i ? '' : ' on') + '" data-vi="' + i + '" style="background:' + v.color + '" title="' + esc(v.title) + '" aria-label="' + esc(v.title) + '"></button>';
    }).join('') + (p.variants.length > 6 ? '<span class="more">+' + (p.variants.length - 6) + '</span>' : '') : '';
    var badge = p.badge ? '<span class="badge' + (p.compareAt ? ' acc' : '') + '">' + esc(p.badge) + '</span>' : '';
    return '<article class="card" data-handle="' + p.handle + '">' +
      '<a class="cimg" href="product.html?handle=' + p.handle + '">' + badge + media(p, 0) + '</a>' +
      '<div class="cbody"><small class="ctype">' + esc(p.vendor) + '</small>' +
      '<h3><a href="product.html?handle=' + p.handle + '">' + esc(p.title) + '</a></h3>' +
      '<div class="cprice">' + fmt(p.price) + (p.compareAt ? ' <s>' + fmt(p.compareAt) + '</s>' : '') + '</div>' +
      '<div class="sws">' + sw + '</div>' +
      '<button class="btn add">Ajouter au panier</button></div></article>';
  }
  function bindCards(root) {
    root.addEventListener('click', function (e) {
      var c = e.target.closest('.card'); if (!c) return;
      var p = byHandle(c.dataset.handle), vi = +(c.dataset.vi || 0);
      var s = e.target.closest('.sw');
      if (s) {
        vi = +s.dataset.vi; c.dataset.vi = vi;
        $$('.sw', c).forEach(function (x) { x.classList.toggle('on', x === s); });
        $('.cimg .media', c).outerHTML = media(p, vi);
      } else if (e.target.closest('.add')) {
        Cart.add(p.handle, vi, 1);
      }
    });
  }

  /* ---------- Page d'accueil ---------- */
  function home() {
    var heroArt = $('#hero-art');
    var pick = [['huda-beauty-desert-dusk-palette', 'Huda Beauty'], ['charlotte-tilbury-pillow-talk-lipstick', 'Charlotte Tilbury'], ['fenty-beauty-gloss-bomb', 'Fenty Beauty']];
    heroArt.innerHTML = pick.map(function (x) {
      var p = byHandle(x[0]);
      return '<a href="product.html?handle=' + p.handle + '" aria-label="' + x[1] + '">' + media(p, 0) + '</a>';
    }).join('');
    $('#promo-img').innerHTML = media(byHandle('coffret-zephira-soiree-glamour'), 0);

    var qs = new URLSearchParams(location.search);
    var cat = qs.get('cat') || 'Tout', brand = qs.get('brand') || '', sub = qs.get('sub') || '', sort = 'pop';
    var SUBS = STORE.subs || {}, subBox = $('#subchips');
    var cats = ['Tout', 'Lèvres', 'Yeux', 'Teint', 'Accessoires', 'Coffrets', 'Promo'];
    var grid = $('#grid'), chips = $('#chips');
    var brands = PRODUCTS.map(function (p) { return p.vendor; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort();
    var bsel = $('#brand');
    bsel.innerHTML = '<option value="">Toutes les marques</option>' + brands.map(function (b) { return '<option' + (b === brand ? ' selected' : '') + '>' + esc(b) + '</option>'; }).join('');
    bsel.onchange = function () { brand = this.value; draw(); };
    var strip = $('#brands');
    strip.innerHTML = brands.filter(function (b) { return b !== 'Zéphira Beauty'; }).map(function (b) { return '<button data-b="' + esc(b) + '">' + esc(b) + '</button>'; }).join('');
    strip.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      brand = b.dataset.b; cat = 'Tout'; sub = ''; bsel.value = brand; draw();
      $('#boutique').scrollIntoView();
    };
    /* tuiles catégories */
    var catsBox = $('#cats');
    catsBox.innerHTML = ['Lèvres', 'Yeux', 'Teint', 'Accessoires'].map(function (c) {
      var list = PRODUCTS.filter(function (p) { return p.type === c; });
      return '<a class="cat" href="index.html?cat=' + encodeURIComponent(c) + '#boutique" data-c="' + c + '">' + media(list[0], 0) +
        '<span><h3>' + c + '</h3><small>' + list.length + ' produits</small></span></a>';
    }).join('');
    catsBox.onclick = function (e) {
      var a = e.target.closest('.cat'); if (!a) return;
      e.preventDefault(); cat = a.dataset.c; sub = ''; brand = ''; bsel.value = ''; draw(); $('#boutique').scrollIntoView();
    };
    chips.innerHTML = cats.map(function (c) { return '<button class="chip" data-c="' + c + '">' + c + '</button>'; }).join('');
    function draw() {
      $$('.chip', chips).forEach(function (b) { b.classList.toggle('on', b.dataset.c === cat); });
      var subs = SUBS[cat] || [];
      subBox.hidden = !subs.length;
      subBox.innerHTML = subs.length ? ['Tous'].concat(subs).map(function (s) {
        var v = s === 'Tous' ? '' : s;
        return '<button class="chip sub' + (v === sub ? ' on' : '') + '" data-s="' + esc(v) + '">' + esc(s) + '</button>';
      }).join('') : '';
      var list = PRODUCTS.filter(function (p) {
        if (brand && p.vendor !== brand) return false;
        if (sub && p.sub !== sub) return false;
        return cat === 'Tout' || (cat === 'Promo' ? !!p.compareAt : p.type === cat);
      });
      if (sort === 'asc') list.sort(function (a, b) { return a.price - b.price; });
      if (sort === 'desc') list.sort(function (a, b) { return b.price - a.price; });
      grid.innerHTML = list.length ? list.map(card).join('') : '<p class="empty">Aucun produit pour cette sélection.</p>';
      $('#count').textContent = list.length + ' produit' + (list.length > 1 ? 's' : '');
    }
    chips.onclick = function (e) { var b = e.target.closest('.chip'); if (b) { cat = b.dataset.c; sub = ''; draw(); } };
    subBox.onclick = function (e) { var b = e.target.closest('.chip'); if (b) { sub = b.dataset.s; draw(); } };
    $('#sort').onchange = function () { sort = this.value; draw(); };
    bindCards(grid);
    draw();
    var nf = $('#news'); if (nf) nf.onsubmit = function (e) {
      e.preventDefault(); nf.innerHTML = '<p class="ok">Merci, vous êtes bien inscrit(e).</p>';
    };
  }

  /* ---------- Page produit ---------- */
  function productPage() {
    var h = new URLSearchParams(location.search).get('handle');
    var p = byHandle(h), root = $('#product');
    if (!p) { root.innerHTML = '<div class="wrap"><p class="empty">Produit introuvable. <a href="index.html"><u>Retour à la boutique</u></a></p></div>'; return; }
    document.title = p.vendor + ' ' + p.title + ' – Zéphira Beauty';
    var vi = 0, q = 1;
    function draw() {
      var v = p.variants[vi];
      root.innerHTML = '<div class="wrap pgrid">' +
        '<div class="pimg">' + (p.badge ? '<span class="badge' + (p.compareAt ? ' acc' : '') + '">' + esc(p.badge) + '</span>' : '') + media(p, vi) + '</div>' +
        '<div class="pinfo"><nav class="crumb"><a href="index.html">Accueil</a> / <a href="index.html?cat=' + encodeURIComponent(p.type) + '#boutique">' + p.type + '</a>' + (p.sub ? ' / <a href="index.html?cat=' + encodeURIComponent(p.type) + '&sub=' + encodeURIComponent(p.sub) + '#boutique">' + esc(p.sub) + '</a>' : '') + '</nav>' +
        '<a class="pbrand" href="index.html?brand=' + encodeURIComponent(p.vendor) + '#boutique">' + esc(p.vendor) + '</a>' +
        '<h1>' + esc(p.title) + '</h1>' +
        '<div class="pprice">' + fmt(p.price) + (p.compareAt ? ' <s>' + fmt(p.compareAt) + '</s>' : '') + '</div>' +
        '<p class="lead">' + esc(p.short) + '</p>' +
        (p.variants.length > 1 ? '<div class="opt"><span>Teinte : <strong>' + esc(v.title) + '</strong></span><div class="pws">' +
          p.variants.map(function (x, i) { return '<button class="sw lg' + (i === vi ? ' on' : '') + '" data-vi="' + i + '" style="background:' + x.color + '" title="' + esc(x.title) + '" aria-label="' + esc(x.title) + '"></button>'; }).join('') +
          '</div></div>' : '') +
        '<div class="buy"><div class="qty"><button data-d="-1" aria-label="Moins">−</button><span>' + q + '</span><button data-d="1" aria-label="Plus">+</button></div>' +
        '<button class="btn btn-dark grow" id="addp">Ajouter · ' + fmt(p.price * q) + '</button></div>' +
        '<ul class="perks"><li>Livraison offerte dès 60 €</li><li>Produit 100 % authentique</li><li>Retours sous 30 jours</li></ul>' +
        '<details open><summary>Description</summary><p>' + esc(p.description) + '</p></details>' +
        '<details><summary>Détails</summary><ul class="dl">' + p.details.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul></details>' +
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
    document.body.insertAdjacentHTML('afterbegin', '<p style="padding:2rem;text-align:center">Impossible de charger le catalogue.</p>');
    console.error(e);
  });
})();
