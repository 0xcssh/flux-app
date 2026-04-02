# FLUX — Suivi hormonal masculin
> Fichier de contexte projet pour Claude Code

---

## Vision

**Aider les hommes à comprendre leurs fluctuations naturelles d'énergie, d'humeur et de performance pour prendre de meilleures décisions au quotidien.**

---

## Fondation scientifique

L'app repose sur des faits endocrinologiques documentés :

- **Rythme circadien (24h)** : la testostérone pic entre 5h30 et 8h00, puis chute de 20 à 43% en soirée. Fait robuste, validé par de nombreuses études (Diver et al. 2003, Brambilla et al. 2008).
- **Rythme infradien (~20-30 jours)** : Doering et al. (1975) a détecté des cycles chez 60% des hommes suivis. Celec et al. (2003) a identifié deux rythmes distincts (~20 jours et ~30 jours) sur la testostérone salivaire. Résultats fascinants mais non encore pleinement établis — à présenter avec nuance dans l'app.
- **Rythme saisonnier** : pic en fin d'été/automne, nadir en hiver/printemps. Validé sur de larges cohortes (1 500+ hommes, étude de Tromsø).
- **Impact fonctionnel** : humeur, énergie, libido, cognition, performance physique fluctuent en corrélation avec ces cycles.

L'app ne prétend pas remplacer un bilan médical. Elle aide l'utilisateur à observer ses propres patterns.

---

## Positionnement produit

- **Catégorie** : santé masculine / bien-être / biohacking
- **Analogie** : "Le Flo (suivi menstruel) pour les hommes"
- **Ton** : scientifique et accessible, jamais moralisateur, jamais "bro science"
- **Plateforme** : iOS + Android simultanément (Expo + EAS Build). Compte Apple Developer actif. Dev depuis Windows.
- **Langue** : anglais par défaut + français. Multi-langue dès le lancement.
- **Design** : clean et médical — fond clair, tons bleus/verts, vibe confiance/santé, style Apple Health
- **Modèle** : Freemium avec trial 7 jours Premium à l'inscription, puis paywall. Free + Premium + Pro.
- **Module NoFap** : intégré et visible dès le lancement, levier d'acquisition principal

---

## Architecture de l'app

### 5 écrans principaux

#### 1. Dashboard — Score du jour
- Score de vitalité quotidien (0-100) calculé depuis les logs
- Indicateurs : énergie, humeur, libido, sommeil, performance physique
- Phase du cycle circadien actuelle (montée / pic / descente / récupération)
- Conseil personnalisé du jour basé sur la phase

#### 2. Mon Cycle
- Visualisation du rythme circadien sur 24h
- Courbe infradienne sur 30 jours (débloquée après 14 jours de logs)
- 4 phases simplifiées : montée / pic / descente / récupération
- Comparaison avec les logs passés

#### 3. Log quotidien
- Check-in max 60 secondes
- 6 curseurs : énergie, humeur, libido, sommeil (durée + qualité), stress, entraînement
- Champ notes libre (optionnel)
- Module NoFap/NoPorn (optionnel, activable dans les paramètres)
- Notification push à heure fixe choisie par l'utilisateur

#### 4. Insights & Corrélations *(Premium)*
- Disponible après 14 jours de données
- Détection de patterns personnels par IA
- Corrélations habitudes ↔ bien-être
- Exemples : "Tu dors moins bien les lundis → énergie en chute le mardi", "Tes pics d'énergie arrivent tous les 22-24 jours"
- Recommandations actionnables : sport, nutrition, sommeil, récupération

#### 5. Profil & Progression
- Historique 3 / 6 / 12 mois
- Intégration wearables : Apple Watch, Oura Ring, WHOOP
- Export rapport PDF (partage médecin)
- Gestion abonnement
- Paramètres (heure de notification, modules actifs)

---

## Module NoFap / NoPorn

### Philosophie
Module **optionnel**, activable dans les paramètres. FLUX ne prend aucune position morale. L'app montre uniquement les données personnelles de l'utilisateur — est-ce que son énergie, sa libido, son humeur changent réellement avec l'abstinence ? La science parle, pas l'app.

### Fonctionnalités
- Compteur de streak (jours consécutifs)
- Intégration dans le log quotidien (case à cocher discrète)
- Graphique de corrélation streak ↔ score de vitalité
- Comparaison anonyme et agrégée avec d'autres utilisateurs (opt-in)
- Notifications de milestone : 7j, 14j, 30j, 90j

### Ce que le module ne fait PAS
- Pas de contenu moralisateur
- Pas de badge honteux en cas d'échec
- Pas de positionnement idéologique (ni pro ni anti)
- Pas d'accès à du contenu externe

---

## Modèle économique

### Gratuit
- Log quotidien illimité
- Score de vitalité du jour
- Visualisation circadienne basique
- Historique 7 jours
- Contenu éducatif (articles sur les cycles masculins)
- Module NoFap basique (streak + log)

### Premium — 9,99€/mois ou 59,99€/an
- Historique illimité
- Détection du cycle infradien personnel
- Corrélations IA habitudes ↔ énergie
- Intégration wearables (Apple Watch, Oura, WHOOP)
- Rapports mensuels PDF
- Recommandations personnalisées sport / nutrition / sommeil
- Module NoFap avancé (corrélations, comparaison anonyme)

