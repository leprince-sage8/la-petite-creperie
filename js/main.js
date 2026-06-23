/* ═══════════════════════════════════════════
   LA P'TITE CRÊPERIE — LOGIQUE DU SITE
   ═══════════════════════════════════════════ */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('✅ Service Worker enregistré'))
      .catch((err) => console.warn('Service Worker non enregistré:', err));
  });
}

// const FORMSPREE_URL = 'https://formspree.io/f/xykalkva'; // Formspree n'est plus utilisé pour la commande WhatsApp

/* ═══════════════════════════
   STATUT OUVERT / FERMÉ
   ═══════════════════════════ */
function updateOpenStatus() {
  const badge = document.getElementById('status-badge');
  const text = document.getElementById('status-text');
  if (!badge || !text) return;

  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentMinutes = hour * 60 + minute;

  // Horaires : 10h00 - 18h00 tous les jours
  const openMinutes = 10 * 60;
  const closeMinutes = 18 * 60;

  const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

  if (isOpen) {
    badge.classList.add('open');
    badge.classList.remove('closed');
    text.textContent = 'Ouvert maintenant — Ferme à 18h00';
  } else {
    badge.classList.add('closed');
    badge.classList.remove('open');
    if (currentMinutes < openMinutes) {
      text.textContent = 'Fermé — Ouvre à 10h00';
    } else {
      text.textContent = 'Fermé — Ouvre demain à 10h00';
    }
  }
}

updateOpenStatus();
setInterval(updateOpenStatus, 60000); // mise à jour chaque minute


/* ═══════════════════════════
   NAVIGATION — apparition au scroll
   ═══════════════════════════ */
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }
});

/* ═══════════════════════════
   HERO — slideshow automatique
   ═══════════════════════════ */
const heroSlides = document.querySelectorAll('.hero-slide');
let currentSlide = 0;
if (heroSlides.length > 0) {
  setInterval(() => {
    heroSlides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % heroSlides.length;
    heroSlides[currentSlide].classList.add('active');
  }, 5000);
}

/* ═══════════════════════════
   ANIMATIONS AU SCROLL (fade-up)
   ═══════════════════════════ */
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));


/* ═══════════════════════════
   RETOUR EN HAUT
   ═══════════════════════════ */
const scrollTopBtn = document.getElementById('scroll-top-btn');
if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
  });
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* ═══════════════════════════════════════════
   SYSTÈME DE PANIER
   ═══════════════════════════════════════════ */

let cart = [];

const cartOverlay = document.getElementById('cart-overlay');
const cartFloatBtn = document.getElementById('cart-float-btn');
const cartCloseX = document.getElementById('cart-close-x');
const cartBadge = document.getElementById('cart-badge');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalRow = document.getElementById('cart-total-row');
const cartTotalEl = document.getElementById('cart-total');
const cartViewActions = document.getElementById('cart-view-actions');
const cartView = document.getElementById('cart-view');
const orderForm = document.getElementById('order-form');
const cartSuccess = document.getElementById('cart-success');
const orderMode = document.getElementById('order-mode');
const addressField = document.getElementById('address-field');
const orderPhone = document.getElementById('order-phone');

/* --- Ajouter un produit au panier --- */
document.querySelectorAll('.btn-add-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.name;
    const price = parseInt(btn.dataset.price, 10);

    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name, price, qty: 1 });
    }

    updateCartUI();

    // Petit retour visuel sur le bouton
    const originalText = '+ Ajouter au panier';
    btn.textContent = '✓ Ajouté';
    btn.classList.add('added');
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove('added');
    }, 1200);
  });
});

/* --- Mise à jour de l'affichage du panier --- */
function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  if (cartBadge) {
    if (totalItems > 0) {
      cartBadge.style.display = 'flex';
      cartBadge.textContent = totalItems;
    } else {
      cartBadge.style.display = 'none';
    }
  }

  renderCartItems();
}

