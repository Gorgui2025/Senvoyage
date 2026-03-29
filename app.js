/* ============================================================
   app.js — SenVoyage Application JavaScript
   Gestion complète de l'application : formulaires, résultats,
   réservation, confirmation + localStorage inter-pages.
   ============================================================ */

'use strict';

/* ============================================================
   DONNÉES GLOBALES
   ============================================================ */

/** Liste des régions du Sénégal */
const REGIONS = [
  'Dakar',
  'Thiès',
  'Diourbel',
  'Fatick',
  'Kaolack',
  'Kaffrine',
  'Kolda',
  'Louga',
  'Matam',
  'Saint-Louis',
  'Sédhiou',
  'Tambacounda',
  'Ziguinchor',
  'Kédougou',
];

/** Compagnies de transport disponibles */
const COMPANIES = [
  {
    id: 'dakar-express',
    name: 'Dakar Express',
    initials: 'DE',
    logoClass: 'logo-green',
    cardClass: '',
  },
  {
    id: 'senegal-voyage',
    name: 'Sénégal Voyage',
    initials: 'SV',
    logoClass: 'logo-red',
    cardClass: 'card-red',
  },
  {
    id: 'teranga-bus',
    name: 'Téranga Bus',
    initials: 'TB',
    logoClass: 'logo-yellow',
    cardClass: 'card-yellow',
  },
  {
    id: 'sahel-transport',
    name: 'Sahel Transport',
    initials: 'ST',
    logoClass: 'logo-gray',
    cardClass: '',
  },
];

/** Icônes d'information trajet */
const ICONS = {
  clock:      '🕐',
  duration:   '⏱️',
  seat:       '💺',
  bus:        '🚌',
  location:   '📍',
  calendar:   '📅',
  phone:      '📞',
  person:     '👤',
  check:      '✅',
};


/* ============================================================
   UTILITAIRES
   ============================================================ */

/**
 * Retourne la date du jour au format YYYY-MM-DD
 */
function getTodayISO() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

/**
 * Formate une date ISO en format lisible (ex : "24 mars 2026")
 */
function formatDate(isoDate) {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  const months = [
    'janvier','février','mars','avril','mai','juin',
    'juillet','août','septembre','octobre','novembre','décembre',
  ];
  return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
}

/**
 * Formate un prix en FCFA avec séparateur de milliers
 */
function formatPrice(amount) {
  return new Intl.NumberFormat('fr-SN').format(amount) + ' FCFA';
}

/**
 * Génère un nombre entier aléatoire entre min et max (inclus)
 */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Sélectionne N éléments aléatoires distincts dans un tableau
 */
function pickRandom(arr, n) {
  const copy = [...arr];
  const result = [];
  while (result.length < n && copy.length > 0) {
    const i = randInt(0, copy.length - 1);
    result.push(copy.splice(i, 1)[0]);
  }
  return result;
}

/**
 * Génère un numéro de réservation unique
 */
function generateBookingNumber() {
  const random = String(randInt(1000, 9999));
  return `SV-2024-${random}`;
}

/**
 * Enregistre des données dans localStorage
 */
function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Erreur localStorage :', e);
  }
}

/**
 * Récupère des données depuis localStorage
 */
function loadData(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Erreur localStorage :', e);
    return null;
  }
}


/* ============================================================
   GÉNÉRATION DES TRAJETS (simulation JSON)
   ============================================================ */

/**
 * Génère entre 3 et 5 trajets simulés pour un itinéraire donné.
 * @param {string} from  - Région de départ
 * @param {string} to    - Région d'arrivée
 * @param {string} date  - Date ISO
 * @param {number} passengers - Nombre de passagers
 */
/**
 * Sélectionne N compagnies pour les trajets.
 * Si N > nombre de compagnies disponibles, une compagnie peut apparaître deux fois
 * (deux horaires différents pour la même compagnie = réaliste).
 */
function pickCompanies(count) {
  if (count <= COMPANIES.length) return pickRandom(COMPANIES, count);
  // 5 trajets : toutes les compagnies + 1 répétition aléatoire
  const all = pickRandom(COMPANIES, COMPANIES.length);
  all.push(COMPANIES[randInt(0, COMPANIES.length - 1)]);
  return all;
}

