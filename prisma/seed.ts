const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a mock user for local testing
  const user = await prisma.user.upsert({
    where: { email: 'manuu@example.com' },
    update: {},
    create: {
      email: 'manuu@example.com',
      name: 'Manuu',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    },
  });

  console.log(`Mock user created or verified: ${user.email}`);

  // Seed default habits
  const defaultHabits = [
    { name: 'Morning no-phone ritual 🏃', icon: 'SmartphoneOff', color: '#FF6B00' },
    { name: 'Client outreach done 💻', icon: 'Mail', color: '#BA7517' },
    { name: 'Hobby block protected 🌿', icon: 'Star', color: '#D4537E' },
    { name: 'Daily review completed 📓', icon: 'CheckSquare', color: '#888780' },
    { name: 'Hard stop at 12:30 AM 🌙', icon: 'Moon', color: '#3C3489' },
  ];

  for (const habit of defaultHabits) {
    const existing = await prisma.habit.findFirst({
      where: { userId: user.id, name: habit.name },
    });

    if (!existing) {
      await prisma.habit.create({
        data: {
          userId: user.id,
          name: habit.name,
          icon: habit.icon,
          color: habit.color,
          streak: 3, // Mock a 3-day streak for aesthetics
          longestStreak: 5,
        },
      });
      console.log(`Created habit: ${habit.name}`);
    }
  }

  // Seed daily tasks
  const sampleTasks = [
    { title: 'Redesign Munchify landing page hero section', category: 'product', done: true },
    { title: 'Follow up on Plottwear custom storefront contract', category: 'freelance', done: false },
    { title: 'Set up Google Cloud OAuth scopes for Myday API', category: 'wildcard', done: false },
  ];

  const existingTasks = await prisma.task.findMany({
    where: { userId: user.id },
  });

  if (existingTasks.length === 0) {
    for (const task of sampleTasks) {
      await prisma.task.create({
        data: {
          userId: user.id,
          title: task.title,
          category: task.category,
          done: task.done,
        },
      });
      console.log(`Created task: ${task.title}`);
    }
  }

  // Seed sales leads
  const sampleLeads = [
    { name: 'David Kimani', business: 'Munchify Merchants', channel: 'inbound', status: 'proposal', notes: 'Interested in digital menu builder integration.' },
    { name: 'Sarah Wambui', business: 'Nuru Payments', channel: 'referral', status: 'negotiating', notes: 'Discussing subscription API gateway terms.' },
    { name: 'Alex Mwangi', business: 'Plottwear Apparel', channel: 'DM', status: 'won', notes: 'Contract signed! Starting WooCommerce migration next Monday.' },
    { name: 'John Doe', business: 'Apex Web Services', channel: 'email', status: 'outreach', notes: 'Sent initial cold pitch regarding React SPA conversion.' },
  ];

  const existingLeads = await prisma.lead.findMany({
    where: { userId: user.id },
  });

  if (existingLeads.length === 0) {
    for (const lead of sampleLeads) {
      await prisma.lead.create({
        data: {
          userId: user.id,
          name: lead.name,
          business: lead.business,
          channel: lead.channel,
          status: lead.status,
          notes: lead.notes,
          followUpAt: new Date(Date.now() + 86400000 * 2), // 2 days in the future
        },
      });
      console.log(`Created lead: ${lead.business}`);
    }
  }

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
