import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET : string
    },
    Variables: {
        userId: number,
    }
}>();
blogRouter.use(async (c:any, next) => {
    const jwt = c.req.header('Authorization');
	if (!jwt) {
		c.status(401);
		return c.json({ error: "unauthorized" });
	}
	const token = jwt.split(' ')[1];
	const payload = await verify(token, c.env.JWT_SECRET);
	if (!payload) {
		c.status(401);
		return c.json({ error: "unauthorized" });
	}
	c.set('userId', payload.id);
	await next();
});

blogRouter.post('/createBlog', async function(c) {
    const userId = c.get('userId')
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());
    
    const body = await c.req.json();
    const post = await prisma.post.create({
        data: {
            title: body.title,
            content: body.content,
            authorid: userId                        
        }
    })

    return c.json({
        id: post.id
    })
})

blogRouter.put('/update', async function(c) {
    const userId = c.get('userId')
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    const body = await c.req.json();
    await prisma.post.update({
        where: {
            id: body.id,
            authorid: userId
        },
        data: {
            title: body.title,
            content: body.content
        }
    })
    return c.text('blog updated')
})

blogRouter.get('/blog/:id', async function (c) {
    const id = Number(c.req.param('id'));
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())
    
    const blog = await prisma.post.findUnique({
        where: {
            id
        }
    })
    return c.json({
        blog
    })
})

blogRouter.get('/blog/bulk', async function(c) {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    const blog = await prisma.post.findMany({});
    return c.json({blog})

})