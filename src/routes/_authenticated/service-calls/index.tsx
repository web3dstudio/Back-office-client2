import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Grid,
  Typography,
  Box,
  Divider,
  Select,
  MenuItem,
  FormControl,
  Button,
  Chip,
} from '@mui/material'
import { CheckCircle, Warning, InfoOutlined, HourglassEmpty } from '@mui/icons-material'
import AppLoading from '../../../components/AppLoading'
import StyledPaper from '../../../components/StyledPaper'
import AppBackBtn from '../../../components/AppBackBtn'
import ServiceCallsStats from '../../../components/ServiceCalls/ServiceCallsStats'
import { useServiceCallsInfiniteQuery, useServiceCallsStatsQuery, useServiceCallUpdateStatusMutation } from '../../../query/serviceCalls.query'
import type { TServiceCall, TServiceCallsResponse } from '../../../types'
import { useDateTimeFormat } from '../../../hooks/useDateTimeFormat'

export const Route = createFileRoute('/_authenticated/service-calls/')({
  component: ServiceCallsPage,
})

function ServiceCallsPage() {
  const { t } = useTranslation('serviceCalls')
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const dateTimeFormat = useDateTimeFormat()
  const observerTarget = useRef<HTMLDivElement>(null)

  const {
    data: serviceCallsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useServiceCallsInfiniteQuery({})
  const { data: stats, isLoading: isStatsLoading } = useServiceCallsStatsQuery()
  const { mutate: updateStatus, isPending: isUpdating } = useServiceCallUpdateStatusMutation()

  const serviceCalls = serviceCallsData ? (serviceCallsData as any).pages.flatMap((page: TServiceCallsResponse) => page.data) : []
  const selectedCall = serviceCalls.find((call: TServiceCall) => call.id === selectedCallId)

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries
    if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  useEffect(() => {
    const element = observerTarget.current
    if (!element) return

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    })

    observer.observe(element)

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [handleObserver])

  useEffect(() => {
    if (selectedCall) {
      setSelectedStatus(String(selectedCall.status))
    }
  }, [selectedCall])

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status)
  }

  const handleSave = () => {
    if (selectedCallId && selectedStatus) {
      updateStatus({ id: selectedCallId, status: Number(selectedStatus) })
    }
  }

  if (isLoading) return <AppLoading />

  return (
    <Grid container columnSpacing={3} rowSpacing={3}>
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
          <Typography variant="h5" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
            {t('serviceCalls')}
          </Typography>
        </Box>
      </Grid>

      <Grid size={12}>
        <ServiceCallsStats stats={stats} isLoading={isStatsLoading} />
      </Grid>

      <Grid size={4}>
        <StyledPaper sx={{ p: 0, py: 2, maxHeight: 'calc(100vh - 200px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, overflowY: 'auto' }}>
            {serviceCalls.map((call: TServiceCall, index: number) => (
              <Box key={call.id}>
                <Box
                  onClick={() => setSelectedCallId(call.id)}
                  sx={{
                    p: 3,
                    position: 'relative',
                    cursor: 'pointer',
                    backgroundColor: selectedCallId === call.id ? 'action.selected' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    borderRadius: 1,
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                    }}
                  >
                    {call.status === 2 ? (
                      <CheckCircle sx={{ color: 'success.main', fontSize: 24 }} />
                    ) : call.status === 3 ? (
                      <HourglassEmpty sx={{ color: 'info.main', fontSize: 24 }} />
                    ) : (
                      <Warning sx={{ color: 'warning.main', fontSize: 24 }} />
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5, pr: 3, color: 'primary.main' }}>
                    {call.subject}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.5 }}>
                    {dateTimeFormat(call.date, true)}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                    {call.user ? `${call.user.firstName} ${call.user.lastName} (${call.user.userName})` : ''}
                  </Typography>
                </Box>
                {index < serviceCalls.length - 1 && <Divider />}
              </Box>
            ))}
            <div ref={observerTarget} style={{ height: '20px' }} />
            {isFetchingNextPage && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('loading')}
                </Typography>
              </Box>
            )}
          </Box>
        </StyledPaper>
      </Grid>

      <Grid size={8}>
        {selectedCall ? (
          <StyledPaper sx={{ p: 3, position: 'relative' }}>
            <Chip
              icon={
                selectedCall.status === 2 ? (
                  <CheckCircle />
                ) : selectedCall.status === 3 ? (
                  <HourglassEmpty />
                ) : (
                  <Warning />
                )
              }
              label={
                selectedCall.status === 2
                  ? t('close')
                  : selectedCall.status === 3
                    ? t('inProgress')
                    : t('open')
              }
              color={selectedCall.status === 2 ? 'success' : selectedCall.status === 3 ? 'info' : 'warning'}
              variant="outlined"
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main', pr: 10 }}>
              {selectedCall.subject}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              {dateTimeFormat(selectedCall.date, true)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              {selectedCall.user ? `${selectedCall.user.firstName} ${selectedCall.user.lastName} (${selectedCall.user.userName})` : ''}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography
              variant="body1"
              sx={{ color: 'text.secondary', mb: 2 }}
              dangerouslySetInnerHTML={{ __html: selectedCall.content }}
            />

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-end' }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  value={selectedStatus || String(selectedCall.status)}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <MenuItem value="1">{t('open')}</MenuItem>
                  <MenuItem value="3">{t('inProgress')}</MenuItem>
                  <MenuItem value="2">{t('close')}</MenuItem>
                </Select>
              </FormControl>
              <Button variant="contained" onClick={handleSave} disabled={isUpdating || !selectedStatus}>
                {t('save')}
              </Button>
            </Box>
          </StyledPaper>
        ) : (
          <StyledPaper>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <InfoOutlined sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                {t('selectCall', { ns: 'serviceCalls' }) || 'Select a service call to view details'}
              </Typography>
            </Box>
          </StyledPaper>
        )}
      </Grid>
    </Grid>
  )
}
