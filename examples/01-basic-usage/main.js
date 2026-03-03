// @ts-check
import { DomScope } from 'dom-scope';

const el = /** @type {HTMLElement} */ (document.getElementById('user-card'));
const scope = new DomScope(el);

// Validation (optional but recommended)
scope.checkRefs({
    userName: HTMLElement,
    userStatus: HTMLElement,
    toggleBtn: HTMLButtonElement
});

const { userName, userStatus, toggleBtn } = scope.refs;

userName.textContent = "Albert Bazaleev";

toggleBtn.onclick = () => {
    const isOnline = userStatus.textContent.includes('Online');
    userStatus.textContent = isOnline ? 'Status: Offline' : 'Status: Online';
    toggleBtn.textContent = isOnline ? 'Log In' : 'Log Out';
};