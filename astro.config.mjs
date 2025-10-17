import { defineConfig } from 'astro/config';
   import cloudflare from '@astrojs/cloudflare';
   import tailwind from '@astrojs/tailwind';
   import react from '@astrojs/react';

   export default defineConfig({
     output: 'server',
     adapter: cloudflare(),
     integrations: [tailwind(), react()]
   });
```

3. **Commit and push:**
```
   git add astro.config.js package.json package-lock.json
   git commit -m "Add React integration"
   git push origin main