# 🚌 SenVoyage — Transport Inter-Régions Sénégal

> Application web de simulation de réservation de transport entre les régions du Sénégal.
> 100 % HTML · CSS · JavaScript pur — Aucun framework, aucun backend.

---

## Table des matières

1. [Présentation du projet](#présentation-du-projet)
2. [Aperçu des pages](#aperçu-des-pages)
3. [Structure des fichiers](#structure-des-fichiers)
4. [Fonctionnalités](#fonctionnalités)
5. [Technologies utilisées](#technologies-utilisées)
6. [Compagnies de transport](#compagnies-de-transport)
7. [Régions couvertes](#régions-couvertes)
8. [Flux utilisateur](#flux-utilisateur)
9. [Stockage des données](#stockage-des-données)
10. [Comment lancer le projet](#comment-lancer-le-projet)
11. [Comment tester l'application](#comment-tester-lapplication)
12. [Impression du billet PDF](#impression-du-billet-pdf)
13. [Partage WhatsApp](#partage-whatsapp)
14. [Design & Charte graphique](#design--charte-graphique)
15. [Auteur](#auteur)

---

## Présentation du projet

**SenVoyage** est une application web front-end qui permet à un utilisateur de :

- Rechercher un trajet entre deux régions du Sénégal
- Consulter des résultats de trajets simulés avec prix en FCFA
- Remplir un formulaire de réservation
- Obtenir une confirmation avec numéro de réservation
- Imprimer son billet de transport au format PDF
- Partager sa confirmation de voyage via WhatsApp

L'application est entièrement **statique** : elle fonctionne directement dans le navigateur sans serveur, sans base de données et sans connexion internet (sauf pour le partage WhatsApp).

---

## Aperçu des pages

| Page | Fichier | Description |
|---|---|---|
| Accueil | `index.html` | Formulaire de recherche de trajet |
| Résultats | `results.html` | Liste des trajets disponibles |
| Réservation | `booking.html` | Formulaire passager + récapitulatif |
| Confirmation | `confirmation.html` | Numéro de réservation + billet imprimable |

---

## Structure des fichiers

```
SenVoyage/
│
├── index.html          → Page d'accueil (formulaire de recherche)
├── results.html        → Page des résultats de recherche
├── booking.html        → Page de réservation (formulaire passager)
├── confirmation.html   → Page de confirmation finale
│
├── style.css           → Feuille de style globale (responsive)
├── app.js              → Logique JavaScript complète
│
└── README.md           → Documentation du projet
```

> **Convention** : 1 seul fichier CSS global et 1 seul fichier JS global pour toute l'application.

---

## Fonctionnalités

### Page d'accueil
- Liste déroulante des 14 régions du Sénégal (départ et arrivée)
- Sélection de date avec validation (date passée bloquée)
- Bouton **"Partir aujourd'hui"** pour sélectionner la date du jour en un clic
- Sélection du nombre de passagers (1 à 5)
- Validation complète du formulaire avec messages d'erreur
- Loader animé avant redirection vers les résultats
- Pré-remplissage automatique si l'utilisateur revient en arrière

### Page de résultats
- Affichage de **3 à 5 trajets simulés** générés dynamiquement
- Tri automatique par heure de départ croissante
- Informations affichées par trajet :
  - Nom et logo de la compagnie
  - Heure de départ
  - Durée estimée
  - Nombre de places disponibles
  - Prix unitaire (et prix total si plusieurs passagers)
- Loader pendant la génération des résultats
- Message d'erreur si aucun trajet n'est disponible
- Bouton **"Réserver"** sur chaque carte

### Page de réservation
- Formulaire passager : Prénom, Nom, Téléphone
- Validation du numéro de téléphone au format sénégalais (`7X XXX XX XX`)
- Récapitulatif complet du trajet sélectionné
- Bouton **"Confirmer la réservation"**

### Page de confirmation
- Message de confirmation visuel
- Numéro de réservation généré automatiquement au format `SV-2024-XXXX`
- Récapitulatif complet : passager, trajet, compagnie, prix total
- Bouton **"Imprimer le billet"** → génère un PDF propre
- Bouton **"Envoyer sur WhatsApp"** → partage la confirmation
- Bouton **"Nouvelle réservation"** → réinitialise et revient à l'accueil

---

## Technologies utilisées

| Technologie | Usage |
|---|---|
| **HTML5** | Structure des 4 pages |
| **CSS3** | Styles, animations, responsive (Flexbox + Grid) |
| **JavaScript ES6+** | Logique, génération de données, navigation entre pages |
| **localStorage** | Transfert de données entre les pages |
| **window.print()** | Impression PDF du billet |
| **WhatsApp API** | Partage via `https://wa.me/` |

> Aucun framework JS (React, Vue, Angular), aucun backend, aucune base de données externe.

---

## Compagnies de transport

L'application simule les 4 compagnies suivantes :

| Compagnie | Initiales | Couleur |
|---|---|---|
| **Dakar Express** | DE | Vert |
| **Sénégal Voyage** | SV | Rouge |
| **Téranga Bus** | TB | Jaune |
| **Sahel Transport** | ST | Gris |

Chaque trajet est attribué aléatoirement à l'une de ces compagnies. Pour 5 trajets, une compagnie peut apparaître deux fois avec des horaires différents (comportement réaliste).

---

## Régions couvertes

L'application couvre les **14 régions officielles du Sénégal** :

```
Dakar · Thiès · Diourbel · Fatick · Kaolack · Kaffrine
Kolda · Louga · Matam · Saint-Louis · Sédhiou
Tambacounda · Ziguinchor · Kédougou
```

---

## Flux utilisateur

```
index.html
    │
    │  (recherche : départ, arrivée, date, passagers)
    ▼
results.html
    │
    │  (sélection d'un trajet → clic "Réserver")
    ▼
booking.html
    │
    │  (saisie prénom, nom, téléphone → "Confirmer")
    ▼
confirmation.html
    │
    ├──► Imprimer le billet (PDF)
    ├──► Envoyer sur WhatsApp
    └──► Nouvelle réservation → index.html
```

---

## Stockage des données

Toutes les données transitent entre les pages via **localStorage** :

| Clé | Contenu | Effacée quand |
|---|---|---|
| `sv_search` | Paramètres de recherche (from, to, date, passengers) | Nouvelle réservation |
| `sv_selected_trip` | Trajet sélectionné (compagnie, horaire, prix…) | Nouvelle réservation |
| `sv_booking` | Données complètes (passager + trajet + n° réservation) | Nouvelle réservation |

> Toutes les clés sont effacées automatiquement lors d'un clic sur "Nouvelle réservation".

---

## Comment lancer le projet

### Option 1 — Serveur local Python (recommandé)

```bash
# Naviguer dans le dossier du projet
cd ~/Desktop/SenVoyage

# Lancer le serveur
python3 -m http.server 8080

# Ouvrir dans le navigateur
http://localhost:8080
```

### Option 2 — Extension VS Code "Live Server"

1. Ouvrir le dossier `SenVoyage` dans VS Code
2. Clic droit sur `index.html`
3. Sélectionner **"Open with Live Server"**

### Option 3 — Ouverture directe (déconseillée)

Double-cliquer sur `index.html`.
> ⚠️ Certains navigateurs bloquent localStorage en protocole `file://`.
> Utiliser un serveur local (Option 1 ou 2) est fortement recommandé.

---

## Comment tester l'application

### Scénario complet de test

1. **Ouvrir** `http://localhost:8080`
2. **Sélectionner** un départ (ex : Dakar) et une arrivée (ex : Kaolack)
3. **Choisir une date** ou cliquer sur "Partir aujourd'hui"
4. **Sélectionner** 2 passagers
5. **Cliquer** sur "Rechercher les trajets"
6. **Attendre** le loader (environ 1,2 secondes)
7. **Cliquer** sur "Réserver" sur l'un des trajets
8. **Remplir** le formulaire : Prénom, Nom, Téléphone (ex : `77 123 45 67`)
9. **Cliquer** sur "Confirmer la réservation"
10. **Vérifier** le numéro de réservation au format `SV-2024-XXXX`
11. **Tester** l'impression du billet et le partage WhatsApp

### Tests de validation

| Test | Comportement attendu |
|---|---|
| Soumettre le formulaire vide | Messages d'erreur sur chaque champ |
| Départ = Arrivée | Message "doivent être différents" |
| Date dans le passé | Message "ne peut pas être dans le passé" |
| Téléphone invalide | Message "Format invalide. Ex : 77 123 45 67" |

---

## Impression du billet PDF

Cliquer sur **"Imprimer le billet"** depuis la page de confirmation.

Le billet imprimé contient :
- En-tête SenVoyage
- Bandeau drapeau sénégalais (vert / jaune / rouge)
- Itinéraire : Départ → Arrivée
- Informations complètes : date, heure, durée, compagnie, passager, téléphone
- Numéro de réservation
- Prix total en FCFA
- Mention de présentation à l'embarquement

> Le reste de la page (navigation, boutons, résumé) est masqué à l'impression grâce aux règles CSS `@media print`.

**Pour sauvegarder en PDF** : dans la boîte de dialogue d'impression, choisir **"Enregistrer en PDF"** comme destination.

---

## Partage WhatsApp

Cliquer sur **"Envoyer sur WhatsApp"** depuis la page de confirmation.

Le message envoyé contient :
```
🎉 Réservation SenVoyage confirmée !

📋 N° de réservation : SV-2024-XXXX

🗺️ Trajet : Dakar → Kaolack
📅 Date : 29 mars 2026
🕐 Départ : 08:15
⏱️ Durée : 3h00
🚌 Compagnie : Dakar Express

👤 Passager : Prénom Nom
📞 Téléphone : +221 77 123 45 67
💺 Nb. passagers : 2

💰 Prix total : 10 000 FCFA

Bon voyage avec SenVoyage ! 🇸🇳
```

> Une connexion internet est requise pour ouvrir WhatsApp Web ou l'application mobile.

---

## Design & Charte graphique

### Couleurs principales

| Rôle | Couleur | Code HEX |
|---|---|---|
| Primaire (vert) | Vert Sénégal | `#1a7a3c` |
| Accent (jaune) | Jaune Sénégal | `#fbbf24` |
| Danger (rouge) | Rouge Sénégal | `#dc2626` |
| Fond | Gris clair | `#f8fafc` |
| Texte | Gris foncé | `#1e293b` |

### Responsive

L'application est entièrement responsive :
- **Desktop** : Grille 2×2 pour le formulaire, cartes en liste
- **Tablette** : Adaptation automatique via CSS Grid `auto-fit`
- **Mobile** : Formulaire en colonne, cartes empilées, boutons pleine largeur

### Animations

- Hover sur les cartes de trajet (élévation + ombre)
- Hover sur les boutons (translation verticale)
- Loader avec animation CSS (`@keyframes spin`)
- Transitions douces sur tous les éléments interactifs (`transition: 0.2s ease`)

---

## Auteur

**SenVoyage** — Projet web front-end
Développé avec HTML · CSS · JavaScript pur
© 2024 SenVoyage — Transport inter-régions au Sénégal 🇸🇳

---

*Pour toute question ou amélioration, ouvrir le projet dans un éditeur de code (VS Code recommandé) et modifier les fichiers `app.js` et `style.css`.*
# Senvoyage
