import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/accessories/')({
  component: () => <div>Hello /_authenticated/accessories/!</div>,
})
