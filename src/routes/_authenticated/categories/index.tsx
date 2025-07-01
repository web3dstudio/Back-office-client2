import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/categories/')({
  component: () => <div>Hello /_authenticated/categories/!</div>,
})
