import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/price-list/advertisements/',
)({
  component: AdvertisementsPage,
})

function AdvertisementsPage() {
  return <div>Hello "/_authenticated/price-list/advertisements/"!</div>
}


