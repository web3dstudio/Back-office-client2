import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Typography, Grid } from '@mui/material'
import { useTranslation } from 'react-i18next'
import AppBackBtn from '../../components/AppBackBtn'
import ReportsTabs from '../../components/ReportsTabs'

export const Route = createFileRoute('/_authenticated/reports')({
    component: ReportsLayout
})

function ReportsLayout() {
    const { t } = useTranslation('reports')

    return (
        <Grid container spacing={3}>
            <Grid size={12}>
                <AppBackBtn children={t('back', { ns: 'common' })} />
            </Grid>
            <Grid size={12}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                    {t('title')}
                </Typography>
            </Grid>
            <Grid size={12}>
                <ReportsTabs />
            </Grid>
            <Grid size={12}>
                <Outlet />
            </Grid>
        </Grid>
    )
}
