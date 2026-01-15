import { LineChart } from '@mui/x-charts/LineChart'
import { useTranslation } from 'react-i18next'
import { useDateTimeFormat } from '../hooks/useDateTimeFormat'
import { Typography } from '@mui/material'
import type { TReportDailyVisits } from '../types'

type Props = {
  dataset: TReportDailyVisits[]
  title: string
}

function ReportsStatLineChart({ dataset, title }: Props) {
  const { t } = useTranslation()

  const dateTimeFormat = useDateTimeFormat()

  return (
    <>
      <Typography variant='h6'>{title}</Typography>
      <LineChart
        dataset={dataset}
        xAxis={[
          {
            dataKey: 'date',
            label: t('day', { ns: 'reportsStatistics' }),
            labelStyle: {
              transform: 'translateY(10px)',
              fontWeight: 'bold',
            },
            scaleType: 'point',
            valueFormatter: (value: string) => {
              return dateTimeFormat(value, false, '2-digit')
            },
          },
        ]}
        yAxis={[
          {
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
