import { useTranslation } from 'react-i18next'

export function useMonthYearFormat() {
  const { t } = useTranslation()

  // формат: "месяц год" (например: January 2026 / ינואר 2026)
  return function monthYearFormat(date: string | null | undefined) {
    if (!date) return ''

    const dateObj = { intlDateTime: '{{val, datetime}}' }
    const formatParams: any = {
      year: 'numeric',
      month: 'long',
    }

    return t(dateObj.intlDateTime, {
      val: new Date(date),
      formatParams: {
        val: formatParams,
      },
    })
  }
}


