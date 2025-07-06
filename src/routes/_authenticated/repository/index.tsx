import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useDeleteIconMutation, useIconsQuery, useUploadIconMutation } from '../../../query/icons.query'
import { Box, Grid, Typography, useTheme } from '@mui/material'
import AppBackBtn from '../../../components/AppBackBtn'
import StyledPaper from '../../../components/StyledPaper'
import AppLoading from '../../../components/AppLoading'
import AppError from '../../../components/AppError'
import AppActionButton from '../../../components/AppActionButton'
import { useState } from 'react'
import type { TIcon } from '../../../types'
import AppConfirmDialog from '../../../components/AppDialog/AppConfirmDialog'
import AppFileUploadButton from '../../../components/AppFileUploadButton'

export const Route = createFileRoute('/_authenticated/repository/')({
  component: RepositoryPage
})

function RepositoryPage() {
  const { t } = useTranslation()
  const theme = useTheme()
  const [selected, setSelected] = useState<TIcon | null>(null)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)

  const { data: iconsList, isLoading, isError } = useIconsQuery()
  const { mutate: uploadIcons, isPending: isUploading } = useUploadIconMutation()
  const { mutate: deleteIconMutation, isPending: isDeleting } = useDeleteIconMutation()

  const handleFileUpload = (files: FileList) => {
    if (files.length > 0) {
      uploadIcons(files)
    }
  }

  const handleDeleteIcon = (icon: TIcon) => {
    setSelected(() => icon)
    setOpenConfirmDialog(true)
  }

  const deleteIcon = () => {
    if (selected?.id) {
      deleteIconMutation(selected?.id, {
        onSuccess: () => {
          setSelected(null)
          setOpenConfirmDialog(false)
        }
      })
    }
  }

  if (isLoading) {
    return <AppLoading />
  }

  if (isError) {
    return <AppError />
  }

  return (
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
            {t('title', { ns: 'iconRepository' })}
          </Typography>
        </Box>
        <Box>
          <AppFileUploadButton
            onChange={(files: FileList) => {
              handleFileUpload(files)
            }}
            isPending={isUploading}
            acceptFiles="image/png, image/gif, image/jpeg, image/svg+xml"
          />
        </Box>
      </Grid>
      <StyledPaper
        sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          padding: 3,
          width: '100%',
          display: 'flex',
          gap: 2,
        }}
      >
        <Grid container spacing={3} >
          {iconsList && iconsList?.length === 0 && (
            <Box>
              <Typography textAlign={'center'} variant="body2" sx={{ color: theme.palette.grey[500] }}>
                {t('noIconsFound', { ns: 'iconRepository' })}
              </Typography>
            </Box>
          )}
          {iconsList && iconsList?.length > 0 && iconsList?.map(icon => (
            <Box
              key={icon?.id}
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
              <AppActionButton
                type='delete'
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                }}
                onClick={() => {
                  handleDeleteIcon(icon)
                }} />

              <img
                src={icon?.downloadUri || ''}
                alt="preview"
                style={{
                  maxWidth: '80%',
                  maxHeight: '80%',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />

            </Box>
          ))}
        </Grid>
      </StyledPaper>

      <AppConfirmDialog
        title={t('modals.approveDelete', { ns: 'common' })}
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        onSubmit={() => deleteIcon()}
        isPending={isDeleting}
      />

    </Grid>
  )
}

export default RepositoryPage 