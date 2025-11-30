import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/reports/')({
  component: ReportsIndexPage
})

function ReportsIndexPage() {
  return <Navigate to="/reports/statistics" replace />
}

