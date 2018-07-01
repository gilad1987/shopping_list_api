var http_1 = require('http');
var express = require('express');
var socketIo = require('socket.io');
var jsonfile = require('jsonfile');
var ShoppingListServer = (function () {
    function ShoppingListServer() {
        this.PORT = 8080;
        this.productList = [];
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();
    }
    ShoppingListServer.prototype.createApp = function () {
        this.app = express();
    };
    ShoppingListServer.prototype.createServer = function () {
        this.server = http_1.createServer(this.app);
    };
    ShoppingListServer.prototype.config = function () {
        this.port = process.env.PORT || ShoppingListServer.PORT;
    };
    ShoppingListServer.prototype.sockets = function () {
        this.io = socketIo(this.server);
    };
    ShoppingListServer.prototype.listen = function () {
        var _this = this;
        this.server.listen(this.port, function () {
            console.log('Running server on port %s', _this.port);
        });
        var file = 'src/db.json';
        this.io.on('connect', function (socket) {
            console.log('Connected client on port %s.', _this.port);
            socket.on('message', function (message) {
                jsonfile.readFile(file, function (err, db) {
                    if (message.action === 'JOIN') {
                        message.user.socketId = socket.id;
                        db.users.push(message.user);
                    }
                    if (message.action === 'ADD') {
                        var exists = db.products.filter(function (p) { return (p.index === message.product.index); });
                        if (exists.length) {
                            var index = db.products.indexOf(exists[0]);
                            db.products.splice(index, 1, message.product);
                        }
                        else {
                            db.products.push(message.product);
                        }
                    }
                    if (message.action === 'DELETE') {
                        var exists = db.products.filter(function (p) { return (p.index === message.product.index); });
                        if (exists.length) {
                            var index = db.products.indexOf(exists[0]);
                            db.products.splice(index, 1);
                        }
                    }
                    if (message.action === 'CHECK') {
                        var exists = db.products.filter(function (p) { return (p.index === message.product.index); });
                        if (exists.length) {
                            var index = db.products.indexOf(exists[0]);
                            db.products.splice(index, 1, message.product);
                        }
                    }
                    _this.io.emit('message', {
                        action: message.action,
                        user: message.user,
                        db: db
                    });
                    jsonfile.writeFile(file, db, function (err) { });
                });
            });
            socket.on('disconnect', function () {
                jsonfile.readFile(file, function (err, db) {
                    var user = db.users.filter(function (u) { return (u.socketId === socket.id); });
                    var index = db.users.indexOf(user[0]);
                    db.users.splice(index, 1);
                    jsonfile.writeFile(file, db, function (err) { });
                    _this.io.emit('message', {
                        db: db
                    });
                });
                console.log('Client disconnected');
            });
        });
    };
    ShoppingListServer.prototype.getApp = function () {
        return this.app;
    };
    return ShoppingListServer;
})();
exports.ShoppingListServer = ShoppingListServer;
