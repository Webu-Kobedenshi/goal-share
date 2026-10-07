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
  const error = ref('')

  // 権限が無い(403)などの失敗は空配列にせず、理由を error に出す
  const fetchApplications = async (groupId: number | string) => {
    try {
      applications.value = await $fetch<Application[]>(`/api/groups/${groupId}/join-requests`)
      error.value = ''
    } catch (e) {
      applications.value = []
      error.value = errorMessage(e, '申請一覧の読み込みに失敗しました')
    }
  }

  const updateStatus = async (app: Application, status: 'APPROVED' | 'REJECTED') => {
    try {
      await $fetch(`/api/groups/${app.groupId}/join-requests/${app.id}`, {
        method: 'PATCH',
        body: { status }
      })
      app.status = status
      error.value = ''
    } catch (e) {
      error.value = errorMessage(e, '申請の処理に失敗しました')
      // 他の人が先に処理した場合などに備えて最新の状態を取り直す
      await fetchApplications(app.groupId)
    }
  }

  const approve = (app: Application) => updateStatus(app, 'APPROVED')
  const reject = (app: Application) => updateStatus(app, 'REJECTED')

  const statusLabel = (status: string): string => {
    const map: Record<string, string> = { PENDING: '保留中', APPROVED: '承認済み', REJECTED: '却下' }
    return map[status] ?? status
  }

  const statusClass = (status: string): string => {
    const map: Record<string, string> = {
      PENDING: 'status-pending',
      APPROVED: 'status-approved',
      REJECTED: 'status-rejected'
    }
    return map[status] ?? ''
  }

  return {
    applications,
    error,
    fetchApplications,
    approve,
    reject,
    statusLabel,
    statusClass
  }
}