function renderCartItems() {
  if (!cartItemsEl) return;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<div class="cart-empty">Votre panier est vide.<br>Ajoutez des produits depuis le menu !</div>';
    cartTotalRow.style.display = 'none';
    cartViewActions.style.display = 'none';
    return;
  }

  cartItemsEl.innerHTML = '';
  let total = 0;

  cart.forEach((item, idx) => {
    total += item.price * item.qty;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${escapeHtml(item.name)}</div>
        <div class="cart-item-price">${item.price.toLocaleString('fr-FR')} FCFA</div>
      </div>
      <div class="cart-qty">
        <button type="button" data-action="dec" data-idx="${idx}">−</button>
        <span>${item.qty}</span>
        <button type="button" data-action="inc" data-idx="${idx}">+</button>
      </div>
      <button type="button" class="cart-remove" data-action="remove" data-idx="${idx}">✕</button>
    `;
    cartItemsEl.appendChild(div);
  });

  cartTotalEl.textContent = total.toLocaleString('fr-FR') + ' FCFA';
  cartTotalRow.style.display = 'flex';
  cartViewActions.style.display = 'flex';
}

/* Échappement HTML basique pour éviter tout problème d'affichage */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* --- Gestion des clics dans le panier (incrément, décrément, suppression) --- */
if (cartItemsEl) {
  cartItemsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const idx = parseInt(btn.dataset.idx, 10);
    const action = btn.dataset.action;

    if (action === 'inc') {
      cart[idx].qty += 1;
    } else if (action === 'dec') {
      cart[idx].qty -= 1;
      if (cart[idx].qty <= 0) cart.splice(idx, 1);
    } else if (action === 'remove') {
      cart.splice(idx, 1);
    }

    updateCartUI();
  });
}

/* --- Ouverture / fermeture du panier --- */
if (cartFloatBtn) {
  cartFloatBtn.addEventListener('click', () => {
    cartOverlay.classList.add('active');
    showCartView();
    renderCartItems();
  });
}

if (cartCloseX) {
  cartCloseX.addEventListener('click', () => attemptCloseCart());
}

if (cartOverlay) {
  cartOverlay.addEventListener('click', (e) => {
    if (e.target === cartOverlay) attemptCloseCart();
  });
}

function attemptCloseCart() {
  const isFormVisible = orderForm.classList.contains('active');
  const hasItems = cart.length > 0;

  if (isFormVisible && hasItems) {
    const confirmClose = confirm('Vous avez une commande en cours. Voulez-vous vraiment fermer sans valider ?');
    if (!confirmClose) return;
  }

  cartOverlay.classList.remove('active');
}

const cartContinueBtn = document.getElementById('cart-continue');
if (cartContinueBtn) {
  cartContinueBtn.addEventListener('click', () => {
    cartOverlay.classList.remove('active');
  });
}

function showCartView() {
  cartView.style.display = 'block';
  orderForm.classList.remove('active');
  cartSuccess.classList.remove('active');
}

function showOrderForm() {
  cartView.style.display = 'none';
  orderForm.classList.add('active');
  cartSuccess.classList.remove('active');
}

const cartGotoFormBtn = document.getElementById('cart-goto-form');
if (cartGotoFormBtn) {
  cartGotoFormBtn.addEventListener('click', () => {
    showOrderForm();
    if (orderPhone && !orderPhone.value) {
      orderPhone.value = '+242 ';
    }
  });
}

// Hero "Commander" button: open the cart modal
// heroOrderBtn removed from markup — no handler needed

const orderBackBtn = document.getElementById('order-back');
if (orderBackBtn) {
  orderBackBtn.addEventListener('click', showCartView);
}

/* --- Pré-remplissage et protection du préfixe téléphone --- */
if (orderPhone) {
  orderPhone.addEventListener('input', (e) => {
    if (!e.target.value.startsWith('+242')) {
      e.target.value = '+242 ';
    }
  });
}

/* --- Affichage du champ adresse selon le mode --- */
if (orderMode) {
  orderMode.addEventListener('change', () => {
    const isLivraison = orderMode.value === 'Livraison';
    addressField.style.display = isLivraison ? 'block' : 'none';
    const addressTextarea = addressField.querySelector('textarea');
    if (addressTextarea) addressTextarea.required = isLivraison;
  });
}

/* Order numbering removed — simplified workflow without order IDs */

/* ═══════════════════════════════════════════
   SOUMISSION DE LA COMMANDE
   ═══════════════════════════════════════════ */
/* ═══════════════════════════════════════════
   VALIDATION DU FORMULAIRE
   ═══════════════════════════════════════════ */
function validateOrderForm() {
  let isValid = true;
  clearAllErrors();

  const nameInput = orderForm.querySelector('[name="Nom"]');
  if (!nameInput.value.trim()) {
    showFieldError(nameInput, 'Merci de renseigner votre nom.');
    isValid = false;
  }

  const phoneInput = orderForm.querySelector('[name="Téléphone"]');
  const phoneDigits = phoneInput.value.replace(/\D/g, '');
  if (phoneDigits.length < 9) {
    showFieldError(phoneInput, 'Numéro de téléphone incomplet.');
    isValid = false;
  }

  const modeSelect = orderForm.querySelector('[name="Mode"]');
  if (!modeSelect.value) {
    showFieldError(modeSelect, 'Choisissez un mode de réception.');
    isValid = false;
  }

  if (modeSelect.value === 'Livraison') {
    const addressInput = orderForm.querySelector('[name="Adresse"]');
    if (!addressInput.value.trim()) {
      showFieldError(addressInput, 'Indiquez votre adresse de livraison.');
      isValid = false;
    }
  }

  const paymentSelect = orderForm.querySelector('[name="Paiement"]');
  if (!paymentSelect.value) {
    showFieldError(paymentSelect, 'Choisissez un mode de paiement.');
    isValid = false;
  }

  if (!isValid) {
    const firstError = orderForm.querySelector('.field-error');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return isValid;
}

function showFieldError(field, message) {
  field.classList.add('field-error');

  let msgEl = field.parentElement.querySelector('.field-error-msg');
  if (!msgEl) {
    msgEl = document.createElement('div');
    msgEl.className = 'field-error-msg';
    field.insertAdjacentElement('afterend', msgEl);
  }
  msgEl.textContent = message;
  msgEl.classList.add('active');

  field.addEventListener('input', () => clearFieldError(field), { once: true });
  field.addEventListener('change', () => clearFieldError(field), { once: true });
}

function clearFieldError(field) {
  field.classList.remove('field-error');
  const msgEl = field.parentElement.querySelector('.field-error-msg');
  if (msgEl) msgEl.classList.remove('active');
}

function clearAllErrors() {
  orderForm.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
  orderForm.querySelectorAll('.field-error-msg').forEach(el => el.classList.remove('active'));
}


/* ═══════════════════════════════════════════
   SOUMISSION DE LA COMMANDE
   ═══════════════════════════════════════════ */
if (orderForm) {
  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (cart.length === 0) return;

    if (!validateOrderForm()) return;

    const summary = cart
      .map(item => `${item.name} x${item.qty} — ${(item.price * item.qty).toLocaleString('fr-FR')} FCFA`)
      .join('\n');
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    const name = orderForm.querySelector('[name="Nom"]').value.trim();
    const phone = orderForm.querySelector('[name="Téléphone"]').value.trim();
    const mode = orderForm.querySelector('[name="Mode"]').value;
    const address = orderForm.querySelector('[name="Adresse"]').value.trim();
    const remarks = orderForm.querySelector('[name="Remarques"]').value.trim();
    const payment = orderForm.querySelector('[name="Paiement"]').value;

    const submitBtn = document.getElementById('order-submit');
    submitBtn.textContent = 'Envoi...';
    submitBtn.disabled = true;

    const whatsappText = `Nouvelle commande — La P'tite Crêperie\n` +
      `Nom : ${name}\n` +
      `Téléphone : ${phone}\n` +
      `Mode : ${mode}\n` +
      `${mode === 'Livraison' ? `Adresse : ${address}\n` : ''}` +
      `Paiement : ${payment}\n` +
      `Remarques : ${remarks || '-'}\n\n` +
      `Commande :\n${summary}\n` +
      `Total : ${total.toLocaleString('fr-FR')} FCFA`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=242067078494&text=${encodeURIComponent(whatsappText)}`;
    const win = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    if (!win) {
      const desktopFallback = `https://web.whatsapp.com/send?phone=242067078494&text=${encodeURIComponent(whatsappText)}`;
      window.open(desktopFallback, '_blank', 'noopener,noreferrer');
    }

    orderForm.classList.remove('active');
    cartSuccess.classList.add('active');

    cart = [];
    updateCartUI();
    orderForm.reset();
    addressField.style.display = 'none';

    submitBtn.textContent = 'Commander via WhatsApp';
    submitBtn.disabled = false;
  });
}