### Pro — 19,99€/mois
- Tout Premium +
- Intégration kits de test testostérone à domicile (partenaires : Everlywell, myLAB Box)
- Suivi TRT (Testosterone Replacement Therapy)
- Rapport médecin exportable
- Coaching IA personnalisé

### Revenus additionnels (phase 2)
- Marketplace de tests sanguins (commission ~20%)
- Suppléments recommandés (affiliation)
- Coaching individuel (80-100€/session)
- B2B corporate wellness

---

## Données de marché

- Marché santé numérique masculine : **4,2 Mds$ en 2024**, projection **17,5 Mds$ en 2033** (TCAC 18,7%)
- Flo (référence féminine) : 380M+ téléchargements, 70M+ MAU, **275M$ de revenus en 2025**
- Taux de conversion Flo : ~28% free → payant
- Aucun concurrent direct occupant ce positionnement
- Communauté NoFap : plusieurs millions d'hommes actifs (Reddit r/NoFap : 900K+ membres)
- Intérêt culturel en forte hausse : prescriptions TRT +13% en Angleterre en 2024, triplement aux USA en une décennie

---

## Go-to-market

### Phase 1 — Lancement
- iOS + Android simultanément (Expo)
- App complète : 5 écrans + module NoFap + onboarding éducatif + notifications contextuelles
- Freemium avec trial 7 jours Premium
- Contenu éducatif : onboarding + 5-10 articles + tips quotidiens contextuels
- Cible : hommes 25-40 ans, sportifs, biohackers, communauté NoFap
- Canal principal : TikTok / Instagram Reels (contenu éducatif : "ce que personne ne t'a dit sur tes hormones")
- Micro-influenceurs santé masculine (10K-100K abonnés)
- Présence organique Reddit : r/NoFap, r/Testosterone, r/biohacking, r/malehealth

### Phase 2 — Croissance (mois 6-18)
- Partenariats wearables (Oura, WHOOP)
- Intégration kits de test à domicile
- IA avancée pour détection de patterns
- SEO long-tail sur les cycles masculins

### Objectifs an 1
- 50 000 utilisateurs actifs mensuels
- 5 000 abonnés payants
- ARR cible : ~300 000€

---

## Stack technique (décidée)

- **Frontend mobile** : React Native + Expo (iOS + Android depuis une codebase, dev sur Windows)
- **Build** : EAS Build (compilation iOS cloud, pas besoin de Mac)
- **Backend** : Supabase (auth + PostgreSQL + Row Level Security + Realtime)
- **Base de données** : PostgreSQL via Supabase (idéal pour séries temporelles / logs quotidiens)
- **IA / ML** : corrélations statistiques simples au lancement (moyennes glissantes, Pearson), IA avancée en phase 2
- **Notifications push** : Expo Notifications
- **Wearables** : phase 2 (Apple HealthKit, Oura API, WHOOP API)
- **Paiement** : RevenueCat (gestion abonnements iOS/Android + trial 7 jours)
- **Analytics** : Mixpanel ou PostHog
- **i18n** : multi-langue dès le départ (anglais + français)

---

## Principes de développement

- **Privacy first** : données de santé sensibles. Row Level Security Supabase. Pas de revente de données. Conformité RGPD obligatoire.
- **Offline first** : le log quotidien doit fonctionner sans connexion, sync en arrière-plan.
- **Performance** : app légère, check-in < 60 secondes garanti.
- **Accessibilité** : support mode sombre natif, tailles de texte dynamiques.
- **Ton de l'UI** : clean et médical, scientifique mais chaleureux. Pas de culpabilisation. Pas de gamification agressive.
- **Approche MVP** : pas de beta test préalable — on build l'app complète et on lance directement sur les stores pour monétiser.

## Stratégie de contenu éducatif

- **Onboarding** : 3-4 écrans au premier lancement expliquant les cycles masculins (circadien, infradien, saisonnier)
- **Articles** : bibliothèque de 5-10 articles (rythmes circadiens, sommeil, testostérone, etc.)
- **Notifications contextuelles** : tips quotidiens liés à l'heure ("Il est 7h, ton pic de testostérone est maintenant — bon moment pour l'entraînement")

---

## Fichiers et dossiers du projet (à créer)

```
flux/
├── CLAUDE.md              ← ce fichier
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx      ← Dashboard
│   │   ├── cycle.tsx      ← Mon Cycle
│   │   ├── log.tsx        ← Log quotidien
│   │   ├── insights.tsx   ← Insights (Premium)
│   │   └── profile.tsx    ← Profil
│   └── _layout.tsx
├── components/
│   ├── VitalityScore.tsx
│   ├── CircadianChart.tsx
│   ├── DailyLogForm.tsx
│   ├── NoFapTracker.tsx
│   └── InsightCard.tsx
├── lib/
│   ├── hormoneEngine.ts   ← logique cycles + score
│   ├── correlations.ts    ← détection patterns IA
│   └── notifications.ts
├── store/
│   └── userStore.ts       ← état global (Zustand)
└── supabase/
    └── schema.sql
```

---

## Contexte créateur

Projet initié par **Cash (Anthony Awdi)**, entrepreneur basé à Toulouse. Fondateur de Meara (agence d'automatisation SAV e-commerce via IA). Profil : marketing digital, e-commerce, automatisation n8n, Shopify, IA.

L'app FLUX est un projet parallèle en phase d'exploration / validation d'idée.
