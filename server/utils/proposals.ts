import type { PrismaClient } from '../../app/generated/prisma/client'

const VOTING_DAYS = 3

export function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function votingDeadline(createdAt: Date): Date {
  const d = new Date(createdAt)
  d.setDate(d.getDate() + VOTING_DAYS)
  return d
}

export async function updateProposalStatus(prisma: PrismaClient, proposalId: string) {
  const proposal = await prisma.goalProposal.findUnique({
    where: { id: proposalId },
    include: {
      group: { include: { users: true } },
      votes: true,
    },
  })
  if (!proposal) return null
  if (proposal.status !== 'pending') return proposal

  const memberCount = proposal.group.users.length
  const required = Math.ceil(memberCount / 2)
  const voteCount = proposal.votes.length

  if (voteCount >= required) {
    return prisma.goalProposal.update({
      where: { id: proposalId },
      data: { status: 'adopted' },
    })
  }
  return proposal
}

export async function getProposalWithStats(prisma: PrismaClient, proposalId: string) {
  const proposal = await prisma.goalProposal.findUnique({
    where: { id: proposalId },
    include: {
      proposer: { select: { id: true, name: true } },
      group: { include: { users: { select: { id: true, name: true } } } },
      votes: { include: { user: { select: { id: true, name: true } } } },
      completions: { include: { user: { select: { id: true, name: true } } } },
    },
  })
  if (!proposal) return null
  return proposal
}

export function hasUserProposedToday(prisma: PrismaClient, userId: string) {
  const today = startOfToday()
  return prisma.goalProposal.findFirst({
    where: {
      proposerId: userId,
      createdAt: { gte: today },
    },
  })
}
