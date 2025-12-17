import { useTranslation } from 'react-i18next'
import type { TIcon, TMark } from '../../types'
import { useEffect, useMemo, useState } from 'react'
import { Box, Button, Grid, Typography } from '@mui/material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { object } from 'yup'
import AppControlledTextField from '../AppControlledTextField'
import AppDialog from '../AppDialog/AppDialog'
import AppIconsSearch from '../AppIconsSearch'
import AppActionButton from '../AppActionButton'
import { useIconsQuery } from '../../query/icons.query'
import type { TMarkCreate, TMarkUpdate } from '../../query/marks.query'

interface Props {
  data: TMark | null
  isPending: boolean
  onCancel: () => void
  onConfirm: (data: TMarkCreate | TMarkUpdate) => void
}

type TFormInput = {
  name: string
}

function MarksForm({ data, isPending, onCancel, onConfirm }: Props) {
  const { t } = useTranslation()
  const [openIconDialog, setOpenIconDialog] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState<TIcon | null>(null)
  const { data: icons } = useIconsQuery()

  const iconById = useMemo(() => {
    const map = new Map<string, TIcon>()
    for (const i of icons || []) map.set(i.id, i)
    return map
  }, [icons])

  useEffect(() => {
    if (data?.iconId) setSelectedIcon(iconById.get(data.iconId) || null)
    else setSelectedIcon(null)
  }, [data?.iconId, iconById])

  const schema = object()
    .shape({
      name: yup.string().required(t('form-field.required')),
      oldId: yup
        .string()
        .nullable()
        .transform((o, c) => (o === '' ? null : c)),
    })
    .required()

  const methods = useForm<TFormInput>({
    // @ts-ignore
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      name: data?.name || '',
    },
  })

  const { handleSubmit, control, formState, reset } = methods
  const errors = formState.errors

  const submit = (form: TFormInput) => {
    onConfirm({
      name: form.name,
      oldId: data?.oldId ?? null,
      iconId: selectedIcon?.id || null,
    })
    reset()
  }

  return (
    <form onSubmit={handleSubmit(submit as any)}>
      <Grid container sx={{ mt: 1 }} rowSpacing={2}>
        <Grid size={12}>
          <AppControlledTextField
            required
            name='name'
            control={control}
            errors={errors}
            label={t('name', { ns: 'carMarks' })}
            placeholder={t('name', { ns: 'carMarks' })}
          />
        </Grid>

        <Grid size={12}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box
              sx={{
                width: 140,
                height: 140,
                border: '1px solid #ccc',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f7f7f9',
                position: 'relative',
              }}
            >
              {selectedIcon?.downloadUri && (
                <AppActionButton
                  type='delete'
                  sx={{ position: 'absolute', top: -10, right: -10 }}
                  onClick={() => setSelectedIcon(null)}
                />
              )}

              {selectedIcon?.downloadUri ? (
                <img
                  src={selectedIcon.downloadUri}
                  alt="preview"
                  style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain', display: 'block' }}
                />
              ) : (
                <Typography sx={{ textAlign: 'center', fontSize: '12px', color: 'text.secondary' }}>
                  {t('noIcon', { ns: 'common' })}
                </Typography>
              )}
            </Box>

            <Button variant='contained' color='primary' onClick={() => setOpenIconDialog(true)}>
              {t('modals.searchIcon', { ns: 'common' })}
            </Button>
          </Box>
        </Grid>

        <Grid size={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button color='primary' size='small' onClick={onCancel} variant='outlined'>
              <Typography sx={{ textWrap: 'nowrap', fontSize: '14px', fontWeight: 'bold' }}>
                {t('modals.cancel', { ns: 'common' })}
              </Typography>
            </Button>
            <Button color='primary' type='submit' variant='contained' loading={isPending}>
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
          }}
        />
      </AppDialog>
    </form>
  )
}

export default MarksForm


