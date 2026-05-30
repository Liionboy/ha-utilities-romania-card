# 🇷🇴 Utilities Romania Card Pack

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)

Card-uri Home Assistant pentru furnizori români: Digi, Hidroelectrica, carburant, energie electrică.

## Features
- Auto-descoperă entități Digi, Hidroelectrica, carburant, energie
- Status facturi, sold, scadențe, consum
- Click-through la detalii
- Visual config editor
- HACS ready

## Installation
HACS → Custom Repositories → `Liionboy/ha-utilities-romania-card` (Lovelace)

## Configuration
```yaml
type: custom:ha-utilities-romania-card
title: 🧾 Utilități România
providers:
  - id: digi
    enabled: true
  - id: hidroelectrica
    enabled: true
  - id: carburant
    enabled: true
  - id: electricity
    enabled: true
```
