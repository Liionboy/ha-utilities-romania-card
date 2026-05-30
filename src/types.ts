import { LovelaceCardConfig } from 'custom-card-helpers';

export interface UtilitiesRomaniaConfig extends LovelaceCardConfig {
  type: string;
  title?: string;
  show_header?: boolean;
  providers?: ProviderConfig[];
  refresh_minutes?: number;
}

export interface ProviderConfig {
  id: string;
  enabled: boolean;
  name?: string;
  icon?: string;
  entity_ids?: Record<string, string>;
}

export interface UtilityProvider {
  id: string;
  name: string;
  icon: string;
  status: 'ok' | 'warning' | 'error' | 'unknown';
  statusLabel: string;
  items: UtilityItem[];
}

export interface UtilityItem {
  label: string;
  value: string;
  icon?: string;
  severity?: 'ok' | 'warning' | 'error';
  entity_id?: string;
}

export const DEFAULT_CONFIG: UtilitiesRomaniaConfig = {
  type: 'custom:ha-utilities-romania-card',
  title: '🧾 Utilități România',
  show_header: true,
  refresh_minutes: 10,
  providers: [
    { id: 'digi', enabled: true, name: 'Digi România', icon: 'mdi:wan' },
    { id: 'hidroelectrica', enabled: true, name: 'Hidroelectrica', icon: 'mdi:lightning-bolt' },
    { id: 'carburant', enabled: true, name: 'Carburant', icon: 'mdi:gas-station' },
    { id: 'electricity', enabled: true, name: 'Energie Electrică', icon: 'mdi:transmission-tower' },
  ],
};
