
import Server from '../server/index.ts';
const clientFolder = '../cdn/client';

// Do not enable live reload for production or if your development environment
// has its own live reload or HMR mechanism
const server = new Server('7000', clientFolder, true);
server.listen();
