/**
 * Detects if the current browser is the LinkedIn in-app browser.
 * @returns {boolean} True if running inside LinkedIn app, false otherwise.
 */
export const isLinkedInBrowser = () => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    return /LinkedInApp/i.test(ua);
};
