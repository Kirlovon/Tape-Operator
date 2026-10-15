/*
 * Modified: fetchSources now catches API errors gracefully
 * so the player can initialize even when the API endpoint is unavailable.
 */

// Original fetchSources function replaced with error-tolerant version
async function fetchSources(movieData) {
	const apiURL = new URL(KINOBOX_API);

	// Add movie and sources data to the request
	Object.entries(movieData).forEach(([key, value]) => apiURL.searchParams.set(key, value));

	// Send request to the API
	let playersData = [];
	try {
		const request = await fetch(apiURL, { method: 'GET' });
		if (!request.ok || request?.status !== 200) {
			logger.error(API request failed, request.status);
			return [];
		}

		let response = {};
		try {
			response = await request.json();
		} catch (e) {
			logger.error(JSON parse error from API, e);
		}

		if (typeof response === 'object' && Array.isArray(response?.data) && response !== null) {
			// Remove players without full data
			let dataPlayers = response.data;
			dataPlayers = dataPlayers.filter((player) => player?.iframeUrl && player?.type);

			// Put player Turbo at the end of the list (as it usually doesn't work)
			const turboIndex = dataPlayers.findIndex((player) => player.type.toLowerCase() === 'turbo');
			if (turboIndex !== -1) dataPlayers.push(dataPlayers.splice(turboIndex, 1)[0]);

			playersData = dataPlayers;
		}
	} catch (error) {
		logger.error('Error fetching sources from API', error);
	}
	return playersData;
}

/*
 * Original code follows - unchanged from original player.js
 */
