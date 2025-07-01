import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/manufacturers/new')({
  component: () => <div>Hello /_authenticated/manufacturers/new!</div>,
})
