import { useTranslation } from 'react-i18next'
import type { TAdvertisement } from '../../types'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { object } from 'yup'
import { Box, Button, Grid, Typography } from '@mui/material'
import { useForm, type SubmitHandler } from 'react-hook-form'
import AppControlledTextField from '../AppControlledTextField'
import AppDropzoneField from '../AppDropzoneField'
import { useState } from 'react'
import type { FileWithPath } from 'react-dropzone'

type FileWithPreview = FileWithPath & { preview?: string }

interface Props {
  data: TAdvertisement | null
  pageType: number
  dock: number
  isPending: boolean
  onCancel: () => void
  onConfirm: (data: { pageType: number; dock: number; link: string | null; script: string | null; file?: File | null; id?: string }) => void
}

type TFormInput = {
  link: string | null
  script: string | null
}

function AdvertisementForm({ data, pageType, dock, isPending, onCancel, onConfirm }: Props) {
  const { t } = useTranslation('advertisements')
  const [files, setFiles] = useState<FileWithPreview[]>([])

  const schema = object()
    .shape({
      link: yup.string().nullable(),
      script: yup.string().nullable(),
    })
    .required()

  const methods = useForm<TFormInput>({
    resolver: yupResolver(schema) as any,
    mode: 'onChange',
    defaultValues: {
      link: data?.link || '',
      script: data?.script || '',
    },
  })

  const { handleSubmit, control, formState, reset } = methods
  const errors = formState.errors

  const onSubmit: SubmitHandler<TFormInput> = (formData) => {
    // Получаем файл из files (FileWithPreview), если он новый (не из defaultFiles)
    // Проверяем, что это реальный File объект, а не URL строка из defaultFiles
    const newFile = files.find((f) => {
      // Если preview начинается с 'blob:', это новый загруженный файл
      return f.preview && f.preview.startsWith('blob:')
    }) as FileWithPreview | undefined

    onConfirm({
      pageType,
      dock,
      link: formData.link || null,
      script: formData.script || null,
      file: (newFile as File) || null,
      id: data?.id,
    })
    reset()
    setFiles([])
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container sx={{ mt: 1 }} spacing={2}>
        <Grid size={12}>
          <AppControlledTextField
            name="link"
            control={control}
            errors={errors}
            label={t('link')}
            placeholder={t('link')}
          />
        </Grid>
        <Grid size={12}>
          <AppControlledTextField
            name="script"
            control={control}
            errors={errors}
            label={t('content')}
            placeholder={t('content')}
            multiline
            minRows={4}
          />
        </Grid>
        <Grid size={12}>
          <AppDropzoneField
            name="advertisementImage"
            label={t('uploadImage')}
            maxFiles={1}
            maxFileSize={5 * 1024 * 1024}
            previewWidth={300}
            previewHeight={150}
            defaultFiles={data?.imageDownloadUri ? [data.imageDownloadUri] : []}
            onChange={(files) => {
              setFiles(files)
            }}
          />
        </Grid>

        <Grid size={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button color="primary" size="small" onClick={onCancel} variant="outlined">
              <Typography sx={{ textWrap: 'nowrap', fontSize: '14px', fontWeight: 'bold' }}>
                {t('modals.cancel', { ns: 'common' })}
              </Typography>
            </Button>
            <Button color="primary" type="submit" variant="contained" loading={isPending}>
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

export default AdvertisementForm

