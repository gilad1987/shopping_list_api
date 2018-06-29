import { ShoppingListServer } from './server';

let app = new ShoppingListServer().getApp();
export { app };