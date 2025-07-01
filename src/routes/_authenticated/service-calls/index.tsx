import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/service-calls/')({
  component: () => <div>Hello /_authenticated/service-calls/!</div>,
})
