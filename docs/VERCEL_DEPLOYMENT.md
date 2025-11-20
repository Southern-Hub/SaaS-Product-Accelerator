# Vercel Deployment Guide

## Quick Setup (5 Minutes)

### Step 1: Connect to Vercel

1. Go to [vercel.com](https://vercel.com/signup)
2. Sign up with your **GitHub account**
3. Click **"Add New Project"**
4. Select your repository: `Southern-Hub/SaaS-Product-Accelerator`
5. Click **"Import"**

### Step 2: Configure Project

Vercel will auto-detect Next.js. Keep these defaults:
- **Framework Preset:** Next.js
- **Root Directory:** `./`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`

### Step 3: Add Environment Variables

Click **"Environment Variables"** and add:

| Name | Value | Where to Get It |
|------|-------|-----------------|
| `DEEPSEEK_API_KEY` | `your-deepseek-api-key` | [DeepSeek Console](https://platform.deepseek.com) |
| `RESEND_API_KEY` | `your-resend-api-key` | [Resend Console](https://resend.com/api-keys) |
| `DATABASE_URL` | `your-postgres-connection-string` | Supabase or your PostgreSQL database |

> **Note:** Add these for **Production**, **Preview**, and **Development** environments.

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Your app will be live at: `https://your-project.vercel.app`

---

## Automatic Deployments

Vercel automatically deploys:
- **Production:** Every push to `main` branch
- **Preview:** Every pull request gets a preview URL
- **Instant Rollback:** Click to rollback to any previous deployment

---

## Custom Domain (Optional)

### Add Your Domain

1. Go to **Project Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `saas-analyzer.com`)
4. Follow DNS configuration instructions

Vercel provides:
- ✅ Free SSL certificate (auto-renewed)
- ✅ Global CDN
- ✅ DDoS protection

---

## Vercel Features

### Built-in Analytics
- **Web Analytics:** Free, privacy-friendly analytics
- **Speed Insights:** Core Web Vitals tracking
- Enable in: **Project Settings** → **Analytics**

### Serverless Functions
Your API routes automatically become serverless functions:
- `/api/analyze` → Serverless function
- `/api/weekly` → Serverless function (with ISR caching)
- `/api/email` → Serverless function

**Limits (Free Tier):**
- 100GB bandwidth/month
- 100 hours serverless execution/month
- Unlimited deployments

---

## Monitoring & Logs

### View Logs

1. Go to **Deployments** tab
2. Click on a deployment
3. Click **"Functions"** to see API route logs
4. Click **"Build Logs"** for build details

### Real-time Logs

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# View logs
vercel logs
```

---

## Performance Optimization

Vercel automatically optimizes:
- ✅ Image optimization (Next.js Image component)
- ✅ Edge caching (CDN)
- ✅ Gzip/Brotli compression
- ✅ Code splitting

**ISR (Incremental Static Regeneration):**
Your `/api/weekly` route already uses 24-hour caching:
```typescript
export const revalidate = 86400; // 24 hours
```

---

## Troubleshooting

### Build Fails

**Check:**
1. Build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Environment variables are set

**Common fix:**
```bash
# Test build locally first
npm run build
```

### API Routes Return 404

**Issue:** API routes not working
**Fix:** Ensure `next.config.ts` does NOT have `output: 'export'`

### Environment Variables Not Working

**Check:**
1. Variables added to all environments (Production/Preview/Development)
2. Redeploy after adding variables
3. Variable names match exactly

---

## Cost Comparison

### Vercel Free Tier
- ✅ 100GB bandwidth/month
- ✅ 100 hours serverless execution/month
- ✅ Unlimited deployments
- ✅ Perfect for this project

### Vercel Pro ($20/month)
- 1TB bandwidth/month
- 1000 hours execution/month
- Team features
- Priority support

**For this app:** Free tier is sufficient unless you exceed 100GB/month.

---

## Migration from AWS

We've updated the config to work with Vercel. The AWS S3/CloudFront setup can remain as a static frontend fallback if needed, but Vercel is now the primary deployment.

**Removed:**
- `output: 'export'` from `next.config.ts` (enables API routes)
- Static export limitations

**Kept:**
- All API routes functional
- ISR caching
- Image optimization

---

## Next Steps

1. ✅ Deploy to Vercel (follow Step 1-4 above)
2. ✅ Add environment variables
3. ✅ Test API routes work (analyze a product)
4. ✅ (Optional) Add custom domain
5. ✅ Enable Web Analytics

**Your app will be production-ready in 5 minutes!** 🚀
