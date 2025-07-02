import type { TCarType, TPriceListType } from '../../types'
import { useTranslation } from 'react-i18next'
import { Box, Button, Typography } from '@mui/material'
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
  onConfirm: (data: TCarType) => void
}

type TFormInput = Omit<TCarType, 'id' | 'code' | 'icon'>

function CarTypeForm({ data, isPending, onCancel, onConfirm }: Props) {
  const { t } = useTranslation()

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
      priceListType: (() => {
        if (!data?.priceListType) return null;
        if (typeof data.priceListType === 'object') return data.priceListType;
        // ищем объект в списке
        return (priceListTypesList as TPriceListType[] | undefined)?.find(
          (item) => String(item.id) === String(data.priceListType)
        ) || null;
      })(),
    },
  })

  const { handleSubmit, control, formState, reset } = methods
  const errors = formState.errors

  const onSubmit = (data: any) => {
    onConfirm(data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container columns={12} sx={{ mt: 1, columnGap: 2 }}>
        <Grid size={12}>
          <AppControlledTextField
            required
            name='name'
            control={control}
            errors={errors}
            label={t('name', { ns: 'carTypes' })}
            placeholder={t('name', { ns: 'carTypes' })}
          />
        </Grid>

        <Grid size={12}>
          <AppControlledTextField
            name='carTypeID'
            control={control}
            errors={errors}
            label={t('ID', { ns: 'carTypes' })}
            placeholder={t('ID', { ns: 'carTypes' })}
          />
        </Grid>

        <Grid size={12}>
          <AppControlledTextField
            name='licenseType'
            control={control}
            errors={errors}
            label={t('licenseType', { ns: 'carTypes' })}
            placeholder={t('licenseType', { ns: 'carTypes' })}
          />
        </Grid>

        <Grid size={12}>
          <AppControlledAutocomplete
            name='priceListType'
            options={priceListTypesList as TPriceListType[] || []}
            control={control}
            errors={errors}
            label={t('priceListType', { ns: 'carTypes' })}
            placeholder={t('priceListType', { ns: 'carTypes' })}
          />
        </Grid>

        <Grid size={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              color='primary'
              size='small'
              onClick={onCancel}
              variant='outlined'
            >
              <Typography sx={{ textWrap: 'nowrap', fontSize: '14px', fontWeight: 'bold' }}>
                {t('modals.cancel', { ns: 'common' })}
              </Typography>
            </Button>
            <Button
              color='primary'
              type='submit'
              variant='contained'
              loading={isPending}
            >
              <Typography sx={{ textWrap: 'nowrap' }}>
                {t('modals.save', { ns: 'common' })}
              </Typography>
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  )
}

export default CarTypeForm
