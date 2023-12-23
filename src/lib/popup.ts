

let popupTimeout: number | null = null;

/**
 * Shows a popup message for 1 second
 * @param {string} text Text to show in the popup
 */
export function showPopupMessage(text: string) {

	let popup = document.querySelector('.popup-message');

	if (!popup) {
		popup = document.createElement('div');
		popup.classList.add('popup-message');
		document.body.appendChild(popup);
	}

	popup.textContent = text;
	popup.classList.add('active');

	if (popupTimeout) {
		clearTimeout(popupTimeout);
	}

	popupTimeout = setTimeout(function () {
		popup?.classList.remove('active');
		setTimeout(() => {
			popup?.remove();
		}, 150);
		popupTimeout = null;
	}, 1000);
}