/* ═══════════════════════════════════════════
   SYSTÈME DE NOTATION (étoiles)
   ═══════════════════════════════════════════ */
const stripStars = document.getElementById('strip-stars');
const ratingPrompt = document.getElementById('rating-prompt');
const ratingThanks = document.getElementById('rating-thanks');

if (stripStars) {
  const starEls = stripStars.querySelectorAll('span');

  starEls.forEach(star => {
    star.addEventListener('mouseenter', () => {
      const val = parseInt(star.dataset.val, 10);
      highlightStars(val);
    });

    star.addEventListener('click', async () => {
      const val = parseInt(star.dataset.val, 10);
      selectStars(val);
      await sendRating(val);
    });
  });

  stripStars.addEventListener('mouseleave', () => {
    const selectedVal = stripStars.dataset.selected;
    highlightStars(selectedVal ? parseInt(selectedVal, 10) : 0);
  });

  function highlightStars(count) {
    starEls.forEach(star => {
      const val = parseInt(star.dataset.val, 10);
      star.classList.toggle('hovered', val <= count);
    });
  }

  function selectStars(count) {
    stripStars.dataset.selected = count;
    starEls.forEach(star => {
      const val = parseInt(star.dataset.val, 10);
      star.classList.toggle('selected', val <= count);
    });
  }

  async function sendRating(value) {
    if (ratingPrompt) ratingPrompt.style.display = 'none';
    if (ratingThanks) ratingThanks.classList.add('active');

    try {
      const data = new FormData();
      data.append('Note', value + '/5');
      data.append('_subject', "⭐ Nouvel avis — La P'tite Crêperie");

      await fetch(FORMSPREE_URL, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
    } catch (err) {
      // Échec silencieux : l'avis ne part pas, mais l'expérience utilisateur reste fluide
      console.warn('Erreur envoi avis:', err);
    }
  }
}


/* ═══════════════════════════════════════════
   BOUTON PARTAGER
   ═══════════════════════════════════════════ */
const btnShare = document.getElementById('btn-share');

function openShareWindow(url) {
  const shareWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (!shareWindow) {
    window.location.href = url;
  }
}

function createShareModal() {
  if (document.getElementById('share-modal')) return;

  const overlay = document.createElement('div');
  overlay.id = 'share-modal-overlay';
  overlay.innerHTML = `
    <div id="share-modal">
      <button type="button" id="share-modal-close" aria-label="Fermer">✕</button>
      <h3>Partager le lien</h3>
      <div class="share-btns">
        <button type="button" class="share-btn" data-type="whatsapp">🟢 WhatsApp</button>
        <button type="button" class="share-btn" data-type="facebook">📘 Facebook</button>
        <button type="button" class="share-btn" data-type="twitter">🐦 Twitter</button>
        <button type="button" class="share-btn" data-type="telegram">✈️ Telegram</button>
        <button type="button" class="share-btn" data-type="copy">📋 Copier le lien</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  overlay.querySelector('#share-modal-close').addEventListener('click', () => overlay.remove());

  overlay.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const type = btn.dataset.type;
      const title = encodeURIComponent("La P'tite Crêperie — Goûte-Moi");
      const text = encodeURIComponent("Découvrez La P'tite Crêperie à Brazzaville — crêpes et galettes faites avec amour !");
      const url = encodeURIComponent(window.location.href);

      if (type === 'whatsapp') {
        openShareWindow(`https://api.whatsapp.com/send?text=${text}%20${url}`);
      } else if (type === 'facebook') {
        openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${url}`);
      } else if (type === 'twitter') {
        openShareWindow(`https://twitter.com/intent/tweet?text=${text}&url=${url}`);
      } else if (type === 'telegram') {
        openShareWindow(`https://t.me/share/url?url=${url}&text=${text}`);
      } else if (type === 'copy') {
        try {
          await navigator.clipboard.writeText(window.location.href);
          btn.textContent = '✓ Copié';
          setTimeout(() => { btn.textContent = 'Copier le lien'; }, 1800);
        } catch (err) {
          prompt('Copiez ce lien', window.location.href);
        }
      }
    });
  });
}

if (btnShare) {
  btnShare.addEventListener('click', async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const shareData = {
      title: "La P'tite Crêperie — Goûte-Moi",
      text: 'Découvrez La P\'tite Crêperie à Brazzaville — crêpes et galettes faites avec amour !',
      url: window.location.href
    };

    if (navigator.share && window.isSecureContext) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // partage annulé ou erreur — on poursuit avec le repli
      }
    }

    // Repli riche : afficher modal de partage avec options réseau + copie
    createShareModal();
  });
}
