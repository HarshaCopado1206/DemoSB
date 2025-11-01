import { LightningElement } from 'lwc';
import ALRIGHT_AUDIO from '@salesforce/resourceUrl/alright';

export default class AudioPlayer extends LightningElement {
    audioUrl = ALRIGHT_AUDIO;

    connectedCallback() {
        // The audio will play automatically on page load
    }
}