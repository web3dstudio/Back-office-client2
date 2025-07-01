import { useTranslation } from "react-i18next";

const usePercentFormat = () => {
  const { i18n } = useTranslation();

  const formatPercent = (value: number | undefined): string | undefined => {
    if (value === undefined) return;

    return new Intl.NumberFormat(i18n.language, {
      style: "percent",
      maximumFractionDigits: 1,
      minimumFractionDigits: 1,
    }).format(value / 100);
  };

  return { formatPercent };
};

export default usePercentFormat;