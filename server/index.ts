import express, { type NextFunction, type Application, type Request, type Response } from 'express';
import cors from 'cors' ;
import { join } from 'path';
import { fileURLToPath } from 'url';
import LiveReload from './livereload.ts';
import client, { enums } from '@nuralogix.ai/dfx-api-client';
import connectLivereload from 'connect-livereload';
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const { DeviceTypeID } = enums;

const {
    API_URL,
    LICENSE_KEY,
    STUDY_ID,
} = process.env;

export default class Server {
    app: Application;
    port: number;
    appPath: string = '';
    clientFolder: string = '';
    apiClient = client({
        url: {
            http: new URL(`https://${API_URL}`),
            wss: new URL(`wss://${API_URL}`),
        },
    });

    constructor(port: string, clientFolder: string, enableLiveReload: boolean) {
        this.app = express();
        this.appPath = join(__dirname, clientFolder);
        this.clientFolder = clientFolder;
        this.port = parseInt(port);
        // The connect-livereload middleware should be placed before serving static files,
        // ensuring that it can inject the livereload script into your HTML. The middleware
        // order matters because Express executes middleware in the order it's defined.
        if (enableLiveReload) this.initLiveReload();
        this.middlewares();
        this.app.use(function(_req: Request, res: Response, next: NextFunction) {
            // These two headers are needed for shared array buffer to work
            res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
            res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
            next();
        });
        this.routes();
    }

    initLiveReload() {
        const liveReload = new LiveReload([this.appPath]);
        liveReload.init();
        this.app.use(connectLivereload());
    }

    middlewares() {
        this.app.use(cors({ origin: '*' }));
        this.app.use(express.json());
    }    

    routes() {
        // health check
        this.app.get('/api/health', (_req: Request, res: Response) => {
            res.status(200).json({
                status: 'ok',
            });
        });
        // return Study ID
        this.app.get('/api/studyId', (_req: Request, res: Response) => {
            res.status(200).json({
                status: '200',
                studyId: STUDY_ID || ''
            });
        });

        // Register License return token and refreshToken
        this.app.get('/api/token', async (_req: Request, res: Response) => {
            const tokenExpiresIn = 60 * 60; // 1 hour
            const payload = {
                Key: LICENSE_KEY || '',
                DeviceTypeID: DeviceTypeID.WIN32,
                Name: 'Anura Web Core SDK',
                Identifier: 'ANURA_WEB_CORE_SDK',
                Version: '1.0.0',
                TokenExpiresIn: tokenExpiresIn
            };
            const registerLicense = await this.apiClient.http.organizations.registerLicense(payload, true);
            const { status, body } = registerLicense;
            if (status === '200') {
                const { Token, RefreshToken } = body;
                res.json({
                    status: status,
                    token: Token,
                    refreshToken: RefreshToken,
                });
            } else {
                res.json({
                    status: status,
                    error: body,
                });
            }
        });
        this.app.use('/', express.static(join(__dirname, '../shared')));
        this.app.use('/', express.static(this.appPath));
        this.app.get('/', (_req: Request, res: Response) => {
            res.sendFile(join(__dirname, `${this.clientFolder}/index.html`), function (err) {
                if (err) {
                    res.status(500).send(err);
                }
            });
        });        
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('Anura Web Core SDK Server is running on port: ', this.port);
        });
    }    
};