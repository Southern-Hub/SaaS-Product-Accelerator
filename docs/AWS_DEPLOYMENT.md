# AWS Deployment Guide

## Overview
This guide walks through deploying the SaaS Viability Analyzer to AWS using S3 for static hosting and CloudFront for CDN distribution.

**Region:** `ap-southeast-2` (Sydney, Australia)

---

## Prerequisites

- AWS Account with access to S3 and CloudFront
- AWS CLI installed locally (optional, for testing)
- GitHub repository for the project

---

## Step 1: Create S3 Bucket

### Via AWS Console:

1. Go to **S3** in AWS Console
2. Click **Create bucket**
3. **Bucket name:** `saas-viability-analyzer` (must be globally unique)
4. **Region:** `ap-southeast-2`
5. **Uncheck** "Block all public access" (required for CloudFront)
6. Click **Create bucket**

### Enable Static Website Hosting:

1. Go to your bucket → **Properties** tab
2. Scroll to **Static website hosting**
3. Click **Edit**
4. Enable **Static website hosting**
5. **Index document:** `index.html`
6. **Error document:** `404.html`
7. Click **Save changes**
8. Note the **Bucket website endpoint** URL

---

## Step 2: Create CloudFront Distribution

### Via AWS Console:

1. Go to **CloudFront** in AWS Console
2. Click **Create distribution**

**Origin Settings:**
- **Origin domain:** Select your S3 bucket from dropdown
- **Origin access:** Select **Origin access control settings (recommended)**
- Click **Create control setting** if needed
- **Name:** `saas-viability-analyzer-oac`

**Default cache behavior:**
- **Viewer protocol policy:** Redirect HTTP to HTTPS
- **Allowed HTTP methods:** GET, HEAD, OPTIONS
- **Cache key and origin requests:** Use recommended settings
- **Compress objects automatically:** Yes

**Settings:**
- **Price class:** Use only North America, Europe, Asia, Middle East, and Africa
- **Default root object:** `index.html`

3. Click **Create distribution**
4. Wait for deployment (5-10 minutes)
5. **Copy the Distribution Domain Name** (e.g., `d111111abcdef8.cloudfront.net`)
6. **Copy the Distribution ID** (needed for GitHub Actions)

### Update S3 Bucket Policy:

After creating the distribution, CloudFront will provide a bucket policy. Copy it and:

1. Go to your S3 bucket → **Permissions** tab
2. Scroll to **Bucket policy**
3. Click **Edit** and paste the CloudFront policy
4. Click **Save changes**

Example policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "AllowCloudFrontServicePrincipal",
    "Effect": "Allow",
    "Principal": {
      "Service": "cloudfront.amazonaws.com"
    },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::saas-viability-analyzer/*",
    "Condition": {
      "StringEquals": {
        "AWS:SourceArn": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
      }
    }
  }]
}
```

---

## Step 3: Configure GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Click **New repository secret** and add:

1. **AWS_ACCESS_KEY_ID**
   - Create via AWS IAM with S3 and CloudFront permissions
   
2. **AWS_SECRET_ACCESS_KEY**
   - Corresponding secret key

3. **CLOUDFRONT_DISTRIBUTION_ID**
   - From Step 2 (e.g., `E1234567890ABC`)

4. **DEEPSEEK_API_KEY** (optional)
   - Your DeepSeek API key for production AI analysis

### Required IAM Permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::saas-viability-analyzer",
        "arn:aws:s3:::saas-viability-analyzer/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
    }
  ]
}
```

---

## Step 4: Deploy

### Manual Deployment (First Time):

```bash
# Build the static export
npm run build

# Sync to S3 (requires AWS CLI configured)
aws s3 sync out/ s3://saas-viability-analyzer --delete --region ap-southeast-2

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Automated Deployment (via GitHub Actions):

Once secrets are configured, simply push to `main`:

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

GitHub Actions will automatically:
1. Run tests
2. Build static export
3. Sync to S3
4. Invalidate CloudFront cache

---

## Step 5: Verify Deployment

1. Visit your **CloudFront Distribution Domain Name**
2. Test the application:
   - Homepage loads
   - Weekly gallery displays
   - Search bar works
   - Analysis completes successfully

---

## Troubleshooting

### Build Fails in GitHub Actions:
- Check GitHub Actions logs for errors
- Verify all secrets are set correctly
- Ensure tests pass locally

### 404 Errors on Routes:
- Next.js static export doesn't support dynamic routes
- Ensure all pages are pre-rendered

### CloudFront Shows Stale Content:
- Create a cache invalidation manually
- Check if GitHub Actions invalidation step succeeded

### S3 Access Denied:
- Verify bucket policy allows CloudFront OAC
- Check IAM user has correct permissions

---

## Monitoring & Maintenance

- **CloudWatch Alarms:** Set up for CloudFront errors
- **S3 Metrics:** Monitor storage and requests
- **CloudFront Metrics:** Track cache hit ratio
- **Cost Monitoring:** Use AWS Cost Explorer

---

## Next Steps

- [ ] Add custom domain via Route 53
- [ ] Request SSL certificate in ACM
- [ ] Set up automated backups
- [ ] Configure WAF for security
