// @ts-check
import { selectRefs } from 'dom-scope';

const appRoot = /** @type {HTMLElement} */ (document.getElementById('app-root'));
const modalPortal = /** @type {HTMLElement} */ (document.getElementById('modal-portal'));

// Using selectRefs with an array of roots to merge them into one logical scope
const refs = selectRefs([appRoot, modalPortal], {
    openModal: HTMLButtonElement,
    closeModal: HTMLButtonElement,
    modalTitle: HTMLElement,
    settingsInput: HTMLInputElement,
});

refs.openModal.onclick = () => {
    modalPortal.style.display = 'block';
};

refs.closeModal.onclick = () => {
    console.log('Saving key:', refs.settingsInput.value);
    modalPortal.style.display = 'none';
};
