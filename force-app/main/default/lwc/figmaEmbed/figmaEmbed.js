import {
	LightningElement,
	api
} from 'lwc';
const DEFAULT_WIDTH = '100%';
const DEFAULT_HEIGHT = '600px';
const DEFAULT_SCALING = 'scale-down-width';
const DEFAULT_CONTENT_SCALING = 'responsive';
const DEFAULT_HIDE_UI = true;
const DEFAULT_SPINNER_DURATION = 4000; // 4 seconds
const DEFAULT_SPINNER_HEX_COLOR = '#FFFFFF';
const DEFAULT_SPINNER_OPACITY = '1';
export default class FigmaEmbed extends LightningElement {
	@api embedUrl;
	@api width = DEFAULT_WIDTH;
	@api height = DEFAULT_HEIGHT;
	@api scaling = DEFAULT_SCALING;
	@api contentScaling = DEFAULT_CONTENT_SCALING;
	@api hideUi = DEFAULT_HIDE_UI;
	@api spinnerDuration = DEFAULT_SPINNER_DURATION;
	@api spinnerHexColor = DEFAULT_SPINNER_HEX_COLOR;
	@api spinnerOpacity = DEFAULT_SPINNER_OPACITY;
	isLoading = true;
	connectedCallback() {
		// Hide the spinner overlay after the specified spinnerDuration duration
		this.spinnerTimeoutId = setTimeout(() => {
			this.isLoading = false;
		}, this.spinnerDuration);
	}
	disconnectedCallback() {
		// Clear the timeout if the component is removed from the DOM
		if (this.spinnerTimeoutId) {
			clearTimeout(this.spinnerTimeoutId);
		}
	}
	get computedEmbedUrl() {
		if (!this.isValidUrl(this.embedUrl)) {
			console.error('Invalid URL:', this.embedUrl);
			return '';
		}
		const url = new URL(this.embedUrl);
		const params = new URLSearchParams(url.search);
		// Update parameters based on builder properties
		params.set('scaling', this.scaling);
		params.set('content-scaling', this.contentScaling);
		params.set('hide-ui', this.hideUi ? '1' : '0');
		const updatedUrl = `${url.origin}${url.pathname}?${params.toString()}`;
		return updatedUrl;
	}
	get computedStyle() {
		return `width: ${this.width}; height: ${this.height};`;
	}
	get overlayClass() {
		return this.isLoading ? 'slds-spinner_container' : 'slds-hide';
	}
	get spinnerStyle() {
		const rgbaColor = this.hexToRgba(this.spinnerHexColor, this.spinnerOpacity);
		return `background: ${rgbaColor};`;
	}
	isValidUrl(string) {
		try {
			new URL(string);
			return true;
		} catch (_) {
			return false;
		}
	}
	hexToRgba(hex, opacity) {
		let r = 0,
			g = 0,
			b = 0;
		// 3 digits
		if (hex.length === 4) {
			r = parseInt(hex[1] + hex[1], 16);
			g = parseInt(hex[2] + hex[2], 16);
			b = parseInt(hex[3] + hex[3], 16);
			// 6 digits
		} else if (hex.length === 7) {
			r = parseInt(hex[1] + hex[2], 16);
			g = parseInt(hex[3] + hex[4], 16);
			b = parseInt(hex[5] + hex[6], 16);
		}
		return `rgba(${r}, ${g}, ${b}, ${opacity})`;
	}
}