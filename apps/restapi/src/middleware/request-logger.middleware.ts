import { createMiddleware } from 'hono/factory';

/** Morgan "dev" style: METHOD PATH STATUS TIME ms - CONTENT-LENGTH */
export const requestLogger = createMiddleware(async (c, next) => {
  const start = performance.now();
  await next();

  const elapsed = performance.now() - start;
  const status = c.res.status;
  const contentLength = c.res.headers.get('content-length') ?? '-';

  console.log(
    `${c.req.method} ${c.req.path} ${status} ${elapsed.toFixed(3)} ms - ${contentLength}`,
  );
});
