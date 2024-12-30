import { Worker } from 'worker_threads'
import { pathToFileURL, fileURLToPath } from 'url'
import path from 'path'

/**
 * Runs the Routify 3 native renderer in a worker
 * @param {string} template Path to template (index.html)
 * @param {string} script Path to script (App.js)
 * @param {string} url URL to render
 * @param {object} options Additional options
 * @returns {Promise<string>} Rendered HTML
 */
export async function routify3native(template, script, url, options = {}) {
    const workerPath = new URL(path.dirname(import.meta.url) + '/routify3nativeWorker.js')
    return new Promise((resolve, reject) => {
        const worker = new Worker(workerPath, {
            workerData: { script, url },
        })

        worker.on('message', resolve) // Receive HTML from the worker
        worker.on('error', reject) // Handle worker errors
        worker.on('exit', code => {
            if (code !== 0) {
                reject(new Error(`Worker exited with code ${code}`))
            }
        })
    })
}
