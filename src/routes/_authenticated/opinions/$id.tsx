import { createFileRoute } from '@tanstack/react-router'
import AppBackBtn from '../../../components/AppBackBtn'
import { useTranslation } from 'react-i18next'
import OpinionForm from '../../../components/Opinions/OpinionForm'
import { Grid } from '@mui/material'
import { useOpinionQuery } from '../../../query/opinios.query'
import AppLoading from '../../../components/AppLoading'

export const Route = createFileRoute('/_authenticated/opinions/$id')({
  component: EditOpinionPage,
})

function EditOpinionPage() {
  const { id } = Route.useParams()
  const { t } = useTranslation()
  const { data: opinion, isLoading } = useOpinionQuery(id)

  const handleSave = (data: any) => {
    console.log('EDIT', data)
  }

  if (isLoading) return <AppLoading />

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <AppBackBtn children={t('back', { ns: 'common' })} />
      </Grid>
      <Grid size={12}>
        <OpinionForm
          data={opinion || null}
          onSave={handleSave}
          title={`${t('editTitle', { ns: 'opinion' })} ${opinion?.number}`}
        />
      </Grid>
    </Grid>
  )
}