import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client.ts";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("DIRECT_URL is not set");

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const action = process.argv[2];

if (action === "age") {
  const id = process.argv[3];
  const days = Number(process.argv[4] ?? 5);
  const past = new Date();
  past.setDate(past.getDate() - days);
  const result = await prisma.goalProposal.update({
    where: { id },
    data: { createdAt: past },
  });
  console.log(`Updated ${id} createdAt to ${result.createdAt.toISOString()}`);
} else if (action === "list") {
  const proposals = await prisma.goalProposal.findMany({
    include: { _count: { select: { votes: true, completions: true } } },
    orderBy: { createdAt: "desc" },
  });
  for (const p of proposals) {
    console.log(`${p.id} | ${p.status} | created=${p.createdAt.toISOString()} | votes=${p._count.votes}`);
  }
} else if (action === "add") {
  const proposerName = process.argv[3] ?? "たなか";
  const user = await prisma.user.findFirst({ where: { name: proposerName } });
  if (!user) throw new Error("user not found");
  const p = await prisma.goalProposal.create({
    data: {
      content: "テスト用の古い提案",
      durationDays: 7,
      groupId: user.groupId,
      proposerId: user.id,
    },
  });
  console.log(`Created: ${p.id}`);
} else {
  console.log("Usage: tsx scripts/age-test.ts [age <id> <days>] | [list] | [add <name>]");
}

await prisma.$disconnect();
