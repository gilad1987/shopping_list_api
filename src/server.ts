import {createServer, Server} from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';

import {Message} from './model';

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

        this.io.on('connect', (socket: any) => {
            console.log('Connected client on port %s.', this.port);
            socket.on('message', (message: any) => {

                if (message.action === 'ADD') {
                    const exists = this.productList.filter((p) => (p.index === message.product.index));
                    if (exists.length) {
                        const index = this.productList.indexOf(exists[0]);
                        this.productList.splice(index, 1, message.product);
                    } else {
                        this.productList.push(message.product);
                    }
                }

                if (message.action === 'DELETE') {
                    const exists = this.productList.filter((p) => (p.index === message.product.index));
                    if (exists.length) {
                        const index = this.productList.indexOf(exists[0]);
                        this.productList.splice(index, 1);
                    }
                }

                if (message.action === 'CHECK') {
                    const exists = this.productList.filter((p) => (p.index === message.product.index));
                    if (exists.length) {
                        const index = this.productList.indexOf(exists[0]);
                        this.productList.splice(index, 1, message.product);
                    }
                }

                this.io.emit('message', {
                    action: message.action,
                    user: message.user,
                    list: this.productList,
                    product: message.product
                });
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });
    }

    public getApp(): express.Application {
        return this.app;
    }
}

