import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding realistic member attendance history...");

  const members = await prisma.member.findMany({
    where: { status: "ACTIVE" },
    include: { memberships: { take: 1, orderBy: { createdAt: "desc" } } },
  });

  console.log(`Found ${members.length} active members.`);

  const today = new Date();

  for (const member of members) {
    // Generate attendance for past 20 days with realistic workout pattern (workout 4-5 days a week, rest on Sundays)
    for (let dayOffset = 1; dayOffset <= 25; dayOffset++) {
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - dayOffset);

      const dayOfWeek = pastDate.getDay(); // 0 is Sunday
      // Rest on Sundays and occasionally on Thursdays
      if (dayOfWeek === 0 || (dayOffset % 6 === 0)) {
        continue; // Absent / rest day
      }

      const y = pastDate.getFullYear();
      const m = String(pastDate.getMonth() + 1).padStart(2, "0");
      const d = String(pastDate.getDate()).padStart(2, "0");
      const dateString = `${y}-${m}-${d}`;

      // Pick shift: alternate between Morning and Evening
      const isMorning = dayOffset % 2 === 0;
      const shift = isMorning ? "MORNING" : "EVENING";
      const hours = isMorning ? 6 + (dayOffset % 3) : 17 + (dayOffset % 3);
      const minutes = 15 + (dayOffset * 7) % 40;
      pastDate.setHours(hours, minutes, 0, 0);

      // Check if attendance already exists for this member on this date
      const existing = await prisma.attendance.findFirst({
        where: {
          memberId: member.id,
          dateString,
        },
      });

      if (!existing) {
        await prisma.attendance.create({
          data: {
            memberId: member.id,
            checkInAt: pastDate,
            dateString,
            shift,
            status: "PRESENT",
            verifiedBy: "QR_SCANNER",
            notes: null,
          },
        });
      }
    }
  }

  const count = await prisma.attendance.count();
  console.log(`Total attendance records in database now: ${count}`);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
