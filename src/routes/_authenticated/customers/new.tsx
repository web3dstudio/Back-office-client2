import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/customers/new')({
  component: () => <div>Hello /_authenticated/customers/new!</div>,
})
