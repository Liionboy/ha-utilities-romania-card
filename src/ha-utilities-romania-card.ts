import { LitElement, html, css, CSSResultGroup, TemplateResult, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCardEditor, fireEvent } from 'custom-card-helpers';
import { UtilitiesRomaniaConfig, UtilityProvider, UtilityItem, DEFAULT_CONFIG } from './types';

const CARD_NAME = 'ha-utilities-romania-card';
const VERSION = '1.0.0';

console.info(`%c 🇷🇴 UTILITIES-ROMANIA %c v${VERSION} `,'color:#fff;background:#003f87;font-weight:700;border-radius:4px 0 0 4px;padding:2px 6px;','color:#fff;background:#6b7280;font-weight:700;border-radius:0 4px 4px 0;padding:2px 6px;');

@customElement(CARD_NAME)
export class UtilitiesRomaniaCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public config!: UtilitiesRomaniaConfig;
  @state() private _providers: UtilityProvider[] = [];
  @state() private _loading = true;

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import('./editor/ha-utilities-romania-editor');
    return document.createElement('ha-utilities-romania-editor') as LovelaceCardEditor;
  }
  public static getStubConfig(): UtilitiesRomaniaConfig { return { ...DEFAULT_CONFIG }; }

  setConfig(config: UtilitiesRomaniaConfig): void {
    if (!config || config.show_error) throw new Error('Invalid config');
    this.config = { ...DEFAULT_CONFIG, ...config, type: CARD_NAME };
  }

  updated(changedProps: Map<string, unknown>): void {
    super.updated(changedProps);
    if (changedProps.has('hass') && this.hass) this._compute();
  }

  private _compute(): void {
    if (!this.hass) return;
    const entities = this.hass.states;
    const providers: UtilityProvider[] = [];

    // === DIGI ===
    if (this._isEnabled('digi')) {
      const items: UtilityItem[] = [];
      const achitata = this._find(entities, 'sensor', ['digi_factura_achitata', 'digi.*achitata']);
      const rest = this._find(entities, 'sensor', ['digi_are_rest', 'digi.*rest']);
      const dataFactura = this._find(entities, 'sensor', ['digi_data_ultimei', 'digi.*data']);
      const valoare = this._find(entities, 'sensor', ['digi_valoare', 'digi.*valoare', 'digi_suma']);
      const adresa = this._find(entities, 'sensor', ['digi_adresa']);

      let status: 'ok' | 'warning' | 'error' = 'ok';
      let statusLabel = 'La zi';

      if (rest && rest.state === 'True') { status = 'error'; statusLabel = 'Rest de plată'; }
      else if (achitata && achitata.state === 'True') { status = 'ok'; statusLabel = 'Achitat'; }

      if (achitata) items.push({ label: 'Factură achitată', value: achitata.state === 'True' ? '✅ Da' : '❌ Nu', icon: 'mdi:check-decagram', severity: achitata.state === 'True' ? 'ok' : 'error', entity_id: achitata.entity_id });
      if (dataFactura) items.push({ label: 'Ultima factură', value: dataFactura.state, icon: 'mdi:calendar', entity_id: dataFactura.entity_id });
      if (valoare) items.push({ label: 'Valoare', value: valoare.state, icon: 'mdi:cash', entity_id: valoare.entity_id });
      if (adresa) items.push({ label: 'Adresă', value: adresa.state, icon: 'mdi:map-marker', entity_id: adresa.entity_id });

      providers.push({ id: 'digi', name: 'Digi România', icon: 'mdi:wan', status, statusLabel, items });
    }

    // === HIDROELECTRICA ===
    if (this._isEnabled('hidroelectrica')) {
      const items: UtilityItem[] = [];
      const restanta = this._find(entities, 'sensor', ['hidroelectrica.*factura_restanta', 'hidro.*restanta']);
      const sold = this._find(entities, 'sensor', ['hidroelectrica.*sold', 'hidro.*sold']);
      const index = this._find(entities, 'sensor', ['hidroelectrica.*index_energie', 'hidro.*index']);
      const consum = this._find(entities, 'sensor', ['hidroelectrica.*consum', 'hidro.*consum']);
      const plati = this._find(entities, 'sensor', ['hidroelectrica.*plati', 'hidro.*plati']);

      let status: 'ok' | 'warning' | 'error' = 'ok';
      let statusLabel = 'La zi';

      if (restanta) {
        if (restanta.state === 'Da') {
          status = 'error';
          const total = (restanta.attributes as Record<string, unknown>)?.['Total neachitat'] || '';
          statusLabel = `Restanță ${total}`;
        } else {
          status = 'ok';
          statusLabel = 'La zi';
        }
        const ultima = (restanta.attributes as Record<string, unknown>)?.['Ultima factură emisă'];
        const scadenta = (restanta.attributes as Record<string, unknown>)?.['Scadentă'];
        if (ultima) items.push({ label: 'Ultima factură', value: String(ultima), icon: 'mdi:invoice-text', entity_id: restanta.entity_id });
        if (scadenta) items.push({ label: 'Scadentă', value: String(scadenta), icon: 'mdi:calendar-clock', entity_id: restanta.entity_id });
      }
      if (sold) items.push({ label: 'Sold', value: sold.state, icon: 'mdi:cash-check', entity_id: sold.entity_id });
      if (index) items.push({ label: 'Index consum', value: index.state, icon: 'mdi:counter', entity_id: index.entity_id });
      if (consum) items.push({ label: 'Consum anual', value: `${consum.state} kWh`, icon: 'mdi:flash', entity_id: consum.entity_id });
      if (plati) items.push({ label: 'Plăți efectuate', value: plati.state, icon: 'mdi:receipt', entity_id: plati.entity_id });

      providers.push({ id: 'hidroelectrica', name: 'Hidroelectrica', icon: 'mdi:lightning-bolt', status, statusLabel, items });
    }

    // === CARBURANT ===
    if (this._isEnabled('carburant')) {
      const items: UtilityItem[] = [];
      const fuelEntities = Object.entries(entities)
        .filter(([id]) => id.includes('carburant') || id.includes('fuel') || id.includes('benzina') || id.includes('motorina'))
        .filter(([id]) => id.startsWith('sensor.'));

      for (const [id, entity] of fuelEntities.slice(0, 5)) {
        const name = (entity.attributes as Record<string, unknown>)?.friendly_name as string || id;
        items.push({ label: name, value: `${entity.state} RON/L`, icon: 'mdi:gas-station', entity_id: id });
      }

      if (items.length > 0) {
        providers.push({ id: 'carburant', name: 'Carburant', icon: 'mdi:gas-station', status: 'ok', statusLabel: `${items.length} stații`, items });
      }
    }

    // === ENERGIE ELECTRICA ===
    if (this._isEnabled('electricity')) {
      const items: UtilityItem[] = [];
      const priceEntities = Object.entries(entities)
        .filter(([id]) => (id.includes('pret') || id.includes('price') || id.includes('tarif')) && (id.includes('energie') || id.includes('electric') || id.includes('kwh')))
        .filter(([id]) => id.startsWith('sensor.'));

      for (const [id, entity] of priceEntities.slice(0, 3)) {
        const name = (entity.attributes as Record<string, unknown>)?.friendly_name as string || id;
        items.push({ label: name, value: entity.state, icon: 'mdi:currency-usd', entity_id: id });
      }

      if (items.length > 0) {
        providers.push({ id: 'electricity', name: 'Energie Electrică', icon: 'mdi:transmission-tower', status: 'ok', statusLabel: `${items.length} tarife`, items });
      }
    }

    this._providers = providers;
    this._loading = false;
  }

  private _isEnabled(id: string): boolean {
    return this.config?.providers?.find((p) => p.id === id)?.enabled ?? true;
  }

  private _find(entities: Record<string, { entity_id: string; state: string; attributes: Record<string, unknown> }>, domain: string, patterns: string[]) {
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'i');
      for (const [id, entity] of Object.entries(entities)) {
        if (!id.startsWith(domain + '.')) continue;
        if (regex.test(id)) return entity;
      }
    }
    return null;
  }

  private _handleItem(item: UtilityItem): void {
    if (item.entity_id) fireEvent(this, 'hass-more-info', { entityId: item.entity_id });
  }

  getCardSize() { return 2 + this._providers.length; }

  protected render(): TemplateResult | typeof nothing {
    if (!this.config || !this.hass) return nothing;
    if (this._loading) return html`<ha-card><div class="loading">Se încarcă...</div></ha-card>`;

    return html`
      <ha-card>
        ${this.config.show_header !== false ? html`
          <div class="header">
            <span class="header-flag">🇷🇴</span>
            <div class="header-text">
              <div class="header-title">${this.config.title || '🧾 Utilități România'}</div>
              <div class="header-sub">${this._providers.length} furnizori</div>
            </div>
          </div>
        ` : nothing}
        <div class="content">
          ${this._providers.length === 0
            ? html`<div class="empty">Nu s-au găsit furnizori români</div>`
            : this._providers.map((p) => this._renderProvider(p))}
        </div>
      </ha-card>
    `;
  }

  private _renderProvider(provider: UtilityProvider): TemplateResult {
    return html`
      <div class="provider status-${provider.status}">
        <div class="provider-header">
          <ha-icon .icon=${provider.icon}></ha-icon>
          <span class="provider-name">${provider.name}</span>
          <span class="provider-status status-${provider.status}">${provider.statusLabel}</span>
        </div>
        <div class="provider-items">
          ${provider.items.map((item) => html`
            <div class="item" @click=${() => this._handleItem(item)}>
              ${item.icon ? html`<ha-icon class="item-icon" .icon=${item.icon}></ha-icon>` : nothing}
              <span class="item-label">${item.label}</span>
              <span class="item-value severity-${item.severity || ''}">${item.value}</span>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host { display: block; }
      ha-card { border-radius: 16px; overflow: hidden; }
      .loading, .empty { padding: 32px; text-align: center; color: var(--secondary-text-color); }
      .header { display: flex; align-items: center; gap: 12px; padding: 18px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); background: linear-gradient(135deg, rgba(0,62,135,0.08), rgba(252,204,24,0.06)); }
      .header-flag { font-size: 28px; }
      .header-title { font-size: 16px; font-weight: 600; color: var(--primary-text-color); }
      .header-sub { font-size: 12px; color: var(--secondary-text-color); }
      .content { padding: 8px 0; }
      .provider { margin: 6px 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); overflow: hidden; }
      .provider.status-ok { border-left: 3px solid #22c55e; }
      .provider.status-warning { border-left: 3px solid #f59e0b; }
      .provider.status-error { border-left: 3px solid #ef4444; }
      .provider-header { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: rgba(255,255,255,0.02); }
      .provider-header ha-icon { --mdc-icon-size: 20px; color: var(--primary-text-color); }
      .provider-name { flex: 1; font-size: 14px; font-weight: 600; color: var(--primary-text-color); }
      .provider-status { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 10px; }
      .provider-status.status-ok { background: rgba(34,197,94,0.15); color: #22c55e; }
      .provider-status.status-warning { background: rgba(245,158,11,0.15); color: #f59e0b; }
      .provider-status.status-error { background: rgba(239,68,68,0.15); color: #ef4444; }
      .provider-items { padding: 4px 14px 10px; }
      .item { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 6px; cursor: pointer; transition: background 0.2s; }
      .item:hover { background: rgba(255,255,255,0.06); }
      .item-icon { --mdc-icon-size: 16px; color: var(--secondary-text-color); }
      .item-label { flex: 1; font-size: 13px; color: var(--secondary-text-color); }
      .item-value { font-size: 13px; font-weight: 500; color: var(--primary-text-color); }
      .item-value.severity-ok { color: #22c55e; }
      .item-value.severity-error { color: #ef4444; }
      .item-value.severity-warning { color: #f59e0b; }
    `;
  }
}

declare global { interface HTMLElementTagNameMap { 'ha-utilities-romania-card': UtilitiesRomaniaCard; } }
