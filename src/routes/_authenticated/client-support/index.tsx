import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/client-support/')({
  component: () => <div>Hello /_authenticated/client-support/!</div>,
})