function generateTrips(from, to, date, passengers) {
  const count = randInt(3, 5);
  const companies = pickCompanies(count);

  // Heures de départ possibles (format "HH:MM")
  const departureTimes = ['06:00','07:30','08:15','09:00','10:30','12:00','13:45','15:00','16:30','18:00'];
  const usedTimes = pickRandom(departureTimes, count);

  // Durées et prix de base selon les régions
  const BASE_PRICES = {
    'Dakar-Thiès': 2000,    'Dakar-Diourbel': 3500,  'Dakar-Fatick': 4500,
    'Dakar-Kaolack': 5000,  'Dakar-Saint-Louis': 5500,'Dakar-Louga': 4800,
    'Dakar-Tambacounda': 9000,'Dakar-Ziguinchor': 11000,'Dakar-Kédougou': 13000,
    'default': 4500,
  };

  const key = `${from}-${to}`;
  const revKey = `${to}-${from}`;
  const basePrice = BASE_PRICES[key] || BASE_PRICES[revKey] || BASE_PRICES['default'];

  const trips = companies.map((company, idx) => {
    const variation = randInt(-800, 1200);
    const unitPrice  = Math.round((basePrice + variation) / 100) * 100;
    const totalPrice = unitPrice * passengers;

    // Durée : entre 1h et 8h selon le prix (proxy de distance)
    const minHours = Math.max(1, Math.floor(basePrice / 2500));
    const maxHours = Math.min(8, Math.ceil(basePrice / 1500));
    const durationH = randInt(minHours, maxHours);
    const durationM = [0, 15, 30, 45][randInt(0, 3)];
    const durationStr = durationM > 0
      ? `${durationH}h${String(durationM).padStart(2,'0')}`
      : `${durationH}h00`;

    return {
      id: `trip-${idx}-${Date.now()}`,
      company,
      departureTime: usedTimes[idx],
      duration: durationStr,
      unitPrice,
      totalPrice,
      passengers,
      from,
      to,
      date,
      availableSeats: randInt(1, 20),
    };
  });

  // Tri par heure de départ
  trips.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
  return trips;
}


/* ============================================================
   PAGE : INDEX (index.html)
   ============================================================ */

function initIndexPage() {
  const formEl     = document.getElementById('search-form');
  if (!formEl) return;

  const fromSelect    = document.getElementById('from');
  const toSelect      = document.getElementById('to');
  const dateInput     = document.getElementById('travel-date');
  const passInput     = document.getElementById('passengers');
  const todayBtn      = document.getElementById('today-btn');
  const loader        = document.getElementById('loader');

  // ------ Date minimum = aujourd'hui ------
  if (dateInput) dateInput.min = getTodayISO();

  // ------ Remplissage des listes déroulantes ------
  populateRegionSelect(fromSelect);
  populateRegionSelect(toSelect);

  // Pré-remplissage avec données éventuelles (retour arrière)
  const prev = loadData('sv_search');
  if (prev) {
    if (fromSelect) fromSelect.value  = prev.from   || '';
    if (toSelect)   toSelect.value    = prev.to     || '';
    if (dateInput)  dateInput.value   = prev.date   || '';
    if (passInput)  passInput.value   = prev.passengers || 1;
  }

  // ------ Bouton "Partir aujourd'hui" ------
  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      if (dateInput) dateInput.value = getTodayISO();
    });
  }

  // ------ Soumission du formulaire ------
  formEl.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validation
    let valid = true;

    const fromVal  = fromSelect ? fromSelect.value.trim() : '';
    const toVal    = toSelect   ? toSelect.value.trim()   : '';
    const dateVal  = dateInput  ? dateInput.value.trim()  : '';
    const passVal  = passInput  ? parseInt(passInput.value) : 1;

    valid = validateField(fromSelect, !!fromVal, 'Veuillez choisir un lieu de départ.') && valid;
    valid = validateField(toSelect,   !!toVal,   'Veuillez choisir un lieu d\'arrivée.') && valid;
    valid = validateField(dateInput,  !!dateVal, 'Veuillez sélectionner une date.')      && valid;

    // Validation : date non passée
    if (dateVal && dateVal < getTodayISO()) {
      showFieldError(dateInput, 'La date ne peut pas être dans le passé.');
      valid = false;
    }

    if (fromVal && toVal && fromVal === toVal) {
      showFieldError(fromSelect, 'Le départ et l\'arrivée doivent être différents.');
      showFieldError(toSelect,   'Le départ et l\'arrivée doivent être différents.');
      valid = false;
    }

    if (!valid) return;

    // Sauvegarde & redirection avec loader
    const searchData = { from: fromVal, to: toVal, date: dateVal, passengers: passVal };
    saveData('sv_search', searchData);

    if (loader) loader.classList.add('active');

    setTimeout(() => {
      window.location.href = 'results.html';
    }, 1400);
  });
}

