import { LightningElement, api } from 'lwc';

export default class ParentComponent extends LightningElement {
    @api delayTime = 2000; // Configurable attribute with default value
    @api emojis = '\ud83c\udfc8\ud83c\udf1f\ud83c\udfae\ud83e\udd20\ud83d\udcaa\ud83d\ude0e'; // Default emojis
    @api number = 'tons'; // Default number
    @api size = 'tons'; // Default size (dropdown values: few, normal, plenty, tons)

    showConfetti = false;

    connectedCallback() {
        // Delay the display of the confetti component based on configurable delay time
        setTimeout(() => {
            this.showConfetti = true;
        }, this.delayTime);
    }
}