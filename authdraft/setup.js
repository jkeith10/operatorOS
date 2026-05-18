#!/usr/bin/env node
/**
 * AuthDraft setup script
 * Run from the authdraft/ directory: node setup.js
 *
 * What it does:
 *   1. Creates Stripe products (Starter $299/mo, Pro $599/mo) and writes price IDs to .env.local
 *   2. Applies the Supabase schema via psql (needs your DB password)
 */

const { execSync } = require("child_process");
const fs = require("fs");
const https = require("https");
const path = require("path");

const ENV_PATH = path.join(__dirname, ".env.local");

// ─── helpers ───────────────────────────────────────────────────────────────

function readEnv() {
  return fs.readFileSync(ENV_PATH, "utf8");
}

function setEnvVar(key, value) {
  let content = readEnv();
  const regex = new RegExp(`^${key}=.*$`, "m");
  if (regex.test(content)) {
    content = content.replace(regex, `${key}=${value}`);
  } else {
    content += `\n${key}=${value}`;
  }
  fs.writeFileSync(ENV_PATH, content);
  console.log(`  ✓ ${key} set`);
}

function getEnvVar(key) {
  const match = readEnv().match(new RegExp(`^${key}=(.*)$`, "m"));
  return match ? match[1].trim() : null;
}

function stripeRequest(method, path, params) {
  const stripeKey = getEnvVar("STRIPE_SECRET_KEY");
  if (!stripeKey || stripeKey.includes("placeholder")) {
    throw new Error("STRIPE_SECRET_KEY not set in .env.local");
  }
  const body = new URLSearchParams(params).toString();
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.stripe.com",
        path,
        method,
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          const parsed = JSON.parse(data);
          if (parsed.error) reject(new Error(parsed.error.message));
          else resolve(parsed);
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ─── step 1: Stripe ─────────────────────────────────────────────────────────

async function setupStripe() {
  console.log("\n── Stripe ──────────────────────────────────────────────────");

  const stripeKey = getEnvVar("STRIPE_SECRET_KEY");
  if (!stripeKey || stripeKey.includes("placeholder")) {
    console.log("  ⚠  STRIPE_SECRET_KEY not set — skipping.");
    console.log("     Set it in .env.local and re-run.");
    return;
  }

  console.log("  Creating Starter product ($299/mo)…");
  const starterProduct = await stripeRequest("POST", "/v1/products", {
    name: "AuthDraft Starter",
    description: "50 prior authorization letters per month",
  });

  const starterPrice = await stripeRequest("POST", "/v1/prices", {
    product: starterProduct.id,
    unit_amount: "29900",
    currency: "usd",
    "recurring[interval]": "month",
    nickname: "Starter Monthly",
  });

  console.log("  Creating Pro product ($599/mo)…");
  const proProduct = await stripeRequest("POST", "/v1/products", {
    name: "AuthDraft Pro",
    description: "Unlimited prior authorization letters",
  });

  const proPrice = await stripeRequest("POST", "/v1/prices", {
    product: proProduct.id,
    unit_amount: "59900",
    currency: "usd",
    "recurring[interval]": "month",
    nickname: "Pro Monthly",
  });

  setEnvVar("STRIPE_STARTER_PRICE_ID", starterPrice.id);
  setEnvVar("STRIPE_PRO_PRICE_ID", proPrice.id);

  console.log(`  ✓ Starter price: ${starterPrice.id}`);
  console.log(`  ✓ Pro price:     ${proPrice.id}`);
  console.log("\n  Next: set up the Stripe webhook (see instructions below).");
}

// ─── step 2: Supabase schema ─────────────────────────────────────────────────

function setupSupabase() {
  console.log("\n── Supabase ────────────────────────────────────────────────");

  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    console.log("  ⚠  SUPABASE_DB_URL not set.");
    console.log("     Get it from: Supabase Dashboard → Settings → Database → Connection string (URI)");
    console.log("     Then run:  SUPABASE_DB_URL='postgresql://postgres:...' node setup.js");
    console.log("\n  Alternatively, paste supabase/schema.sql into:");
    console.log("  https://supabase.com/dashboard/project/srbshimpvpueesfsxszz/sql/new");
    return;
  }

  const schemaPath = path.join(__dirname, "supabase", "schema.sql");
  console.log("  Applying schema…");
  try {
    execSync(`psql "${dbUrl}" -f "${schemaPath}"`, { stdio: "inherit" });
    console.log("  ✓ Schema applied");
  } catch (e) {
    console.error("  ✗ psql failed — check your DB URL and try again");
    console.error(e.message);
  }
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("AuthDraft Setup");
  console.log("===============");

  await setupStripe().catch((e) => {
    console.error("  ✗ Stripe error:", e.message);
  });

  setupSupabase();

  console.log("\n── Webhook ─────────────────────────────────────────────────");
  console.log("  Install Stripe CLI and run:");
  console.log("  stripe listen --forward-to localhost:3000/api/webhooks/stripe");
  console.log("  Copy the webhook signing secret (whsec_...) into .env.local");
  console.log("  as STRIPE_WEBHOOK_SECRET");

  console.log("\n── Done ────────────────────────────────────────────────────");
  console.log("  Check .env.local — fill in any remaining placeholders, then:");
  console.log("  npm run dev");
}

main();