/** Rempli un <select> avec les régions */
function populateRegionSelect(selectEl) {
  if (!selectEl) return;
  selectEl.innerHTML = '<option value="">-- Choisir une région --</option>';
  REGIONS.forEach(region => {
    const opt = document.createElement('option');
    opt.value = region;
    opt.textContent = region;
    selectEl.appendChild(opt);
  });
}

/** Affiche/masque un message d'erreur sur un champ */
function validateField(el, condition, msg) {
  if (!el) return condition;
  const group = el.closest('.form-group');
  if (!group) return condition;
  let errEl = group.querySelector('.error-msg');
  if (!errEl) {
    errEl = document.createElement('span');
    errEl.className = 'error-msg';
    group.appendChild(errEl);
  }
  if (!condition) {
    errEl.textContent = msg;
    group.classList.add('has-error');
    el.classList.add('error');
    return false;
  } else {
    errEl.textContent = '';
    group.classList.remove('has-error');
    el.classList.remove('error');
    return true;
  }
}

function showFieldError(el, msg) {
  if (!el) return;
  const group = el.closest('.form-group');
  if (!group) return;
  let errEl = group.querySelector('.error-msg');
  if (!errEl) {
    errEl = document.createElement('span');
    errEl.className = 'error-msg';
    group.appendChild(errEl);
  }
  errEl.textContent = msg;
  group.classList.add('has-error');
  el.classList.add('error');
}


/* ============================================================
   PAGE : RÉSULTATS (results.html)
   ============================================================ */

