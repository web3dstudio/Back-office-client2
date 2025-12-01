import Grid from '@mui/material/Grid'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { object } from 'yup'
import LoadingButton from '@mui/lab/LoadingButton'
import AppControlledTextField from '../AppControlledTextField'
import { AppControlledAutocomplete } from '../AppControlledAutocomplete'
import AppControlledRichTextEditor from '../AppControlledRichTextEditor'
import { Box } from '@mui/material'

// TODO: Определить реальный тип для application из API
// type TApplication = { ... }

type TSupportArticleFormInput = {
  title: string
  application: any | null // TODO: Заменить на реальный тип
  content: string
}

type TSupportArticleSubmitData = {
  title: string
  application: number | null
  content: string
}

type TSupportArticleFormProps = {
  article: { id: string; title: string; application: number; categoryName: string } | null
  onArticleSave: (data: TSupportArticleSubmitData) => void
  isPending: boolean
}

function SupportArticleForm({ article, onArticleSave, isPending }: TSupportArticleFormProps) {
  const { t } = useTranslation()

  // TODO: Заменить на реальный запрос для получения списка applications
  // const { data: applications } = useApplicationsQuery()
  const applicationOptions: any[] = [] // TODO: Заменить на реальный тип

  const defaultApplication = applicationOptions.find((app: any) => app.id === article?.application) || null

  const schema = object()
    .shape({
      title: yup.string().required(t('form-field.required', { ns: 'common' })),
      application: yup.mixed().nullable().required(t('form-field.required', { ns: 'common' })),
      content: yup.string().optional(),
    })
    .required()

  const methods = useForm<TSupportArticleFormInput>({
    // @ts-ignore
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      title: article?.title || '',
      application: defaultApplication,
      content: '',
    },
  })

  const { handleSubmit, control, formState } = methods
  const errors = formState.errors

  const onSubmit = (data: any) => {
    const submitData: TSupportArticleSubmitData = {
      title: data.title,
      application: data.application?.id || null,
      content: data.content,
    }
    onArticleSave(submitData)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 8 }}>
          <AppControlledTextField
            required
            name="title"
            control={control}
            errors={errors}
            label={t('nameOrTitle', { ns: 'techSupport' })}
            placeholder={t('nameOrTitle', { ns: 'techSupport' })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <AppControlledAutocomplete<any>
            required
            name="application"
            control={control}
            options={applicationOptions}
            errors={errors}
            getOptionLabel={(option: any) => String(option?.name || option?.id || '')}
            isOptionEqualToValue={(option: any, value: any) => option?.id === value?.id}
            label={t('application', { ns: 'techSupport' })}
            placeholder={t('application', { ns: 'techSupport' })}
          />
        </Grid>
        <Grid size={12}>
          <AppControlledRichTextEditor
            name="content"
            control={control}
            errors={errors}
            label={t('content', { ns: 'techSupport' })}
            placeholder={t('content', { ns: 'techSupport' })}
          />
        </Grid>
        <Grid size={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={isPending}
              disabled={!formState.isValid}
            >
              {t('save', { ns: 'common' })}
            </LoadingButton>
          </Box>
        </Grid>
      </Grid>
    </form>
  )
}

export default SupportArticleForm

