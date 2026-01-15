import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useLeadingQuery } from '../query/statistics/reportLeadingQuery.query'
import AppLoading from './AppLoading'

export default function AppLeadingQueries() {
  const { t } = useTranslation()
  const { data: leadingQueries, isLoading, isError } = useLeadingQuery()


  console.log(leadingQueries)

  if (isLoading) {
    return <AppLoading />
  }
  if (isError) {
    return <>Error loading leading queries</>
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {t('topQueriesTitle', { ns: 'reportsStatistics' })}
      </Typography>
      <TableContainer component={Paper} elevation={0} sx={{ width: '100%', boxShadow: 'none' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('leadingQueriesCar', { ns: 'reportsStatistics' })}</TableCell>
              <TableCell align="right">{t('leadingQueriesYear', { ns: 'reportsStatistics' })}</TableCell>
              <TableCell align="right">{t('leadingQueriesCount', { ns: 'reportsStatistics' })}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(leadingQueries ?? []).map((row, index) => (
              <TableRow key={index} hover>
                <TableCell>{row.car}</TableCell>
                <TableCell align="right">{row.manufacturerYear}</TableCell>
                <TableCell align="right">{row.number}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

