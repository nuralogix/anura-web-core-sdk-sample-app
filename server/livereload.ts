import { createServer, type LiveReloadServer } from 'livereload';

export default class LiveReload {
    liveReloadServer: LiveReloadServer;

    constructor(folders: string[]) {
        // 1 second delay and extra extension `mjs` is to detect changes in app folder
        // if build is taking longer then you need to increase the delay
        this.liveReloadServer = createServer({ delay: 1000, extraExts: ['mjs'] });
        this.liveReloadServer.watch(folders);

        const httpServer = this.liveReloadServer.config.server;
        if (httpServer) {
            httpServer.prependListener('request', (req, res) => {
                // Cross-Origin-Embedder-Policy and Cross-Origin-Opener-Policy headers are needed
                // for shared array buffer to work. Since livereload.js is served from a different
                // origin, the request will be blocked by the browser.
                // As a workaround, we set the cross-origin headers to allow the request
                res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
            });
        }
    }

    init() {
        this.liveReloadServer.server.once('connection', () => {
            setTimeout(() => {
              this.liveReloadServer.refresh('/');
            }, 100);
        });        
    }
}