import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';

export interface DJStyleSelectorOption {
  value: string;
  label: string;
  color?: string;
}

@customElement('dj-style-selector')
export class DJStyleSelector extends LitElement {
  static override styles = css`
    @keyframes rgb-glow {
      0% {
        box-shadow: 0 0 4px #ff0000, 0 0 8px #ff0000;
      }
      17% {
        box-shadow: 0 0 4px #ff00ff, 0 0 8px #ff00ff;
      }
      33% {
        box-shadow: 0 0 4px #0000ff, 0 0 8px #0000ff;
      }
      50% {
        box-shadow: 0 0 4px #00ffff, 0 0 8px #00ffff;
      }
      67% {
        box-shadow: 0 0 4px #00ff00, 0 0 8px #00ff00;
      }
      83% {
        box-shadow: 0 0 4px #ffff00, 0 0 8px #ffff00;
      }
      100% {
        box-shadow: 0 0 4px #ff0000, 0 0 8px #ff0000;
      }
    }
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 5px;
    }
    .option {
      background-color: rgba(0, 0, 0, 0.4);
      color: #fff;
      border: 1px solid #555;
      border-radius: 4px;
      padding: 8px 12px;
      text-align: center;
      cursor: pointer;
      transition: background-color 0.2s, box-shadow 0.2s;
      font-size: 0.9em;
    }
    .option:hover {
      background-color: rgba(0, 0, 0, 0.5);
      box-shadow: 0 0 5px -1px #007bff;
    }
    .option.selected {
      /* Common styles for all selected options, including .auto-scale-selected */
      color: #fff;
      font-weight: bold;
      text-shadow: 0px 0px 4px rgba(0,0,0,0.7), 0px 0px 1px rgba(0,0,0,0.9);
    }
    .option.selected:not(.auto-scale-selected) {
      /* Styles specific to selected options that are NOT .auto-scale-selected */
      background-color: rgba(0, 0, 0, 0.4);
      box-shadow: 0 0 12px var(--glow-color, #007bff), 0 0 24px var(--glow-color, #007bff);
    }
    .option[data-auto-scale] {
      /* Auto scale button always uses dark background style */
      background-color: rgba(0, 0, 0, 0.4) !important;
    }
    .option[data-auto-scale]:hover {
      /* Hover styles for auto scale button */
      background-color: rgba(0, 0, 0, 0.5) !important;
      box-shadow: 0 0 5px -1px #007bff;
    }
    .option.auto-scale-selected {
      /* Styles specific to the selected "Auto" scale option */
      border: 1px solid transparent;
      animation: rgb-glow 40s linear infinite;
      /* Keep the dark background even when selected */
      background-color: rgba(0, 0, 0, 0.4) !important;
    }
  `;

  @property({ type: Array })
  options: DJStyleSelectorOption[] = [];

  @property({ type: String })
  value = '';

  private _handleOptionClick(optionValue: string) {
    this.value = optionValue;
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: this.value,
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render() {
    return html`
      ${map(this.options, (option) => {
        const isSelected = option.value === this.value;
        const isAutoScale = option.value === 'SCALE_UNSPECIFIED';

        let classes = 'option';
        if (isSelected) {
          classes += ' selected';
          if (isAutoScale) {
            classes += ' auto-scale-selected'; // Add specific class for selected "Auto" scale
          }
        }

        // Only set --glow-color style if it's not the "Auto" scale option or if it's not selected.
        // Or, more simply, don't set it for the selected "Auto" scale option.
        // NB: The component's own CSS for .option.selected uses var(--glow-color).
        // The original code set style="--glow-color: ...".
        // For the auto-scale-selected, we want to avoid the component's default gray.
        // So, we can either not set --glow-color for it, or ensure our new class overrides it.
        // Let's try not setting the inline style that defines --glow-color for the selected Auto Scale.

        if (isAutoScale) {
          return html`
              <div
                class="${classes}"
                data-auto-scale
                @click=${() => this._handleOptionClick(option.value)}
              >
                ${option.label}
              </div>`;
        }
        return html`
              <div
                class="${classes}"
                style="--glow-color: ${option.color || '#007bff'};"
                @click=${() => this._handleOptionClick(option.value)}
              >
                ${option.label}
              </div>`;
      })}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dj-style-selector': DJStyleSelector;
  }
}
