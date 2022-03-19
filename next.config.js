module.exports = {
  env: {
    STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  },
  images: {
    domains: ['cdn.discord.study', 'api-production.s3.amazonaws.com']
  }
}
