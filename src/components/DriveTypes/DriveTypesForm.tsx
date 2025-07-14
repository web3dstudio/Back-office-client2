import { useTranslation } from "react-i18next"
import type { TDriveType, TEngineType } from "../../types"
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { object } from 'yup'
import { Box, Button, Grid, Typography } from "@mui/material"
import { useForm } from "react-hook-form"
import AppControlledTextField from "../AppControlledTextField"

interface Props {
  data: TDriveType | null
  isPending: boolean
  onCancel: () => void
  onConfirm: (data: TDriveType) => void
}

type TFormInput = Omit<TDriveType, 'id'>

function DriveTypesForm({ data, isPending, onCancel, onConfirm }: Props) {
  const { t } = useTranslation()

  const schema = object()
    .shape({
      name: yup.string().required(t('form-field.required')),
      code: yup.number().min(0).max(999).required(t('form-field.required')),
    })
    .required()

  const methods = useForm<TFormInput>({
    // @ts-ignore
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      name: data?.name || '',
      code: data?.code || 0,
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
            label={t('name', { ns: 'driveTypes' })}
            placeholder={t('name', { ns: 'driveTypes' })}
          />
        </Grid>
        <Grid size={12}>
          <AppControlledTextField
            required
            name='code'
            control={control}
            errors={errors}
            label={t('code', { ns: 'driveTypes' })}
            placeholder={t('code', { ns: 'driveTypes' })}
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

export default DriveTypesForm