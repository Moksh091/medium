import { Hono } from "hono";
import { userRouter } from "./routes/userRoutes";
import { blogRouter } from "./routes/Blog";
const app = new Hono;

app.route('/api/v1',userRouter);
app.route('/api/v1', blogRouter);

export default app;