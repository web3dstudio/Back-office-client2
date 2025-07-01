import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/opinions/new')({
  component: () => <div>Hello /_authenticated/opinions/new!</div>,
})
