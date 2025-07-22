import { createFileRoute } from '@tanstack/react-router'
import AppBackBtn from '../../../components/AppBackBtn'
import { useTranslation } from 'react-i18next'
import OpinionForm from '../../../components/Opinions/OpinionForm'
import { Grid } from '@mui/material'

export const Route = createFileRoute('/_authenticated/opinions/new')({
  component: NewOpinionPage
})

function NewOpinionPage() {
  const { t } = useTranslation()

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <AppBackBtn children={t('back', { ns: 'common' })} />
      </Grid>
      <Grid size={12}>
        <OpinionForm
          opinion={null}
          title={t('title', { ns: 'opinion' })}
        />
      </Grid>
    </Grid>
  )
}
