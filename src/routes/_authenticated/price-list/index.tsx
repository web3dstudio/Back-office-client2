import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/price-list/')({
  component: () => <div>Hello /_authenticated/price-list/!</div>,
})
