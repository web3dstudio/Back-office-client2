import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/price-list/advertisements/test/')({
  component: AdvertisementsTestPage,
})

function AdvertisementsTestPage() {
  return <></>
}


