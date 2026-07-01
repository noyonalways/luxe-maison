import { getOrderRepository, getProductRepository } from '@luxe-maison/database';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { healthRoutes } from './routes/health.routes.js';
import { productRoutes } from './routes/product.routes.js';
import { orderRoutes } from './routes/order.routes.js';

const productRepository = getProductRepository();
const orderRepository = getOrderRepository();

const app = new Hono();

app.use('*', cors());

healthRoutes(app);
productRoutes(app, { productRepository });
orderRoutes(app, { orderRepository });

app.notFound((c) => c.json({ status: 'error', message: 'Not Found' }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ status: 'error', message: err.message || 'Internal server error' }, 500);
});

export default app;
