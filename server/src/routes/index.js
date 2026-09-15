import { Router } from "express";
import healthRoutes from "./healthRoutes.js";
import authRoutes from "./authRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import productRoutes from "./productRoutes.js";
import cartRoutes from "./cartRoutes.js";
import wishlistRoutes from "./wishlistRoutes.js";
import addressRoutes from "./addressRoutes.js";
import couponRoutes from "./couponRoutes.js";
import orderRoutes from "./orderRoutes.js";
import adminOrderRoutes from "./adminOrderRoutes.js";
import { reviewRouter, adminReviewRouter } from "./reviewRoutes.js";
import interactionRoutes from "./interactionRoutes.js";
import recommendationRoutes from "./recommendationRoutes.js";
import adminProductRoutes from "./adminProductRoutes.js";
import semanticSearchRoutes from "./semanticSearchRoutes.js";
import aiRoutes from "./aiRoutes.js";

const apiRouter = Router();

// Mount individual domain route modules
apiRouter.use("/health", healthRoutes);
apiRouter.use("/auth", authRoutes);
apiRouter.use("/categories", categoryRoutes);
apiRouter.use("/products", productRoutes);
apiRouter.use("/admin/products", adminProductRoutes);
apiRouter.use("/search", semanticSearchRoutes);
apiRouter.use("/ai", aiRoutes);
apiRouter.use("/cart", cartRoutes);
apiRouter.use("/wishlist", wishlistRoutes);
apiRouter.use("/addresses", addressRoutes);
apiRouter.use("/coupons", couponRoutes);
apiRouter.use("/orders", orderRoutes);
apiRouter.use("/admin/orders", adminOrderRoutes);
apiRouter.use("/reviews", reviewRouter);
apiRouter.use("/admin/reviews", adminReviewRouter);
apiRouter.use("/interactions", interactionRoutes);
apiRouter.use("/recommendations", recommendationRoutes);

export default apiRouter;
