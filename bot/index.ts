// ============================================
// Nuron AI Telegram Bot – Railway Deployment
// ============================================
// Setup:
//   1. npm install grammy dotenv
//   2. Create .env with:
//      BOT_TOKEN=your_telegram_bot_token
//      ADMIN_IDS=123456,789012  (comma‑separated user IDs)
//   3. Run: npx ts-node bot/index.ts
//   4. Railway: set start command to "ts-node bot/index.ts"
// ============================================

import { Bot, Context } from 'grammy';
import * as dotenv from 'dotenv';

dotenv.config();

// ============================================
// Environment & Configuration
// ============================================

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) throw new Error('BOT_TOKEN is not defined');

const ADMIN_IDS_RAW = process.env.ADMIN_IDS || '';
const ADMIN_IDS = ADMIN_IDS_RAW.split(',').map(id => id.trim()).filter(Boolean);

// Role definitions (hardcoded for demo – in production use a DB)
const SUPER_ADMIN_IDS = ['123456']; // replace with real IDs
const ADMIN_ROLE_IDS = [...SUPER_ADMIN_IDS, '789012'];
const MANAGER_IDS = ['456789'];
const DEVELOPER_IDS = ['987654'];

// ============================================
// Custom Context & Helpers
// ============================================

interface MyContext extends Context {
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isDeveloper: boolean;
}

const bot = new Bot<MyContext>(BOT_TOKEN);

// Middleware to enrich context with roles
bot.use(async (ctx, next) => {
  const userId = ctx.from?.id?.toString() || '';
  ctx.isSuperAdmin = SUPER_ADMIN_IDS.includes(userId);
  ctx.isAdmin = ADMIN_ROLE_IDS.includes(userId);
  ctx.isManager = MANAGER_IDS.includes(userId);
  ctx.isDeveloper = DEVELOPER_IDS.includes(userId);
  await next();
});

// ============================================
// Command Handlers (Role‑Gated)
// ============================================

// /start – welcome message
bot.command('start', async (ctx) => {
  const name = ctx.from?.first_name || 'there';
  await ctx.reply(
    `👋 Welcome, ${name}!\n\n` +
    `I'm the Nuron AI assistant bot. Use /help to see available commands.`
  );
});

// /help
bot.command('help', async (ctx) => {
  let helpText = `📘 *Nuron AI Bot Commands*\n\n` +
    `/start – Welcome message\n` +
    `/help – This guide\n`;

  if (ctx.isAdmin) {
    helpText += `/admin – Admin panel (SuperAdmin only)\n` +
      `/stats – Bot usage statistics\n` +
      `/alert <message> – Send alert to all users\n`;
  }

  if (ctx.isManager) {
    helpText += `/staff – Manage support staff\n`;
  }

  if (ctx.isDeveloper) {
    helpText += `/deploy – Trigger CI/CD pipeline\n`;
  }

  await ctx.reply(helpText, { parse_mode: 'Markdown' });
});

// /admin – restricted to SuperAdmin
bot.command('admin', async (ctx) => {
  if (!ctx.isSuperAdmin) {
    await ctx.reply('⛔ You do not have permission to use this command.');
    return;
  }
  await ctx.reply('🔐 SuperAdmin panel: (implement features here)');
});

// /stats – restricted to Admin+
bot.command('stats', async (ctx) => {
  if (!ctx.isAdmin) {
    await ctx.reply('⛔ Only admins can view statistics.');
    return;
  }
  // Mock stats
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  await ctx.reply(
    `📊 *Bot Stats*\n\n` +
    `- Uptime: ${hours}h ${minutes}m\n` +
    `- Status: 🟢 Online\n` +
    `- Environment: Railway\n` +
    `- Admin users: ${ADMIN_IDS.length}`,
    { parse_mode: 'Markdown' }
  );
});

// /alert – Admin+ only, sends message to all users (demo replies to self)
bot.command('alert', async (ctx) => {
  if (!ctx.isAdmin) {
    await ctx.reply('⛔ Only admins can send alerts.');
    return;
  }
  const message = ctx.match?.trim();
  if (!message) {
    await ctx.reply('Usage: /alert <your message>');
    return;
  }
  // In production, you would broadcast to a list of chat IDs.
  // Here we simply confirm.
  await ctx.reply(`📢 Alert sent: "${message}"`);
});

// ============================================
// Error Handling
// ============================================

bot.catch((err) => {
  console.error('Bot error:', err);
});

// ============================================
// Start Long Polling (24/7 on Railway)
// ============================================

bot.start({
  onStart: () => {
    console.log('🤖 Nuron AI Bot is running on Railway...');
    console.log(`Admins: ${ADMIN_IDS.join(', ') || 'none'}`);
  },
});
