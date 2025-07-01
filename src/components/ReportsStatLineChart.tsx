import { LineChart } from '@mui/x-charts/LineChart'
import { useTranslation } from 'react-i18next'
import { useDateTimeFormat } from '../hooks/useDateTimeFormat'
import { Typography } from '@mui/material'

type TItem = {
  date: string
  number: number
}

type ReportsStatLineChartProps = {
  reportsStatitistics: TItem[] | undefined
}

function ReportsStatLineChart({
  reportsStatitistics,
}: ReportsStatLineChartProps) {
  const { t } = useTranslation('reportsStatistics')

  const dateTimeFormat = useDateTimeFormat()

  return (
    <>
      <Typography variant='h6' sx={{ textTransform: 'capitalize' }}>{t('reviewSessions')}</Typography>
      <LineChart
        dataset={reportsStatitistics}
        xAxis={[
          {
            dataKey: 'date',
            label: t('day'),
            labelStyle: {
              transform: 'translateY(10px)',
              fontWeight: 'bold',
            },
            scaleType: 'point',
            valueFormatter: (value: string) => {
              return dateTimeFormat(value)
            },
          },
        ]}
        yAxis={[
          {
            // label: t('sessions'),
            labelStyle: {
              fontWeight: 'bold',
            },
          },
        ]}
        series={[
          { dataKey: 'number', curve: 'linear', area: true, color: '#1875BA' },
        ]}
        grid={{ vertical: true, horizontal: true }}
        height={400}
        sx={{
          '.MuiAreaElement-root': {
            fill: '#1875BA11',
          },
        }}
      />
    </>
  )
}

export default ReportsStatLineChart
