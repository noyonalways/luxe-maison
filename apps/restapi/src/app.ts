import {
  getCampaignRepository,
  getCustomerRepository,
  getDiscountRepository,
  getNewsletterRepository,
  getOrderRepository,
  getPopupRepository,
  getProductRepository,
  getReviewRepository,
  getSettingsRepository,
  getStaffRepository,
} from '@luxe-maison/database';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { analyticsRoutes } from './routes/analytics.routes.js';
import { campaignRoutes } from './routes/campaign.routes.js';
import { customerRoutes } from './routes/customer.routes.js';
import { discountRoutes } from './routes/discount.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { newsletterRoutes } from './routes/newsletter.routes.js';
import { orderRoutes } from './routes/order.routes.js';
import { popupRoutes } from './routes/popup.routes.js';
import { productRoutes } from './routes/product.routes.js';
import { reviewRoutes } from './routes/review.routes.js';
import { settingsRoutes } from './routes/settings.routes.js';
import { staffRoutes } from './routes/staff.routes.js';

const productRepository = getProductRepository();
const orderRepository = getOrderRepository();
const customerRepository = getCustomerRepository();
const campaignRepository = getCampaignRepository();
const discountRepository = getDiscountRepository();
const newsletterRepository = getNewsletterRepository();
const staffRepository = getStaffRepository();
const settingsRepository = getSettingsRepository();
const reviewRepository = getReviewRepository();
const popupRepository = getPopupRepository();

const app = new Hono();

app.use('*', cors());

healthRoutes(app);
productRoutes(app, { productRepository });
orderRoutes(app, { orderRepository });
customerRoutes(app, { customerRepository });
campaignRoutes(app, { campaignRepository });
discountRoutes(app, { discountRepository });
newsletterRoutes(app, { newsletterRepository });
staffRoutes(app, { staffRepository });
settingsRoutes(app, { settingsRepository });
reviewRoutes(app, { reviewRepository });
popupRoutes(app, { popupRepository });
analyticsRoutes(app);

app.notFound((c) => c.json({ status: 'error', message: 'Not Found' }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ status: 'error', message: err.message || 'Internal server error' }, 500);
});

export default app;
