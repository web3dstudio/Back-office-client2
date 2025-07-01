import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/repository/')({
  component: () => <div>Hello /_authenticated/repository/!</div>,
})
