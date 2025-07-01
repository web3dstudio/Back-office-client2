import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/catalog/new-car')({
  component: () => <div>Hello /_authenticated/catalog/new-car!</div>,
})