function initResultsPage() {
  const container  = document.getElementById('trips-container');
  const summaryEl  = document.getElementById('search-summary');
  const loader     = document.getElementById('loader');
  if (!container) return;

  const search = loadData('sv_search');

  // Pas de données → retour accueil
  if (!search || !search.from || !search.to) {
    container.innerHTML = `
      <div class="no-results">
        <div class="icon">⚠️</div>
        <h3>Aucune recherche en cours</h3>
        <p>Veuillez effectuer une recherche depuis la page d'accueil.</p>
        <br>
        <a href="index.html" class="btn btn-primary">Retour à l'accueil</a>
      </div>`;
    return;
  }

  // Affichage du résumé de recherche
  if (summaryEl) {
    summaryEl.innerHTML = `
      <span class="tag">${ICONS.location} ${search.from}</span>
      <span style="color:var(--gray-400)">→</span>
      <span class="tag">${ICONS.location} ${search.to}</span>
      <span class="tag">${ICONS.calendar} ${formatDate(search.date)}</span>
      <span class="tag">${ICONS.seat} ${search.passengers} passager(s)</span>
    `;
  }

  // Loader visuel simulé
  if (loader) loader.classList.add('active');

  setTimeout(() => {
    if (loader) loader.classList.remove('active');

    const trips = generateTrips(search.from, search.to, search.date, search.passengers);

    if (!trips || trips.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          <div class="icon">${ICONS.bus}</div>
          <h3>Aucun trajet disponible</h3>
          <p>Essayez une autre date ou modifiez votre itinéraire.</p>
        </div>`;
      return;
    }

    container.innerHTML = '';

    trips.forEach(trip => {
      const card = createTripCard(trip);
      container.appendChild(card);
    });

  }, 1200);
}

/** Crée un élément DOM pour une carte de trajet */
function createTripCard(trip) {
  const { company, departureTime, duration, unitPrice, totalPrice, passengers, availableSeats } = trip;

  const card = document.createElement('div');
  card.className = `trip-card ${company.cardClass}`;

  card.innerHTML = `
    <div class="company-logo ${company.logoClass}">${company.initials}</div>

    <div class="trip-info">
      <div class="company-name">${ICONS.bus} ${company.name}</div>
      <div class="trip-details">
        <span>${ICONS.clock} Départ : <strong>${departureTime}</strong></span>
        <span>${ICONS.duration} Durée : <strong>${duration}</strong></span>
        <span>${ICONS.seat} Places dispo : <strong>${availableSeats}</strong></span>
      </div>
    </div>

    <div class="trip-price-col">
      <div class="trip-price">
        ${formatPrice(unitPrice)}
        ${passengers > 1 ? `<small>/ pers. · Total ${formatPrice(totalPrice)}</small>` : ''}
      </div>
      <button class="btn btn-reserve" data-trip='${JSON.stringify(trip).replace(/'/g, "&#39;")}'>
        Réserver →
      </button>
    </div>
  `;

  // Bouton Réserver
  const reserveBtn = card.querySelector('.btn-reserve');
  reserveBtn.addEventListener('click', () => {
    saveData('sv_selected_trip', trip);
    window.location.href = 'booking.html';
  });

  return card;
}


/* ============================================================
   PAGE : RÉSERVATION (booking.html)
   ============================================================ */

function initBookingPage() {
  const summaryEl = document.getElementById('booking-summary');
  const formEl    = document.getElementById('booking-form');
  if (!formEl) return;

  const trip   = loadData('sv_selected_trip');
  const search = loadData('sv_search');

  // Pas de trajet → retour résultats
  if (!trip) {
    if (summaryEl) summaryEl.innerHTML = `
      <div class="alert alert-error">⚠️ Aucun trajet sélectionné.
        <a href="results.html">Retour aux résultats</a>
      </div>`;
    return;
  }

  // Affichage du récapitulatif
  if (summaryEl) {
    summaryEl.innerHTML = `
      <div class="summary-row">
        <span class="summary-label">${ICONS.location} Trajet</span>
        <span class="summary-value">${trip.from} → ${trip.to}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">${ICONS.calendar} Date</span>
        <span class="summary-value">${formatDate(trip.date)}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">${ICONS.bus} Compagnie</span>
        <span class="summary-value">${trip.company.name}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">${ICONS.clock} Départ</span>
        <span class="summary-value">${trip.departureTime}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">${ICONS.duration} Durée</span>
        <span class="summary-value">${trip.duration}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">${ICONS.seat} Passagers</span>
        <span class="summary-value">${trip.passengers}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">💰 Prix / pers.</span>
        <span class="summary-value">${formatPrice(trip.unitPrice)}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">💰 Prix total</span>
        <span class="summary-value price-highlight">${formatPrice(trip.totalPrice)}</span>
      </div>
    `;
  }

  // Soumission du formulaire de réservation
  formEl.addEventListener('submit', (e) => {
    e.preventDefault();

    const firstNameEl = document.getElementById('first-name');
    const lastNameEl  = document.getElementById('last-name');
    const phoneEl     = document.getElementById('phone');

    const firstName = firstNameEl ? firstNameEl.value.trim() : '';
    const lastName  = lastNameEl  ? lastNameEl.value.trim()  : '';
    const phone     = phoneEl     ? phoneEl.value.trim()     : '';

    let valid = true;
    // Validation téléphone : format sénégalais (optionnel +221 / 00221, puis 7X XXXXXXX)
    const cleanPhone = phone.replace(/[\s\-\.]/g, '');
    const phoneValid = /^(\+221|00221)?7[0-9]{8}$/.test(cleanPhone);

    valid = validateField(firstNameEl, !!firstName, 'Veuillez saisir votre prénom.') && valid;
    valid = validateField(lastNameEl,  !!lastName,  'Veuillez saisir votre nom.')    && valid;
    valid = validateField(phoneEl,     phoneValid,  'Format invalide. Ex : 77 123 45 67') && valid;

    if (!valid) return;

    const bookingData = {
      bookingNumber: generateBookingNumber(),
      passenger: { firstName, lastName, phone },
      trip,
    };

    saveData('sv_booking', bookingData);
    window.location.href = 'confirmation.html';
  });
}


/* ============================================================
   PAGE : CONFIRMATION (confirmation.html)
   ============================================================ */

function initConfirmationPage() {
  const bookingNumberEl = document.getElementById('booking-number');
  const summaryEl       = document.getElementById('confirm-summary');
  const newBtn          = document.getElementById('new-booking-btn');

  const booking = loadData('sv_booking');

  if (!booking) {
    if (summaryEl) summaryEl.innerHTML = `
      <div class="alert alert-error">⚠️ Aucune réservation trouvée.
        <a href="index.html">Retour à l'accueil</a>
      </div>`;
    return;
  }

  const { bookingNumber, passenger, trip } = booking;

  // Numéro de réservation
  if (bookingNumberEl) {
    bookingNumberEl.textContent = bookingNumber;
  }

  // Récapitulatif complet
  if (summaryEl) {
    summaryEl.innerHTML = `
      <div class="summary-row">
        <span class="summary-label">${ICONS.person} Passager</span>
        <span class="summary-value">${passenger.firstName} ${passenger.lastName}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">${ICONS.phone} Téléphone</span>
        <span class="summary-value">${passenger.phone}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">${ICONS.location} Trajet</span>
        <span class="summary-value">${trip.from} → ${trip.to}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">${ICONS.calendar} Date</span>
        <span class="summary-value">${formatDate(trip.date)}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">${ICONS.bus} Compagnie</span>
        <span class="summary-value">${trip.company.name}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">${ICONS.clock} Départ</span>
        <span class="summary-value">${trip.departureTime}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">${ICONS.seat} Passagers</span>
        <span class="summary-value">${trip.passengers}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">💰 Prix total</span>
        <span class="summary-value price-highlight">${formatPrice(trip.totalPrice)}</span>
      </div>
    `;
  }

  // ------ Enregistrement des boutons EN PREMIER (avant tout appel externe) ------

  // Bouton nouvelle réservation
  if (newBtn) {
    newBtn.addEventListener('click', () => {
      localStorage.removeItem('sv_search');
      localStorage.removeItem('sv_selected_trip');
      localStorage.removeItem('sv_booking');
      window.location.href = 'index.html';
    });
  }

  // Bouton impression PDF
  const printBtn = document.getElementById('print-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Bouton WhatsApp — utilise un <a> temporaire pour contourner les blocages popup
  const whatsappBtn = document.getElementById('whatsapp-btn');
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', () => {
      const msg = buildWhatsAppMessage(booking);
      const a = document.createElement('a');
      a.href = 'https://wa.me/?text=' + encodeURIComponent(msg);
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  // ------ Billet d'impression (après les listeners, dans un try-catch) ------
  try {
    const printTicketEl = document.getElementById('print-ticket');
    if (printTicketEl) {
      printTicketEl.innerHTML = buildPrintTicket(booking);
    }
  } catch (err) {
    console.error('Erreur génération billet :', err);
  }
}


/* ============================================================
   BILLET IMPRIMABLE — génère le HTML du ticket
   ============================================================ */

/**
 * Construit le HTML du billet papier stylisé (visible uniquement @media print)
 */
function buildPrintTicket(booking) {
  const { bookingNumber, passenger, trip } = booking;
  const passengersLabel = trip.passengers > 1
    ? `${trip.passengers} passagers`
    : '1 passager';

  return `
    <div class="ticket">

      <div class="ticket-header">
        <div class="logo-text">Sen<span>Voyage</span></div>
        <div class="ticket-type">BILLET DE TRANSPORT<br>Inter-régions Sénégal</div>
      </div>

      <div class="ticket-flag"></div>

      <div class="ticket-body">

        <!-- Itinéraire -->
        <div class="ticket-route">
          <div class="ticket-city">
            <div class="city-name">${trip.from}</div>
            <div class="city-label">Départ</div>
          </div>
          <div class="ticket-arrow">🚌</div>
          <div class="ticket-city">
            <div class="city-name">${trip.to}</div>
            <div class="city-label">Arrivée</div>
          </div>
        </div>

        <!-- Grille infos trajet + passager -->
        <div class="ticket-info-grid">
          <div class="ticket-field">
            <div class="field-label">📅 Date</div>
            <div class="field-value">${formatDate(trip.date)}</div>
          </div>
          <div class="ticket-field">
            <div class="field-label">🕐 Heure départ</div>
            <div class="field-value">${trip.departureTime}</div>
          </div>
          <div class="ticket-field">
            <div class="field-label">⏱ Durée</div>
            <div class="field-value">${trip.duration}</div>
          </div>
          <div class="ticket-field">
            <div class="field-label">🚌 Compagnie</div>
            <div class="field-value">${trip.company.name}</div>
          </div>
          <div class="ticket-field">
            <div class="field-label">👤 Passager</div>
            <div class="field-value">${passenger.firstName} ${passenger.lastName}</div>
          </div>
          <div class="ticket-field">
            <div class="field-label">📞 Téléphone</div>
            <div class="field-value">${passenger.phone}</div>
          </div>
          <div class="ticket-field">
            <div class="field-label">💺 Nb. passagers</div>
            <div class="field-value">${passengersLabel}</div>
          </div>
        </div>

      </div>

      <!-- Pied : N° réservation + prix -->
      <div class="ticket-footer">
        <div>
          <div class="ticket-field"><div class="field-label">N° Réservation</div></div>
          <div class="ticket-booking-number">${bookingNumber}</div>
        </div>
        <div class="ticket-price">
          ${formatPrice(trip.totalPrice)}
          <small>Prix total</small>
        </div>
      </div>

    </div>
    <p class="ticket-note">
      Billet généré le ${formatDate(new Date().toISOString().split('T')[0])} via SenVoyage —
      Présentez ce billet à l'embarquement.
    </p>
  `;
}


/* ============================================================
   MESSAGE WHATSAPP — construit le texte de partage
   ============================================================ */

/**
 * Construit un message WhatsApp formaté avec le récapitulatif de réservation
 */
function buildWhatsAppMessage(booking) {
  const { bookingNumber, passenger, trip } = booking;
  const passengersLabel = trip.passengers > 1
    ? `${trip.passengers} passagers`
    : '1 passager';

  return [
    '🎉 *Réservation SenVoyage confirmée !*',
    '',
    `📋 *N° de réservation :* ${bookingNumber}`,
    '',
    `🗺️ *Trajet :* ${trip.from} → ${trip.to}`,
    `📅 *Date :* ${formatDate(trip.date)}`,
    `🕐 *Départ :* ${trip.departureTime}`,
    `⏱️ *Durée :* ${trip.duration}`,
    `🚌 *Compagnie :* ${trip.company.name}`,
    '',
    `👤 *Passager :* ${passenger.firstName} ${passenger.lastName}`,
    `📞 *Téléphone :* ${passenger.phone}`,
    `💺 *Nb. passagers :* ${passengersLabel}`,
    '',
    `💰 *Prix total :* ${formatPrice(trip.totalPrice)}`,
    '',
    '_Bon voyage avec SenVoyage ! 🇸🇳_',
  ].join('\n');
}


/* ============================================================
   INITIALISATION — détection de la page courante
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname.split('/').pop() || 'index.html';

  if (page === 'index.html' || page === '' || page === '/') {
    initIndexPage();
  } else if (page === 'results.html') {
    initResultsPage();
  } else if (page === 'booking.html') {
    initBookingPage();
  } else if (page === 'confirmation.html') {
    initConfirmationPage();
  }
});
