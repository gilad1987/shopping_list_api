import {createServer, Server} from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';

var jsonfile = require('jsonfile');

export class ShoppingListServer {
    public static readonly PORT: number = 8080;
    private app: express.Application;
    private server: Server;
    private io: SocketIO.Server;
    private port: string | number;

    private productList: any[] = [];

    constructor() {
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();
    }

    private createApp(): void {
        this.app = express();
    }

    private createServer(): void {
        this.server = createServer(this.app);
    }

    private config(): void {
        this.port = process.env.PORT || ShoppingListServer.PORT;
    }

    private sockets(): void {
        this.io = socketIo(this.server);
    }

    private listen(): void {
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });

        const file = 'src/db.json';

        this.io.on('connection', (socket: socketIo.Socket) => {
            console.log("server nsp->%s", socket.nsp.name);

            console.log('Connected client on port %s.', this.port);
            socket.on('message', (message: any) => {
                console.log('message', message);
                jsonfile.readFile(file, (err: any, db: any) => {

                    console.log('err:readFile', err);

                    if (message.action === 'JOIN') {
                        message.user.socketId = socket.id;
                        db.users.push(message.user);
                    }

                    if (message.action === 'ADD') {
                        const exists = db.products.filter((p: any) => (p.index === message.product.index));
                        if (exists.length) {
                            const index = db.products.indexOf(exists[0]);
                            db.products.splice(index, 1, message.product);
                        } else {
                            db.products.push(message.product);
                        }
                    }

                    if (message.action === 'DELETE') {
                        const exists = db.products.filter((p: any) => (p.index === message.product.index));
                        if (exists.length) {
                            const index = db.products.indexOf(exists[0]);
                            db.products.splice(index, 1);
                        }
                    }

                    if (message.action === 'CHECK') {
                        const exists = db.products.filter((p: any) => (p.index === message.product.index));
                        if (exists.length) {
                            const index = db.products.indexOf(exists[0]);
                            db.products.splice(index, 1, message.product);
                        }
                    }


                    this.io.emit('message', {
                        action: message.action,
                        user: message.user,
                        db: db
                    });

                    jsonfile.writeFile(file, db, (err: any) => {
                        console.log('err:writeFile', err);
                    });
                });

            });

            socket.on('disconnect', () => {
                jsonfile.readFile(file, (err: any, db: any) => {
                    console.log('db',db);
                    console.log('err',err);
                    const user = db.users.filter((u: any) => (u.socketId === socket.id));
                    const index = db.users.indexOf(user[0]);
                    db.users.splice(index, 1);
                    jsonfile.writeFile(file, db, (err: any) => {
                    });
                    this.io.emit('message', {
                        db: db
                    });

                });
                console.log('Client disconnected');
            });
        });
    }

    public getApp(): express.Application {
        return this.app;
    }
}

