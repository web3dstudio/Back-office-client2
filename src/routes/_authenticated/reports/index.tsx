import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/reports/')({
  component: () => <div>Hello /_authenticated/reports/!</div>,
})
