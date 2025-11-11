const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function Timing() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = Date.now();
      const result = await originalMethod.apply(this, args);
      const end = Date.now();
      const duration = end - start;

      console.log(`⏱️  ${propertyKey} took ${duration}ms`);

      return result;
    };

    return descriptor;
  };
}

export function RateLimit(maxRequests: number, windowMs: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const req = args[0];
      const res = args[1];
      const key = `${propertyKey}-${req.ip}`;

      const now = Date.now();
      const record = rateLimitStore.get(key);

      if (record) {
        if (now < record.resetTime) {
          if (record.count >= maxRequests) {
            res.status(429).json({
              message: 'Too many requests',
              retryAfter: Math.ceil((record.resetTime - now) / 1000),
            });
            return;
          }
          record.count++;
        } else {
          rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
        }
      } else {
        rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      }

      return await originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

export function Timeout(ms: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const res = args[1];

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject({
            message: 'Request timeout',
            statusCode: 408,
            code: 'TIMEOUT',
          });
        }, ms);
      });

      try {
        return await Promise.race([originalMethod.apply(this, args), timeoutPromise]);
      } catch (error: any) {
        if (error.code === 'TIMEOUT') {
          res.status(408).json({ message: 'Request timeout' });
          return;
        }
        throw error;
      }
    };

    return descriptor;
  };
}

export function Throttle(maxRequests: number, windowMs: number) {
  const lastCallStore = new Map<string, number>();

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const req = args[0];
      const res = args[1];
      const key = `${propertyKey}-${req.ip}`;

      const now = Date.now();
      const lastCall = lastCallStore.get(key) || 0;
      const timeSinceLastCall = now - lastCall;

      if (timeSinceLastCall < windowMs) {
        res.status(429).json({
          message: 'Too many requests, please slow down',
          retryAfter: Math.ceil((windowMs - timeSinceLastCall) / 1000),
        });
        return;
      }

      lastCallStore.set(key, now);
      return await originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

export function CacheTTL(seconds: number) {
  const cache = new Map<string, { data: any; expiresAt: number }>();

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const req = args[0];
      const cacheKey = `${propertyKey}-${JSON.stringify(req.body)}`;

      const now = Date.now();
      const cached = cache.get(cacheKey);

      if (cached && now < cached.expiresAt) {
        console.log(`Cache hit for ${propertyKey}`);
        return cached.data;
      }

      const result = await originalMethod.apply(this, args);
      cache.set(cacheKey, { data: result, expiresAt: now + seconds * 1000 });

      return result;
    };

    return descriptor;
  };
}

export function Retry(maxAttempts: number, delayMs: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let lastError: any;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error: any) {
          lastError = error;
          console.log(`Retry attempt ${attempt}/${maxAttempts} for ${propertyKey}`);

          if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }
        }
      }

      throw lastError;
    };

    return descriptor;
  };
}
