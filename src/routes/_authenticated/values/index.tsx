import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/values/')({
  component: () => <div>Hello /_authenticated/values/!</div>,
})
