import type { NextConfig } from "next";

// We define the Content Security Policy as a string, then format it.
// This allows your app to run its own code, but explicitly allows Google Auth and Supabase.
const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.googleusercontent.com;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    connect-src 'self' https://*.supabase.co https://accounts.google.com;
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: cspHeader.replace(/\n/g, '').replace(/\s+/g, ' ').trim()
  },
  {
    // Prevents your site from being embedded inside an iframe on a hacker's site (Clickjacking protection)
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    // Forces the browser to trust the Content-Type we send (Stops MIME-sniffing attacks)
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    // Controls how much information the browser sends when navigating away from your site
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    // Forces browsers to ONLY connect via HTTPS
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains'
  }
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply these security headers to ALL routes in the application
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;