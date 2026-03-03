// @ts-check
import { DomScope } from 'dom-scope';

const dashboardEl = /** @type {HTMLElement} */ (document.getElementById('dashboard'));

if (dashboardEl) {
    const mainScope = new DomScope(dashboardEl);

    // 1. Local logic for the widget
    const weather = mainScope.scopes.widget;
    
    if (weather) {
        weather.refs.refreshBtn.onclick = () => {
            weather.refs.title.textContent = "Updating Local Weather...";
            setTimeout(() => {
                weather.refs.title.textContent = "Weather: 25°C";
            }, 800);
        };
    }

    // 2. Global logic for the dashboard (using the "missing" button)
    mainScope.refs.refreshBtn.onclick = () => {
        // Update main scope element
        const originalTitle = mainScope.refs.title.textContent;
        mainScope.refs.title.textContent = "🔄 Refreshing everything...";

        // Access and update nested scope from the parent!
        if (weather) {
            weather.refs.title.textContent = "Syncing with server...";
        }

        setTimeout(() => {
            mainScope.refs.title.textContent = originalTitle;
            if (weather) weather.refs.title.textContent = "Weather: 20°C (Updated)";
        }, 1500);
    };

    console.log('Dashboard initialized. Try clicking both buttons!');
}