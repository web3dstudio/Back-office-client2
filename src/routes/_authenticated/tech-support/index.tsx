import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/tech-support/')({
  component: () => <div>Hello /_authenticated/tech-support/!</div>,
})
