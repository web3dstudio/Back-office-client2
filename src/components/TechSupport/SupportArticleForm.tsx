import Grid from '@mui/material/Grid'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { object } from 'yup'
import { Box, CircularProgress, Button } from '@mui/material'
import AppControlledTextField from '../AppControlledTextField'
import { AppControlledAutocomplete } from '../AppControlledAutocomplete'
import { useMemo, lazy, Suspense, useEffect } from 'react'
import { selectOptionTypes } from '../../constants'
import type { TSupportArticle } from '../../types'
import { useSupportArticleCategoriesQuery, type TSupportArticleCategory, type TSupportArticleCreateData } from '../../query/supportArticles.query'

// Ленивая загрузка Rich Text Editor для ускорения загрузки страницы
const AppControlledRichTextEditor = lazy(() => import('../AppControlledRichTextEditor'))

type TApplicationOption = {
  id: number
  name: string
}

type TSupportArticleFormInput = {
  title: string
  application: TApplicationOption | null
  category: TSupportArticleCategory | null
  content: string
}

type TSupportArticleFormProps = {
  article: TSupportArticle | null
  onArticleSave: (data: TSupportArticleCreateData) => void
  isPending: boolean
}

function SupportArticleForm({ article, onArticleSave, isPending }: TSupportArticleFormProps) {
  const { t } = useTranslation()

  const { data: categories = [], isLoading: categoriesLoading } = useSupportArticleCategoriesQuery()

  const applicationOptions = useMemo(() => {
    return selectOptionTypes.map(o => ({ id: o, name: t(String(o), { ns: 'newSupportArticle' }) }))
  }, [t])

  const defaultApplication = applicationOptions.find((app: any) => app.id === article?.application) || null
  const defaultCategory = article?.category ? categories.find((cat: any) => cat.id === article.category.id) || null : null


  const schema = object()
    .shape({
      title: yup.string().required(t('form-field.required', { ns: 'common' })),
      application: yup.mixed().nullable().required(t('form-field.required', { ns: 'common' })),
      category: yup.mixed().nullable().required(t('form-field.required', { ns: 'common' })),
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
      category: defaultCategory,
      content: '',
    },
  })

  const { handleSubmit, control, formState, reset } = methods
  const errors = formState.errors

  useEffect(() => {
    if (article && categories.length > 0) {
      const defaultApplication = applicationOptions.find((app: any) => app.id === article.application) || null
      const defaultCategory = article.category ? categories.find((cat: any) => cat.id === article.category.id) || null : null
      reset({
        title: article.title || '',
        application: defaultApplication,
        category: defaultCategory,
        content: article.content || '',
      })
    } else if (!article && applicationOptions.length > 0 && categories.length > 0) {
      // Сбрасываем форму только если данные загружены
      reset({
        title: '',
        application: null,
        category: null,
        content: '',
      })
    }
  }, [article?.id, article?.title, article?.application, article?.category?.id, article?.content, applicationOptions, categories, reset])

  const onSubmit = (data: any) => {
    const submitData: TSupportArticleCreateData = {
      title: data.title,
      application: data.application?.id,
      supportArticleCategoryId: data.category?.id,
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
          <AppControlledAutocomplete<any>
            required
            name="category"
            control={control}
            options={categories}
            errors={errors}
            getOptionLabel={(option: any) => String(option?.name || option?.id || '')}
            isOptionEqualToValue={(option: any, value: any) => option?.id === value?.id || option?.name === value?.name}
            label={t('category', { ns: 'techSupport' })}
            placeholder={t('category', { ns: 'techSupport' })}
            loading={categoriesLoading}
          />
        </Grid>
        <Grid size={12}>
          <Suspense
            fallback={
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '200px',
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: '24px',
                }}
              >
                <CircularProgress />
              </Box>
            }
          >
            <AppControlledRichTextEditor
              key={article?.id || 'new'}
              name="content"
              control={control}
              errors={errors}
              label={t('content', { ns: 'techSupport' })}
              placeholder={t('content', { ns: 'techSupport' })}
            />
          </Suspense>
        </Grid>
        <Grid size={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              loading={isPending}
              disabled={!formState.isValid}
            >
              {t('save', { ns: 'common' })}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  )
}

export default SupportArticleForm

