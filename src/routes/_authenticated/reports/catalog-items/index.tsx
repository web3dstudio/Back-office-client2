import { createFileRoute } from '@tanstack/react-router'
import { Box, Table, TableBody, TableCell, TableHead, TableRow, TableContainer } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useReportsCatalogItemsQuery } from '../../../../query/reportsCatalogItems.query'
import AppLoading from '../../../../components/AppLoading'
import AppError from '../../../../components/AppError'
import StyledPaper from '../../../../components/StyledPaper'

export const Route = createFileRoute('/_authenticated/reports/catalog-items/')({
  component: CatalogItemsPage,
})

function CatalogItemsPage() {
  const { t } = useTranslation()
  const { data: catalogItems, isLoading, error } = useReportsCatalogItemsQuery()

  return (
    <Box>
      <StyledPaper sx={{ mt: 3 }}>
        {isLoading ? (
          <AppLoading />
        ) : error ? (
          <AppError error={error} />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('item', { ns: 'catalogItems' })}</TableCell>
                  <TableCell align="right">{t('count', { ns: 'catalogItems' })}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{t('Cars', { ns: 'catalogItems' })}</TableCell>
                  <TableCell align="right">{catalogItems?.carsCount ?? 0}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('Manufacturers', { ns: 'catalogItems' })}</TableCell>
                  <TableCell align="right">{catalogItems?.manufacturersCount ?? 0}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('Series', { ns: 'catalogItems' })}</TableCell>
                  <TableCell align="right">{catalogItems?.seriesCount ?? 0}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('Models', { ns: 'catalogItems' })}</TableCell>
                  <TableCell align="right">{catalogItems?.modelsCount ?? 0}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </StyledPaper>
    </Box>
  )
}
