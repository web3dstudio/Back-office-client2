import type { TCarType, TPriceListType } from '../../types'
import { useTranslation } from 'react-i18next'
import { Box, Button } from '@mui/material'
import Grid from '@mui/material/Grid'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { object } from 'yup'
import AppControlledTextField from '../AppControlledTextField'
import { AppControlledAutocomplete } from '../AppControlledAutocomplete'
import { usePriceListTypesQuery } from '../../query/priceListTypes.querty'


interface Props {
  data: TCarType | null
  isPending: boolean
  onCancel: () => void
  onConfirm: (data: TFormInput) => void
}

type TFormInput = Omit<TCarType, 'id' | 'code' | 'icon'>

function CarTypeForm({ data, isPending = false, onCancel }: Props) {
  const { t } = useTranslation('common')
  const { t: tCat } = useTranslation('categories')
  const { t: tCarTypes } = useTranslation('carTypes')

  const { data: priceListTypesList } = usePriceListTypesQuery()

  const schema = object()
    .shape({
      name: yup.string().required(t('form-field.required')),
      carTypeID: yup
        .string()
        .nullable()
        .transform((o, c) => (o === '' ? null : c))
        .min(1)
        .max(255),
      licenseType: yup
        .string()
        .nullable()
        .transform((o, c) => (o === '' ? null : c))
        .min(1)
        .max(255),
      priceListType: yup
        .object()
        .shape({
          id: yup.number().required(t('form-field.required')),
          name: yup.string().required(t('form-field.required')),
        })
        .nullable(),
    })
    .required()

  const methods = useForm<TFormInput>({
    // @ts-ignore
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      name: data?.name || '',
      carTypeID: data?.carTypeID || '',
      licenseType: data?.licenseType || '',
      priceListType: data?.priceListType || null,
    },
  })

  const { control, formState } = methods
  const errors = formState.errors

  // const onSubmit: SubmitHandler<TFormInput> = (data) => {
  //   onConfirm(data)
  // }
  return (
    <form
    // onSubmit={handleSubmit(onSubmit) as FormEventHandler<HTMLFormElement>}
    >
      <Grid container sx={{ mt: 1 }}>
        <Grid size={12}>
          <AppControlledTextField
            required
            name='name'
            control={control}
            errors={errors}
            label={t('modals.name')}
            placeholder={t('modals.name')}
          />
        </Grid>

        <Grid size={12}>
          <AppControlledTextField
            name='carTypeID'
            control={control}
            errors={errors}
            label={tCarTypes('ID')}
            placeholder={tCarTypes('ID')}
          />
        </Grid>

        <Grid size={12}>
          <AppControlledTextField
            name='licenseType'
            control={control}
            errors={errors}
            label={tCat('licenseType')}
            placeholder={tCat('licenseType')}
          />
        </Grid>

        <Grid size={12}>
          <AppControlledAutocomplete
            name='priceListType'
            options={priceListTypesList as TPriceListType[]}
            control={control}
            errors={errors}
            label={tCat('priceListType')}
            placeholder={tCat('priceListType')}
          />
        </Grid>

        <Grid
          size={12}
          sx={{ display: 'flex', justifyContent: 'end', gap: 1, mt: 3 }}
        >
          <Box>
            <Button variant='outlined' onClick={() => onCancel()}>
              {t('modals.cancel', { ns: 'common' })}
            </Button>
          </Box>

          <Box sx={{ minWidth: '100px' }}>
            <Button
              disabled={
                !formState.isValid || (formState.isValid && !formState.isDirty)
              }
              loading={isPending}
              variant='contained'
              type='submit'
              fullWidth
            >
              {t('modals.save', { ns: 'common' })}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  )
}

export default CarTypeForm
