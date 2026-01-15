import { Box, LinearProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { TReportsStatistics } from '../types'
import { alpha, useTheme } from '@mui/material/styles'
import { useMemo } from 'react'

type Props = {
  dataset: TReportsStatistics
}

export default function AppSessionsSummaryTable({ dataset }: Props) {
  const { t } = useTranslation()
  const theme = useTheme()

  const channels = useMemo(
    () => [
      { key: 'organic' as const, label: t('organic', { ns: 'reportsStatistics' }), color: alpha(theme.palette.primary.main, 0.8), data: dataset.organic },
      { key: 'direct' as const, label: t('direct', { ns: 'reportsStatistics' }), color: alpha(theme.palette.primary.main, 0.5), data: dataset.direct },
      { key: 'reference' as const, label: t('reference', { ns: 'reportsStatistics' }), color: alpha(theme.palette.primary.main, 0.3), data: dataset.reference },
    ],
    [dataset.direct, dataset.organic, dataset.reference, t, theme.palette.primary.main]
  )

  const sessionsSum = useMemo(() => channels.reduce((acc, c) => acc + (c.data?.total ?? 0), 0), [channels])
  const newSessionsSum = useMemo(() => channels.reduce((acc, c) => acc + (c.data?.newSessions ?? 0), 0), [channels])
  const newUsersSum = useMemo(() => channels.reduce((acc, c) => acc + (c.data?.newUsers ?? 0), 0), [channels])
  const abandonmentAvg = useMemo(() => {
    const vals = channels.map(c => c.data?.abandonmentPercent ?? 0)
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
  }, [channels])
  const pagesSum = useMemo(() => channels.reduce((acc, c) => acc + (c.data?.pages ?? 0), 0), [channels])

  function formatHms(totalSeconds: number): string {
    const s = Math.max(0, Math.floor(totalSeconds))
    const hh = Math.floor(s / 3600)
    const mm = Math.floor((s % 3600) / 60)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${pad(hh)}:${pad(mm)}`
  }

  const sessionAvgTime = useMemo(() => {
    const seconds = channels
      .map(channel => channel.data?.averageTime)
      .filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
    if (seconds.length === 0) return '—'
    const averageSeconds = seconds.reduce((accumulator, value) => accumulator + value, 0) / seconds.length
    return formatHms(averageSeconds)
  }, [channels])

  function renderProgressBar(valuePercent: number, barColor: string) {
    const percent = Math.max(0, Math.min(100, valuePercent))
    const isRtl = theme.direction === 'rtl'

    return (
      <Box sx={{ width: '100%', px: 1, py: 1 }}>
        <LinearProgress
          variant="determinate"
          value={percent}
          sx={{
            height: 10,
            borderRadius: 6,
            backgroundColor: alpha(barColor, 0.15),
            transform: isRtl ? 'scaleX(-1)' : undefined,
            '& .MuiLinearProgress-bar': {
              borderRadius: 6,
              backgroundColor: barColor,
            },
          }}
        />
      </Box>
    )
  }

  return (
    <TableContainer component={Paper} elevation={0} sx={{ width: '100%', boxShadow: 'none' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('trafficChannels', { ns: 'reportsStatistics' })}</TableCell>
            <TableCell align="right">{t('sessions', { ns: 'reportsStatistics' })}</TableCell>
            <TableCell align="right">{t('newSessions', { ns: 'reportsStatistics' })}</TableCell>
            <TableCell align="right">{t('newUsers', { ns: 'reportsStatistics' })}</TableCell>
            <TableCell align="right">{t('abandonRate', { ns: 'reportsStatistics' })}</TableCell>
            <TableCell align="right">{t('pagesSessions', { ns: 'reportsStatistics' })}</TableCell>
            <TableCell align="right">{t('sessionAvg', { ns: 'reportsStatistics' })}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Summary row */}
          <TableRow>
            <TableCell />
            <TableCell align="right" sx={{ fontWeight: 700 }}>{sessionsSum}</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>
              {sessionsSum > 0 ? `${((newSessionsSum / sessionsSum) * 100).toFixed(2)}%` : '—'}
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>{newUsersSum}</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>{`${abandonmentAvg.toFixed(2)}%`}</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>{pagesSum.toFixed(2)}</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>{sessionAvgTime}</TableCell>
          </TableRow>

          {/* Channel rows */}
          {channels.map((c) => (
            <TableRow key={c.key}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: c.color,
                      border: '1px solid rgba(0,0,0,0.12)',
                      flex: '0 0 auto',
                    }}
                  />
                  <Typography variant="body2">{c.label}</Typography>
                </Box>
              </TableCell>
              <TableCell align="right">{c.data?.total ?? '—'}</TableCell>
              <TableCell colSpan={2} sx={{ p: 0 }}>
                {typeof c.data?.total === 'number' && sessionsSum > 0
                  ? renderProgressBar((c.data.total / sessionsSum) * 100, c.color)
                  : null}
              </TableCell>
              <TableCell align="right">{typeof c.data?.abandonmentPercent === 'number' ? `${c.data.abandonmentPercent}%` : '—'}</TableCell>
              <TableCell colSpan={2} sx={{ p: 0 }}>
                {typeof c.data?.abandonmentPercent === 'number'
                  ? renderProgressBar(c.data.abandonmentPercent, c.color)
                  : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

