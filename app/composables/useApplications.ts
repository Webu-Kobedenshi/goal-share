export interface Application {
  id: number
  groupId: number
  userId: number
  applicantName: string
  applicantEmail: string
  message: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
}

export const useApplications = () => {
  const applications = ref<Application[]>([])

  const fetchApplications = async (groupId: number) => {
    try {
      const data = await $fetch<Application[]>(`/api/groups/${groupId}/join-requests`)
      applications.value = data ?? []
    } catch {
      applications.value = []
    }
  }

  const addApplication = async (data: { groupId: number; message?: string }) => {
    try {
      await $fetch(`/api/groups/${data.groupId}/join-requests`, {
        method: 'POST',
        body: { message: data.message },
      })
      return true
    } catch (e: any) {
      throw new Error(e?.data?.message ?? '申請に失敗しました')
    }
  }

  const approve = async (requestId: number, groupId: number) => {
    const data = await $fetch<{ id: number; status: string }>(
      `/api/groups/${groupId}/join-requests/${requestId}`,
      { method: 'PATCH', body: { status: 'APPROVED' } },
    )
    const app = applications.value.find(a => a.id === requestId)
    if (app) app.status = 'APPROVED'
  }

  const reject = async (requestId: number, groupId: number) => {
    const data = await $fetch<{ id: number; status: string }>(
      `/api/groups/${groupId}/join-requests/${requestId}`,
      { method: 'PATCH', body: { status: 'REJECTED' } },
    )
    const app = applications.value.find(a => a.id === requestId)
    if (app) app.status = 'REJECTED'
  }

  const statusLabel = (status: string): string => {
    const map: Record<string, string> = { PENDING: '保留中', APPROVED: '承認済み', REJECTED: '却下' }
    return map[status] ?? status
  }

  const statusClass = (status: string): string => {
    const map: Record<string, string> = { PENDING: 'status-pending', APPROVED: 'status-approved', REJECTED: 'status-rejected' }
    return map[status] ?? ''
  }

  return {
    applications,
    fetchApplications,
    addApplication,
    approve,
    reject,
    statusLabel,
    statusClass,
  }
}
