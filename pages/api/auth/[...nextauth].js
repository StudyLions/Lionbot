import NextAuth from "next-auth"
import DiscordProvider from "next-auth/providers/discord";
// --- AI-MODIFIED (2026-04-06) ---
// Purpose: import Prisma to save Discord email on login
import { prisma } from '../../../utils/prisma';
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-04-06) ---
// Purpose: bump this to invalidate all existing sessions and force re-login
// (so we capture every user's email on their next sign-in)
const TOKEN_VERSION = 2;
// --- END AI-MODIFIED ---

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export default NextAuth({
  // https://next-auth.js.org/configuration/providers
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      // --- AI-MODIFIED (2026-03-13) ---
      // Purpose: added 'guilds' scope for dashboard server list
      authorization: {params: {scope: 'identify email guilds'}},
      // --- END AI-MODIFIED ---
    })
  ],
  // The secret should be set to a reasonably long random string.
  // It is used to sign cookies and to sign and encrypt JSON Web Tokens, unless
  // a separate secret is defined explicitly for encrypting the JWT.
  secret: process.env.SECRET,

  session: {
    // Use JSON Web Tokens for session instead of database sessions.
    // This option can be used with or without a database for users/accounts.
    // Note: `strategy` should be set to 'jwt' if no database is used.
    strategy: "jwt",

    // Seconds - How long until an idle session expires and is no longer valid.
    maxAge: 30 * 24 * 60 * 60, // 30 days

    // Seconds - Throttle how frequently to write to database to extend a session.
    // Use it to limit write operations. Set to 0 to always update the database.
    // Note: This option is ignored if using JSON Web Tokens
    // updateAge: 24 * 60 * 60, // 24 hours
  },

  // JSON Web tokens are only used for sessions if the `jwt: true` session
  // option is set - or by default if no database is specified.
  // https://next-auth.js.org/configuration/options#jwt
  jwt: {
    // You can define your own encode/decode functions for signing and encryption
    // if you want to override the default behaviour.
    // encode: async ({ secret, token, maxAge }) => {},
    // decode: async ({ secret, token, maxAge }) => {},
  },

  // You can define custom pages to override the built-in ones. These will be regular Next.js pages
  // so ensure that they are placed outside of the '/api' folder, e.g. signIn: '/auth/mycustom-signin'
  // The routes shown here are the default URLs that will be used when a custom
  // pages is not specified for that route.
  // https://next-auth.js.org/configuration/pages
  pages: {
    //TODO: Add a custom error when the user is trying to login and he's clicking on 'Cancel' btn
    signIn: '/',
    // signOut: '/auth/signout', // Displays form with sign out button
    // error: '/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // Used for check email page
    // newUser: null // If set, new users will be directed here on first sign in
  },

  // Callbacks are asynchronous functions you can use to control what happens
  // when an action is performed.
  // https://next-auth.js.org/configuration/callbacks
  // --- AI-MODIFIED (2026-03-13) ---
  // Purpose: expose Discord user ID, access token, and auto-refresh expired tokens
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.discordId = account.providerAccountId;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.tokenVersion = TOKEN_VERSION;
        token.expiresAt = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 604800000;
      }

      // --- AI-MODIFIED (2026-04-06) ---
      // Purpose: invalidate old sessions that pre-date email capture
      if (token.tokenVersion !== TOKEN_VERSION) {
        return {};
      }
      // --- END AI-MODIFIED ---

      if (token.expiresAt && Date.now() < token.expiresAt - 60000) {
        return token;
      }

      if (token.refreshToken) {
        try {
          const params = new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            grant_type: "refresh_token",
            refresh_token: token.refreshToken,
          });
          const res = await fetch("https://discord.com/api/oauth2/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString(),
          });
          if (res.ok) {
            const data = await res.json();
            token.accessToken = data.access_token;
            token.refreshToken = data.refresh_token || token.refreshToken;
            token.expiresAt = Date.now() + data.expires_in * 1000;
          } else {
            token.error = "RefreshTokenError";
          }
        } catch {
          token.error = "RefreshTokenError";
        }
      }

      return token;
    },
    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: Remove accessToken from client session to prevent token theft via XSS.
    //          accessToken remains in the JWT and is accessible server-side via getToken().
    // --- Original code (commented out for rollback) ---
    // async session({ session, token }) {
    //   session.discordId = token.discordId;
    //   session.accessToken = token.accessToken;
    //   if (token.error) session.error = token.error;
    //   return session;
    // },
    // --- End original code ---
    async session({ session, token }) {
      session.discordId = token.discordId;
      if (token.error) session.error = token.error;
      return session;
    },
    // --- END AI-MODIFIED ---
    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: Prevent open redirects via callbackUrl -- only allow same-origin redirects
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {}
      return baseUrl;
    },
    // --- END AI-MODIFIED ---
  },
  // --- END AI-MODIFIED ---

  // Events are useful for logging
  // https://next-auth.js.org/configuration/events
  // --- AI-MODIFIED (2026-04-06) ---
  // Purpose: save Discord email to user_config on every sign-in
  events: {
    async signIn({ user, profile, account }) {
      if (account?.provider === 'discord' && (profile?.email || user?.email)) {
        const email = profile?.email || user?.email;
        const verified = profile?.verified ?? user?.emailVerified ?? null;
        try {
          await prisma.user_config.upsert({
            where: { userid: BigInt(profile?.id || account.providerAccountId) },
            update: { email, email_verified: verified },
            create: { userid: BigInt(profile?.id || account.providerAccountId), email, email_verified: verified },
          });
        } catch (e) {
          console.error('[NextAuth] Failed to save user email:', e);
        }
      }
    },
  },
  // --- END AI-MODIFIED ---

  // You can set the theme to 'light', 'dark' or use 'auto' to default to the
  // whatever prefers-color-scheme is set to in the browser. Default is 'auto'
  theme: {
    // --- AI-MODIFIED (2026-03-13) ---
    // Purpose: match dashboard dark theme
    colorScheme: "dark",
    // --- END AI-MODIFIED ---
  },

  // Enable debug messages in the console if you are having problems
  debug: false,
})
