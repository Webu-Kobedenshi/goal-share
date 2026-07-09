export interface Application {
  id: number
  groupId: number
  groupName: string
  applicantName: string
  message: string
  status: 'pending' | 'approved' | 'rejected'
}

const fallbackApplications: Application[] = [
  { id: 1, groupId: 1, groupName: 'プロジェクトA', applicantName: '田中 健太', message: 'ぜひ参加させてください！', status: 'pending' },
  { id: 2, groupId: 1, groupName: 'プロジェクトA', applicantName: '伊藤 さくら', message: '経験は浅いですが頑張ります', status: 'pending' },
  { id: 3, groupId: 2, groupName: 'デザインチーム', applicantName: '中村 翔', message: '', status: 'pending' }
]

let nextId = fallbackApplications.length + 1

const applications = ref<Application[]>([...fallbackApplications])

export const useApplications = () => {
  const addApplication = (data: {
    groupId: number
    groupName: string
    applicantName: string
    message: string
  }) => {
    const newApp: Application = {
      id: nextId++,
      ...data,
      status: 'pending'
    }
    applications.value.push(newApp)
  }

  const approve = (id: number) => {
    const app = applications.value.find(a => a.id === id)
    if (app) {
      app.status = 'approved'
    }
  }

  const reject = (id: number) => {
    const app = applications.value.find(a => a.id === id)
    if (app) {
      app.status = 'rejected'
    }
  }

  const statusLabel = (status: string): string => {
    const map: Record<string, string> = { pending: '保留中', approved: '承認済み', rejected: '却下' }
    return map[status] ?? status
  }

  const statusClass = (status: string): string => {
    const map: Record<string, string> = { pending: 'status-pending', approved: 'status-approved', rejected: 'status-rejected' }
    return map[status] ?? ''
  }

  return {
    applications,
    addApplication,
    approve,
    reject,
    statusLabel,
    statusClass
  }
}
