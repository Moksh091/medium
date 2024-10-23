import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";
export const userRouter = new Hono();
userRouter.post('/signup', async function (c) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const body = await c.req.json();
    const User = await prisma.user.create({
        data: {
            email: body.email,
            password: body.password,
            name: body.name,
        }
    });
    const token = sign({ id: User.id }, c.env.JWT_SECRET);
    return c.json({
        token
    });
});
userRouter.post('/signin', async function (c) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const body = await c.req.json();
    const User = await prisma.user.findUnique({
        where: {
            email: body.email,
            password: body.password,
        }
    });
    if (!User) {
        c.status(403);
        return c.json({
            msg: "user doesnt exist"
        });
    }
    const token = sign({ id: User.id }, c.env.JWT_SECRET);
    return c.json({
        token,
        msg: 'logged In '
    });
});
