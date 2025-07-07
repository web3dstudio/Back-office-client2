import { useTranslation } from "react-i18next"
import type { TManufacturer } from "../../types"
import { Box, Button, Grid, Typography } from "@mui/material"
import { useFormContext } from "react-hook-form"
import AppControlledTextField from "../AppControlledTextField"
import AppDropzoneField from "../AppDropzoneField"
import { useState } from "react"
import { useRouter } from "@tanstack/react-router"

interface Props {
  manufacturer: TManufacturer
}


function ManufacturerEditForm({ manufacturer }: Props) {
  const { t } = useTranslation()
  const { control, formState } = useFormContext()
  const errors = formState.errors
  const router = useRouter()

  const [files, setFiles] = useState<File[]>([])

  return (
    <Grid container columnSpacing={3} rowSpacing={2} columns={12} >
      <Grid size={6}>
        <AppControlledTextField
          required
          name='name'
          control={control}
          errors={errors}
          label={t('name', { ns: 'manufacturers' })}
          placeholder={t('name', { ns: 'manufacturers' })}
        />
      </Grid>
      <Grid size={6}>
        <AppControlledTextField
          required
          name='engName'
          control={control}
          errors={errors}
          label={t('engName', { ns: 'manufacturers' })}
          placeholder={t('engName', { ns: 'manufacturers' })}
        />
      </Grid>
      <Grid size={6}>
        <AppControlledTextField
          name='manufacturerCode'
          control={control}
          errors={errors}
          label={t('code', { ns: 'manufacturers' })}
          placeholder={t('code', { ns: 'manufacturers' })}
        />
      </Grid>

      <Grid size={6}>
        <AppDropzoneField
          name='manufacturerLogo'
          label={t('logo', { ns: 'manufacturers' })}
          maxFiles={1}
          onChange={(files) => {
            setFiles(files)
          }}
          defaultFiles={manufacturer?.logoDownloadUri ? [manufacturer.logoDownloadUri] : []}
        />
      </Grid>
      <Grid size={12} sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            color='primary'
            size='small'
            onClick={() => router.navigate({ to: '/manufacturers' })}
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
          // loading={isPending}
          >
            <Typography sx={{ textWrap: 'nowrap', fontSize: '14px', fontWeight: 'bold' }}>
              {t('modals.save', { ns: 'common' })}
            </Typography>
          </Button>
        </Box>
      </Grid>

    </Grid>


  )
}

export default ManufacturerEditForm