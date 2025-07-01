import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/catalog/')({
  component: () => <div>Hello /_authenticated/catalog/!</div>,
})
