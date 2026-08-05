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
  getHomepageRepository,
  getContentPageRepository,
  getStaffRepository,
} from '@luxe-maison/database';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { AuthVariables } from './middleware/auth.middleware.js';
import { requestLogger } from './middleware/request-logger.middleware.js';
import { requestShield } from './middleware/request-shield.middleware.js';
import { globalRateLimiter, authRateLimiter } from './middleware/rate-limiter.middleware.js';
import { securityHeaders } from './middleware/security-headers.middleware.js';
import { analyticsRoutes } from './routes/analytics.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { customerAuthRoutes } from './routes/customer-auth.routes.js';
import { campaignRoutes } from './routes/campaign.routes.js';
import { customerRoutes } from './routes/customer.routes.js';
import { discountRoutes } from './routes/discount.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { newsletterRoutes } from './routes/newsletter.routes.js';
import { orderRoutes } from './routes/order.routes.js';
import { paymentRoutes } from './routes/payment.routes.js';
import { permissionsRoutes } from './routes/permissions.routes.js';
import { rolesRoutes } from './routes/roles.routes.js';
import { popupRoutes } from './routes/popup.routes.js';
import { productRoutes } from './routes/product.routes.js';
import { reviewRoutes } from './routes/review.routes.js';
import { settingsRoutes } from './routes/settings.routes.js';
import { homepageRoutes } from './routes/homepage.routes.js';
import { contentPageRoutes } from './routes/content-page.routes.js';
import { staffRoutes } from './routes/staff.routes.js';

const productRepository = getProductRepository();
const orderRepository = getOrderRepository();
const customerRepository = getCustomerRepository();
const campaignRepository = getCampaignRepository();
const discountRepository = getDiscountRepository();
const newsletterRepository = getNewsletterRepository();
const staffRepository = getStaffRepository();
const settingsRepository = getSettingsRepository();
const homepageRepository = getHomepageRepository();
const contentPageRepository = getContentPageRepository();
const reviewRepository = getReviewRepository();
const popupRepository = getPopupRepository();

const app = new Hono<{ Variables: AuthVariables }>();

const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'https://luxe-maison.noyonrahman.com',
  'https://admin-luxe-maison.noyonrahman.com',
  'http://admin-luxe-maison.noyonrahman.com',
];

const envAllowedOrigins = [
  process.env.STOREFRONT_URL,
  process.env.CMS_URL,
  process.env.VITE_STOREFRONT_URL,
  process.env.VITE_CMS_URL,
  process.env.CORS_ALLOWED_ORIGINS,
]
  .filter((val): val is string => Boolean(val))
  .flatMap((url) => url.split(',').map((o) => o.trim()));

const allowedOrigins = new Set([...defaultAllowedOrigins, ...envAllowedOrigins]);

app.use('*', securityHeaders);
app.use('*', requestShield);
app.use('*', requestLogger);
app.use('*', globalRateLimiter);
app.use(
  '*',
  cors({
    origin: (origin) => {
      if (!origin || allowedOrigins.has(origin)) {
        return origin;
      }
      return null;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  }),
);

// Strict rate limiting for authentication endpoints
app.use('/api/auth/*', authRateLimiter);
app.use('/api/customer-auth/*', authRateLimiter);

healthRoutes(app);
authRoutes(app, { staffRepository });
customerAuthRoutes(app, { customerRepository });
productRoutes(app, { productRepository });
paymentRoutes(app, { productRepository, discountRepository });
orderRoutes(app, { orderRepository, customerRepository, discountRepository, productRepository });
customerRoutes(app, { customerRepository });
campaignRoutes(app, { campaignRepository });
discountRoutes(app, { discountRepository });
newsletterRoutes(app, { newsletterRepository });
staffRoutes(app, { staffRepository });
settingsRoutes(app, { settingsRepository });
homepageRoutes(app, { homepageRepository });
contentPageRoutes(app, { contentPageRepository });
reviewRoutes(app, { reviewRepository });
popupRoutes(app, { popupRepository });
permissionsRoutes(app);
rolesRoutes(app, { staffRepository });
analyticsRoutes(app, {
  orderRepository,
  productRepository,
  customerRepository,
  campaignRepository,
});

app.notFound((c) => c.json({ status: 'error', message: 'Not Found' }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ status: 'error', message: err.message || 'Internal server error' }, 500);
});

export default app;
export { staffRepository };
