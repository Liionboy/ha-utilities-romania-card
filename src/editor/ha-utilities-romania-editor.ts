import { LitElement, html, css, TemplateResult, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, fireEvent } from 'custom-card-helpers';
import { UtilitiesRomaniaConfig, DEFAULT_CONFIG } from '../types';

@customElement('ha-utilities-romania-editor')
export class UtilitiesRomaniaEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public config!: UtilitiesRomaniaConfig;
  @state() private _config!: UtilitiesRomaniaConfig;

  public setConfig(config: UtilitiesRomaniaConfig): void { this._config = { ...DEFAULT_CONFIG, ...config }; }

  private _update(key: string, value: unknown): void {
    if (!this._config) return;
    this._config = { ...this._config, [key]: value };
    fireEvent(this, 'config-changed', { config: this._config });
  }

  private _updateProvider(id: string, key: string, value: unknown): void {
    if (!this._config?.providers) return;
    this._update('providers', this._config.providers.map((p) => p.id === id ? { ...p, [key]: value } : p));
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    return html`
      <div class="config">
        <ha-textfield label="Title" .value=${this._config.title || ''} @input=${(e: Event) => this._update('title', (e.target as HTMLInputElement).value)}></ha-textfield>
        <div class="section">Furnizori</div>
        ${(this._config.providers ?? []).map(p => html`
          <div class="row"><ha-switch .checked=${p.enabled} @change=${(e: Event) => this._updateProvider(p.id, 'enabled', (e.target as HTMLInputElement).checked)}></ha-switch><span>${p.name || p.id}</span></div>
        `)}
      </div>
    `;
  }

  static get styles() { return css`
    .config { display: flex; flex-direction: column; gap: 12px; padding: 4px 0; }
    .section { font-size: 14px; font-weight: 600; color: var(--primary-text-color); margin-top: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px; }
    .row { display: flex; align-items: center; gap: 12px; }
    .row span { font-size: 14px; color: var(--primary-text-color); }
    ha-textfield { width: 100%; }
  `; }
}

declare global { interface HTMLElementTagNameMap { 'ha-utilities-romania-editor': UtilitiesRomaniaEditor; } }
