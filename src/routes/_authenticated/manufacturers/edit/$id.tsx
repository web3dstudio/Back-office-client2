import { createFileRoute } from '@tanstack/react-router'
import { useManufacturerDeleteMutation, useManufacturerQuery } from '../../../../query/manufacturers.query'
import AppLoading from '../../../../components/AppLoading'
import AppError from '../../../../components/AppError'
import { Box, Grid, OutlinedInput, Typography } from '@mui/material'
import AppBackBtn from '../../../../components/AppBackBtn'
import { useTranslation } from 'react-i18next'
import StyledPaper from '../../../../components/StyledPaper'
import ManufacturerEditForm from '../../../../components/Manufacturer/ManufacturerEditForm'
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm, type SubmitHandler, FormProvider } from 'react-hook-form'
import * as yup from 'yup'
import { useEffect } from 'react'
import AppActionButton from '../../../../components/AppActionButton'

export const Route = createFileRoute('/_authenticated/manufacturers/edit/$id')(
  {
    component: MenufacturerEditPage,
  },
)

type TFormInput = any

function MenufacturerEditPage() {
  const { id } = Route.useParams()
  const { t, i18n } = useTranslation()

  const { data: manufacturer, isLoading, isError } = useManufacturerQuery(id)

  const defaultValues = {
    name: manufacturer?.name ?? '',
    engName: manufacturer?.engName ?? '',
  };

  const schema = yup.object().shape({
    name: yup.string().required(t('form-field.required')),
    engName: yup.string().required(t('form-field.required')),
  })

  const methods = useForm<TFormInput>({
    // @ts-ignore
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: defaultValues
  })
  const { handleSubmit, reset } = methods
  useEffect(() => {
    if (manufacturer) {
      reset(defaultValues)
    }
  }, [manufacturer])

  const onSubmit: SubmitHandler<TFormInput> = (data) => {
    console.log(data);
  }

  const onSerieDelete = (serieId: string) => {
    console.log('delete', serieId)
  }

  if (isLoading) {
    return <AppLoading />
  }

  if (isError && !isLoading) {
    return <AppError />
  }

  return (

    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3} >
          <Grid size={12}>
            <AppBackBtn children={t('back', { ns: 'common' })} />
          </Grid>
          <Grid
            size={12}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {`${t('title', { ns: 'manufacturers' })} > ${i18n.language === 'he' ? manufacturer?.name : manufacturer?.engName}`}
              </Typography>
            </Box>
          </Grid>

          <StyledPaper
            sx={{
              overflow: 'hidden',
              padding: 3,
              width: '100%',
              // display: 'flex',
              maxWidth: '100%',
            }}
          >
            {manufacturer && (
              <ManufacturerEditForm manufacturer={manufacturer} />
            )}
          </StyledPaper>

          <Grid size={12}>
            {/* фильтр по коду */}
            <OutlinedInput
              placeholder={t('filterByCode', { ns: 'manufacturers' })}
              onChange={(e) => {
                console.log(e.target.value)
              }}
            />
          </Grid>

          {manufacturer?.serieses && (
            manufacturer.serieses.map((serie) => (
              <Grid container size={12} gap={3} key={serie.id}>
                <Grid size={'auto'}>
                  <AppActionButton
                    type='delete'
                    onClick={() => {
                      onSerieDelete(serie.id)
                    }}
                  />
                </Grid>
                <Grid size={'grow'}>
                  <StyledPaper
                    sx={{
                      overflow: 'hidden',
                      padding: 3,
                      width: '100%',
                      // display: 'flex',
                      maxWidth: '100%',
                    }}
                  >
                    {serie.name}
                  </StyledPaper>
                </Grid>
              </Grid>
            ))

          )}

        </Grid>
      </form>
    </FormProvider>

  )
}


