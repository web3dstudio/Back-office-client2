import type { TCarType, TIcon, TPriceListType } from '../../types'
import { useTranslation } from 'react-i18next'
import { Box, Button, Typography, useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { object } from 'yup'
import AppControlledTextField from '../AppControlledTextField'
import { AppControlledAutocomplete } from '../AppControlledAutocomplete'
import { usePriceListTypesQuery } from '../../query/priceListTypes.querty'
import { useEffect, useState } from 'react'
import AppDialog from '../AppDialog/AppDialog'
import AppIconsSearch from '../AppIconsSearch'
import AppActionButton from '../AppActionButton'


interface Props {
  data: TCarType | null
  isPending: boolean
  onCancel: () => void
  onConfirm: (data: TCarType) => void
}

type TFormInput = Omit<TCarType, 'id' | 'code' | 'icon' | 'iconId' | 'priceListType'> & { priceListType: TPriceListType | null }

function CarTypeForm({ data, isPending, onCancel, onConfirm }: Props) {
  const { t } = useTranslation()
  const theme = useTheme()
  const [openIconDialog, setOpenIconDialog] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState<TIcon | null>(null)

  const { data: priceListTypesList } = usePriceListTypesQuery()

  useEffect(() => {
    if (data?.iconId) {
      setSelectedIcon(data?.icon as TIcon)
    }
  }, [data?.iconId])

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
        return priceListTypesList?.find(
          (item) => String(item.id) === String(data.priceListType)
        ) || null;
      })(),

    },
  })

  const { handleSubmit, control, formState, reset } = methods
  const errors = formState.errors

  const onSubmit = (data: any) => {
    onConfirm({ ...data, iconId: selectedIcon?.id || null })
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container columns={12} sx={{ mt: 1, columnGap: 3 }}>
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
            getOptionLabel={(option) => option.name}
          />
        </Grid>

        <Grid size={'auto'}>
          <Box
            sx={{
              width: 140,
              height: 140,
              border: '1px solid #ccc',
              borderRadius: theme.shape.borderRadius,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: theme.palette.mode === 'dark' ? '#000' : '#f7f7f9',
              position: 'relative',
            }}
          >
            {selectedIcon?.downloadUri && (
              <AppActionButton
                type='delete'
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                }}
                onClick={() => {
                  setSelectedIcon(null)
                }} />
            )}

            {(selectedIcon?.downloadUri) && (
              <img
                src={selectedIcon?.downloadUri || ''}
                alt="preview"
                style={{
                  maxWidth: '80%',
                  maxHeight: '80%',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            )}

            {(!selectedIcon?.downloadUri) && (
              <Typography sx={{ textAlign: 'center', fontSize: '12px', color: theme.palette.text.secondary }}>
                {t('noIcon', { ns: 'common' })}
              </Typography>
            )}
          </Box>
        </Grid>

        <Grid size={'grow'}>
          <Button variant='contained' color='primary' onClick={() => setOpenIconDialog(true)}>
            {t('modals.searchIcon', { ns: 'common' })}
          </Button>
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
      <AppDialog
        open={openIconDialog}
        onClose={() => setOpenIconDialog(false)}
        title={t('modals.searchIcon', { ns: 'common' })}
      >
        <AppIconsSearch
          selectedIcon={selectedIcon}
          onSelect={(icon: TIcon) => {
            setSelectedIcon(icon)
            setOpenIconDialog(false)
          }} />
      </AppDialog>
    </form>
  )
}

export default CarTypeForm
