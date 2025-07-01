import { useTranslation } from "react-i18next";


export function useDateTimeFormat() {
  const { t } = useTranslation();

  return function dateTimeFormat(date: string) {
    if (date) {
      const dateObj = { intlDateTime: "{{val, datetime}}" };
      const result = t(dateObj.intlDateTime, {
        val: new Date(date),
        formatParams: {
          val: {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            // hour: "numeric",
            // minute: "numeric",
          },
        },
      });
      return result;
    } else {
      return "";
    }
  };

}