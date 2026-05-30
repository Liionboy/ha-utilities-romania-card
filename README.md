# 🇷🇴 Utilities Romania Card Pack

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/v/release/Liionboy/ha-utilities-romania-card)](https://github.com/Liionboy/ha-utilities-romania-card/releases)
[![License](https://img.shields.io/github/license/Liionboy/ha-utilities-romania-card)](LICENSE)

**Card-uri Home Assistant pentru furnizori români:** Digi, Hidroelectrica, carburant, energie electrică. Vezi facturi, sold, scadențe, consum — totul într-un singur card.

## ✨ Features

- Auto-descoperă entități Digi, Hidroelectrica, carburant, energie
- Status facturi, sold, scadențe, consum
- Click-through la detalii
- Visual config editor
- HACS ready

## 📦 Installation

### Option 1: HACS (recommended)

1. Open **HACS** → **Frontend** → ⋮ → **Custom Repositories**
2. Add repository: `Liionboy/ha-utilities-romania-card`
3. Category: **Lovelace** → Click **Add**
4. Find **Utilities Romania Card Pack** in HACS → Click **Install**
5. Go to **Settings** → **Dashboards** → **Resources** → **Add**:
   ```
   /hacsfiles/ha-utilities-romania-card/ha-utilities-romania-card.js
   type: JavaScript Module
   ```
6. **Restart Home Assistant** (or clear browser cache with Ctrl+Shift+R)
7. Edit your dashboard → Add card → Search for `ha-utilities-romania-card`

### Option 2: Manual Install

1. Download `ha-utilities-romania-card.js` from [Releases](https://github.com/Liionboy/ha-utilities-romania-card/releases/latest)
2. Copy the file to your Home Assistant `/config/www/` directory
3. Go to **Settings** → **Dashboards** → **Resources** → **Add**:
   ```
   /local/ha-utilities-romania-card.js
   type: JavaScript Module
   ```
4. **Restart Home Assistant** (or clear browser cache)
5. Edit your dashboard → Add card → Search for `ha-utilities-romania-card`

### Option 3: Manual via YAML

Add to your `configuration.yaml`:
```yaml
lovelace:
  resources:
    - url: /local/ha-utilities-romania-card.js
      type: module
```

## ⚙️ Configuration

### Minimal (auto-discovers entities)

```yaml
type: custom:ha-utilities-romania-card
```

### Full Configuration

```yaml
type: custom:ha-utilities-romania-card
title: 🧾 Utilități România
show_header: true
refresh_minutes: 10
providers:
  - id: digi
    enabled: true
    name: Digi România
    icon: mdi:wan
  - id: hidroelectrica
    enabled: true
    name: Hidroelectrica
    icon: mdi:lightning-bolt
  - id: carburant
    enabled: true
    name: Carburant
    icon: mdi:gas-station
  - id: electricity
    enabled: true
    name: Energie Electrică
    icon: mdi:transmission-tower
```

## 🇷🇴 Supported Providers

| Provider | Entități detectate automat |
|----------|---------------------------|
| **Digi** | Factură achitată, rest de plată, data ultimei facturi, adresă |
| **Hidroelectrica** | Factură restantă, sold, index consum, plăți, scadențe |
| **Carburant** | Prețuri carburant (benzină, motorină) |
| **Energie Electrică** | Tarife energie electrică |

## 📄 License

MIT
