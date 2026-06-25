import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client.ts";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DIRECT_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  await prisma.goalCompletion.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.goalProposal.deleteMany();
  await prisma.user.deleteMany();
  await prisma.group.deleteMany();

  const group = await prisma.group.create({
    data: { name: "テストグループ" },
  });
  console.log(`Created group: ${group.id} (${group.name})`);

  const names = ["たなか", "すずき", "さとう", "やまだ"];
  for (const name of names) {
    const user = await prisma.user.create({
      data: { name, groupId: group.id },
    });
    console.log(`Created user: ${user.id} (${user.name})`);
  }

  console.log("\nDone! Group ID:", group.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
