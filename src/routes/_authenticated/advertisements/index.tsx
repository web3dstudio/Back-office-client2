import { createFileRoute } from '@tanstack/react-router'
import { Grid, Box, Typography, Select, MenuItem, FormControl, Link } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import StyledPaper from '../../../components/StyledPaper'
import AppBackBtn from '../../../components/AppBackBtn'
import AppDialog from '../../../components/AppDialog/AppDialog'
import AdvertisementForm from '../../../components/Advertisement/AdvertisementForm'
import AppActionButton from '../../../components/AppActionButton'
import { useState, useMemo } from 'react'
import type { TAdvertisement } from '../../../types'
import { useAdvertisementAddMutation, useAdvertisementUpdateMutation, useAdvertisementDeleteMutation, useAdvertisementsQuery } from '../../../query/advertisements.query'
import AppConfirmDialog from '../../../components/AppDialog/AppConfirmDialog'

export const Route = createFileRoute('/_authenticated/advertisements/')({
  component: AdvertisementsPage,
})

function AdvertisementsPage() {
  const { t } = useTranslation('advertisements')
  const [selectedPage, setSelectedPage] = useState<string>('1')
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedAd, setSelectedAd] = useState<{ ad: TAdvertisement | null; pageType: number; dock: number } | null>(null)

  const pageType = parseInt(selectedPage)
  const { data: allAdvertisements = [] } = useAdvertisementsQuery()
  const addMutation = useAdvertisementAddMutation()
  const updateMutation = useAdvertisementUpdateMutation()
  const deleteMutation = useAdvertisementDeleteMutation()
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [adToDelete, setAdToDelete] = useState<{ id: string; pageType: number; dock: number } | null>(null)

  const pageOptions = [
    { value: '1', label: t('1') },
    { value: '2', label: t('2') },
    { value: '3', label: t('3') },
    { value: '4', label: t('4') },
    { value: '5', label: t('5') },
  ]

  const currentAdvertisements = useMemo(() => {
    return allAdvertisements.filter((ad) => ad.pageType === pageType)
  }, [allAdvertisements, pageType])

  const getAdvertisementByDock = (dock: number): TAdvertisement | undefined => {
    return currentAdvertisements.find((ad) => ad.dock === dock)
  }

  const topAd = getAdvertisementByDock(1) // placement1 - Advertisement at the top
  const bottomAd = getAdvertisementByDock(2) // placement2 - Advertisement at the bottom
  const sideAd = getAdvertisementByDock(3) // placement3 - Side ad

  const StyledImage = styled('img')({
    maxWidth: '100%',
    maxHeight: '150px',
    objectFit: 'contain',
    borderRadius: '8px',
  })


  return (
    <Grid container spacing={3}>
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
            {t('title')}
          </Typography>
        </Box>
      </Grid>

      <Grid size={12}>
        <FormControl size="small" sx={{ width: '300px' }}>
          <Select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
              },
            }}
          >
            {pageOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid size={12}>
        <Grid container spacing={3}>
          <Grid size={12}>
            <StyledPaper
              sx={{
                minHeight: '200px',
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
                {t('placement1')}
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={12}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={5}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {t('content')}
                      </Typography>
                    </Grid>
                    <Grid size={3}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {t('link')}
                      </Typography>
                    </Grid>
                    <Grid size={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {t('operations')}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid size={12}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={5}>
                      {topAd?.imageDownloadUri ? (
                        <StyledImage src={topAd.imageDownloadUri} alt="Advertisement" />
                      ) : (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {topAd?.script || '-'}
                        </Typography>
                      )}
                    </Grid>
                    <Grid size={3}>
                      {topAd?.link ? (
                        <Link href={topAd.link} target="_blank" rel="noopener noreferrer" variant="body2">
                          {topAd.link}
                        </Link>
                      ) : (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          -
                        </Typography>
                      )}
                    </Grid>
                    <Grid size={4} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <AppActionButton
                        type={topAd ? 'edit' : 'add'}
                        onClick={() => {
                          setSelectedAd({ ad: topAd || null, pageType: parseInt(selectedPage), dock: 1 })
                          setOpenDialog(true)
                        }}
                      />
                      <AppActionButton
                        type="delete"
                        disabled={!topAd}
                        onClick={() => {
                          if (topAd) {
                            setAdToDelete({ id: topAd.id, pageType: parseInt(selectedPage), dock: 1 })
                            setOpenConfirmDialog(true)
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </StyledPaper>
          </Grid>
          <Grid size={12}>
            <StyledPaper
              sx={{
                minHeight: '200px',
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
                {t('placement3')}
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={12}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={5}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {t('content')}
                      </Typography>
                    </Grid>
                    <Grid size={3}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {t('link')}
                      </Typography>
                    </Grid>
                    <Grid size={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {t('operations')}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid size={12}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={5}>
                      {sideAd?.imageDownloadUri ? (
                        <StyledImage src={sideAd.imageDownloadUri} alt="Advertisement" />
                      ) : (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {sideAd?.script || '-'}
                        </Typography>
                      )}
                    </Grid>
                    <Grid size={3}>
                      {sideAd?.link ? (
                        <Link href={sideAd.link} target="_blank" rel="noopener noreferrer" variant="body2">
                          {sideAd.link}
                        </Link>
                      ) : (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          -
                        </Typography>
                      )}
                    </Grid>
                    <Grid size={4} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <AppActionButton
                        type={sideAd ? 'edit' : 'add'}
                        onClick={() => {
                          setSelectedAd({ ad: sideAd || null, pageType: parseInt(selectedPage), dock: 3 })
                          setOpenDialog(true)
                        }}
                      />
                      <AppActionButton
                        type="delete"
                        disabled={!sideAd}
                        onClick={() => {
                          if (sideAd) {
                            setAdToDelete({ id: sideAd.id, pageType: parseInt(selectedPage), dock: 3 })
                            setOpenConfirmDialog(true)
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </StyledPaper>
          </Grid>
          <Grid size={12}>
            <StyledPaper
              sx={{
                minHeight: '200px',
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
                {t('placement2')}
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={12}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={5}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {t('content')}
                      </Typography>
                    </Grid>
                    <Grid size={3}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {t('link')}
                      </Typography>
                    </Grid>
                    <Grid size={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {t('operations')}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid size={12}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={5}>
                      {bottomAd?.imageDownloadUri ? (
                        <StyledImage src={bottomAd.imageDownloadUri} alt="Advertisement" />
                      ) : (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {bottomAd?.script || '-'}
                        </Typography>
                      )}
                    </Grid>
                    <Grid size={3}>
                      {bottomAd?.link ? (
                        <Link href={bottomAd.link} target="_blank" rel="noopener noreferrer" variant="body2">
                          {bottomAd.link}
                        </Link>
                      ) : (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          -
                        </Typography>
                      )}
                    </Grid>
                    <Grid size={4} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <AppActionButton
                        type={bottomAd ? 'edit' : 'add'}
                        onClick={() => {
                          setSelectedAd({ ad: bottomAd || null, pageType: parseInt(selectedPage), dock: 2 })
                          setOpenDialog(true)
                        }}
                      />
                      <AppActionButton
                        type="delete"
                        disabled={!bottomAd}
                        onClick={() => {
                          if (bottomAd) {
                            setAdToDelete({ id: bottomAd.id, pageType: parseInt(selectedPage), dock: 2 })
                            setOpenConfirmDialog(true)
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </StyledPaper>
          </Grid>
        </Grid>
      </Grid>

      <AppDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false)
          setSelectedAd(null)
        }}
        title={selectedAd?.ad ? t('modals.edit', { ns: 'common' }) : t('modals.add', { ns: 'common' })}
        maxWidth="sm"
      >
        <AdvertisementForm
          data={selectedAd?.ad || null}
          pageType={selectedAd?.pageType || parseInt(selectedPage)}
          dock={selectedAd?.dock || 1}
          isPending={addMutation.isPending || updateMutation.isPending}
          onCancel={() => {
            setOpenDialog(false)
            setSelectedAd(null)
          }}
          onConfirm={(formData) => {
            if (formData.id) {
              // Обновление
              updateMutation.mutate(
                {
                  id: formData.id,
                  pageType: formData.pageType,
                  dock: formData.dock,
                  link: formData.link,
                  script: formData.script,
                  file: formData.file || null,
                },
                {
                  onSuccess: () => {
                    setOpenDialog(false)
                    setSelectedAd(null)
                  },
                }
              )
            } else {
              // Создание
              addMutation.mutate(
                {
                  pageType: formData.pageType,
                  dock: formData.dock,
                  link: formData.link,
                  script: formData.script,
                  file: formData.file || null,
                },
                {
                  onSuccess: () => {
                    setOpenDialog(false)
                    setSelectedAd(null)
                  },
                }
              )
            }
          }}
        />
      </AppDialog>

      <AppConfirmDialog
        open={openConfirmDialog}
        onClose={() => {
          setOpenConfirmDialog(false)
          setAdToDelete(null)
        }}
        onSubmit={() => {
          if (adToDelete) {
            deleteMutation.mutate(adToDelete.id, {
              onSuccess: () => {
                setOpenConfirmDialog(false)
                setAdToDelete(null)
              },
            })
          }
        }}
        title={t('modals.approveDelete', { ns: 'common' })}
        isPending={deleteMutation.isPending}
      />
    </Grid>
  )
}
