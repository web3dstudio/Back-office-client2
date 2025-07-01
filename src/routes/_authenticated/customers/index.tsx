import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/customers/')({
  component: () => <div>Hello /_authenticated/customers/!</div>,
})
