import { createFileRoute } from '@tanstack/react-router'
import { Box, Button, DialogActions, Grid } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { usePriceListLayoutsQuery, usePriceListLayoutsUploadMutation } from '../../../../../query/priceListLayouts.query'
import AppError from '../../../../../components/AppError'
import AppDialog from '../../../../../components/AppDialog/AppDialog'
import { useState } from 'react'
import type { FileWithPath } from 'react-dropzone'
import AppDropzoneFiles from '../../../../../components/AppDropzoneFiles'

export const Route = createFileRoute('/_authenticated/price-list/advertisements/layouts/')({
  component: AdvertisementsLayoutsPage,
})

function AdvertisementsLayoutsPage() {
  const { t } = useTranslation()
  const { data: layouts, isLoading, isError } = usePriceListLayoutsQuery()
  const { mutate: uploadLayouts } = usePriceListLayoutsUploadMutation()
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [files, setFiles] = useState<FileWithPath[]>([])

  if (isLoading) {
    return <></>
  }

  if (isError && !isLoading) {
    return <AppError />
  }

  return (
    <Grid
      container
      spacing={3}
      sx={{
        width: '100%',
      }}
    >
      <Grid
        size={12}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box />
        <Box>
          <Button
            variant="contained"
            onClick={() => {
              setOpenAddDialog(true)
            }}
          >
            {t('modals.add', { ns: 'common' })}
          </Button>
        </Box>
      </Grid>
      <Grid size={12}>

        {void layouts}
      </Grid>

      <AppDialog
        open={openAddDialog}
        onClose={() => {
          setOpenAddDialog(false)
          setFiles([])
        }}
        title={t('modals.add', { ns: 'common' })}
        maxWidth="md"
      >
        <AppDropzoneFiles
          files={files}
          onChange={setFiles}
          maxFiles={5}
          maxFileSize={5 * 1024 * 1024}
          accept={{
            'application/pdf': ['.pdf'],
            'image/*': ['.jpg', '.jpeg', '.tif', '.tiff'],
            'application/postscript': ['.eps'],
          }}
        />
        <DialogActions sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setOpenAddDialog(false)
              setFiles([])
            }}
          >
            {t('modals.cancel', { ns: 'common' })}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              uploadLayouts(
                { files: files as File[] },
                {
                  onSuccess: () => {
                    setOpenAddDialog(false)
                    setFiles([])
                  },
                }
              )
            }}
            disabled={files.length === 0}
          >
            {t('modals.save', { ns: 'common' })}
          </Button>
        </DialogActions>
      </AppDialog>
    </Grid>
  )
}


