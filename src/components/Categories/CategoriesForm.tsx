import { useTranslation } from "react-i18next"
import type { TCategory } from "../../types"
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { object } from 'yup'
import { Box, Button, Grid, Typography } from "@mui/material"
import { useForm } from "react-hook-form"
import AppControlledTextField from "../AppControlledTextField"

interface Props {
  data: TCategory | null
  isPending: boolean
  onCancel: () => void
  onConfirm: (data: TCategory) => void
}

type TFormInput = Omit<TCategory, 'id'>

function CategoriesForm({ data, isPending, onCancel, onConfirm }: Props) {
  const { t } = useTranslation()

  const schema = object()
    .shape({
      name: yup.string().required(t('form-field.required')),
      nameEn: yup.string().nullable(),
      categoryID: yup.string().nullable(),
    })
    .required()

  const methods = useForm<TFormInput>({
    // @ts-ignore
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      name: data?.name || '',
      nameEn: data?.nameEn || '',
      categoryID: data?.categoryID || '',
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
      <Grid container sx={{ mt: 1 }}>
        <Grid size={12}>
          <AppControlledTextField
            required
            name='name'
            control={control}
            errors={errors}
            label={t('name', { ns: 'categories' })}
            placeholder={t('name', { ns: 'categories' })}
          />
        </Grid>
        <Grid size={12}>
          <AppControlledTextField
            name='nameEn'
            control={control}
            errors={errors}
            label={t('nameEn', { ns: 'categories' })}
            placeholder={t('nameEn', { ns: 'categories' })}
          />
        </Grid>
        <Grid size={12}>
          <AppControlledTextField
            type='text'
            name='categoryID'
            control={control}
            errors={errors}
            label={t('categoryID', { ns: 'categories' })}
            placeholder={t('categoryID', { ns: 'categories' })}
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

export default CategoriesForm