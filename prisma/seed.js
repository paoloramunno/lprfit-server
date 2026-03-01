const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const CAPACITY_PER_SLOT = 5;
const SLOT_START_HOUR = 8;
const SLOT_END_HOUR_EXCLUSIVE = 21; // Last slot: 20:00-21:00
const DAYS_AHEAD = 30;

function asDateOnlyUtc(date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function asTimeUtc(hour) {
  return new Date(Date.UTC(1970, 0, 1, hour, 0, 0));
}

async function ensureSessionTypes() {
  const boutique = await prisma.sessionType.upsert({
    where: { code: "BOUTIQUE_FITNESS" },
    update: {
      name: "Boutique Fitness",
      description: "Sessione boutique fitness in studio",
    },
    create: {
      code: "BOUTIQUE_FITNESS",
      name: "Boutique Fitness",
      description: "Sessione boutique fitness in studio",
    },
  });

  const coaching = await prisma.sessionType.upsert({
    where: { code: "COACHING_ONLINE" },
    update: {
      name: "Coaching Online",
      description: "Sessione di coaching online",
    },
    create: {
      code: "COACHING_ONLINE",
      name: "Coaching Online",
      description: "Sessione di coaching online",
    },
  });

  return [boutique, coaching];
}

async function seedSlotsForDate(sessionTypes, date) {
  const dateOnly = asDateOnlyUtc(date);

  for (const sessionType of sessionTypes) {
    const rows = [];
    for (let hour = SLOT_START_HOUR; hour < SLOT_END_HOUR_EXCLUSIVE; hour += 1) {
      rows.push({
        sessionTypeId: sessionType.id,
        date: dateOnly,
        startTime: asTimeUtc(hour),
        endTime: asTimeUtc(hour + 1),
        capacity: CAPACITY_PER_SLOT,
        bookedCount: 0,
      });
    }

    await prisma.timeSlot.createMany({
      data: rows,
      skipDuplicates: true,
    });
  }
}

async function main() {
  const sessionTypes = await ensureSessionTypes();

  const today = new Date();
  for (let offset = 0; offset < DAYS_AHEAD; offset += 1) {
    const d = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
    );
    d.setUTCDate(d.getUTCDate() + offset);
    await seedSlotsForDate(sessionTypes, d);
  }

  const slotCount = await prisma.timeSlot.count();
  console.log(`Seed completato. TimeSlot totali: ${slotCount}`);
}

main()
  .catch((error) => {
    console.error("Errore seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
