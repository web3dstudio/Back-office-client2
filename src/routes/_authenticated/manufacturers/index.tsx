import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/manufacturers/')({
  component: () => <div>Hello /_authenticated/manufacturers/!</div>,
})
