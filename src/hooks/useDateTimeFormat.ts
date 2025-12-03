import { useTranslation } from "react-i18next";


export function useDateTimeFormat() {
  const { t } = useTranslation();

  return function dateTimeFormat(date: string, includeTime: boolean = false) {
    if (date) {
      const dateObj = { intlDateTime: "{{val, datetime}}" };
      const formatParams: any = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      };

      if (includeTime) {
        formatParams.hour = "numeric";
        formatParams.minute = "numeric";
      }

      const result = t(dateObj.intlDateTime, {
        val: new Date(date),
        formatParams: {
          val: formatParams,
        },
      });
      return result;
    } else {
      return "";
    }
  };

}