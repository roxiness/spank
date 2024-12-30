import { parentPort, workerData } from 'worker_threads';
import { pathToFileURL } from 'url';

/**
 * Renders a single Routify 3 page
 * @param {string} script Path to script (App.js)
 * @param {string} url URL to render
 * @returns {Promise<string>} Rendered HTML
 */
async function routify3nativeWorker(script, url) {
    try {
        const scriptPath = pathToFileURL(process.cwd() + '/' + script) + '?url=' + url;
        const app = await import(scriptPath);
        const result = await app.render(url);
        return result.html;
    } catch (err) {
        console.error(`Failed to render "${url}":`, err);
        return `<html><body><h3>Failed to render "${url}"</h3></body></html>`;
    }
}

// Execute the worker function
(async () => {
    const { script, url } = workerData;
    const html = await routify3nativeWorker(script, url);
    parentPort.postMessage(html); // Send result back to the main thread
})();
