import type { Hono } from 'hono';
import type { ProductRepository } from '@luxe-maison/core';
import { createProductService } from '@luxe-maison/core';

export function productRoutes(
  app: Hono,
  { productRepository }: { productRepository: ProductRepository },
) {
  const products = createProductService(productRepository);

  app.get('/api/products', async (c) => {
    const list = await products.listStorefrontProducts();
    return c.json(list);
  });

  app.get('/api/products/admin', async (c) => {
    const list = await products.listAdminProducts();
    return c.json(list);
  });

  app.get('/api/products/:id', async (c) => {
    const product = await products.getById(c.req.param('id'));
    if (!product) return c.json({ error: 'Product not found' }, 404);
    return c.json(product);
  });
}
