import app from "./express.js";
import productRoutes from "./modules/products/product.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import orderRoutes from "./modules/orders/order.routes.js";
import couponRoutes from "./modules/coupons/coupon.routes.js";
import leadRoutes from "./modules/leads/lead.routes.js";
import subscriptionRoutes from "./modules/subscriptions/subscription.routes.js";
import paymentRoutes from "./modules/payments/payment.routes.js";
import programmeRoutes from "./modules/programmes/programme.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import loyaltyRoutes from "./modules/loyalty/loyalty.routes.js";
import currencyRoutes from "./modules/currency/currency.routes.js";
import priceRoutes from "./modules/prices/price.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { getPrismaClient } from "./config/db.js";

// initialize Prisma once on boot to catch DB issues early
getPrismaClient();

export default app;

// Mount resource routers
app.use(productRoutes);
app.use(userRoutes);
app.use(cartRoutes);
app.use(orderRoutes);
app.use(couponRoutes);
app.use(leadRoutes);
app.use(subscriptionRoutes);
app.use(paymentRoutes);
app.use(programmeRoutes);
app.use(adminRoutes);
app.use("/api/loyalty", loyaltyRoutes);
app.use("/api/currency", currencyRoutes);
app.use("/api/prices", priceRoutes);
app.use(errorHandler);

