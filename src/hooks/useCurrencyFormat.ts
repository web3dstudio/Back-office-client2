import { useTranslation } from "react-i18next";

const useCurrencyFormat = () => {
  const { i18n } = useTranslation();

  const formatCurrency = (value: number | undefined): string | undefined => {
    if (value === undefined) return;
    return new Intl.NumberFormat(i18n.language, {
      style: "currency",
      currency: "ILS", // Израильский шекель
      maximumFractionDigits: 0, // Убираем дробную часть
    }).format(value);
  };

  return { formatCurrency };
}

export default useCurrencyFormat