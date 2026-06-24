export function formatMoney(value: number | string) {
  const number = typeof value === "number" ? value : Number(value);
  if (isNaN(number)) return "0,00";

  return number.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDateInput(date: Date | string | undefined) {
  if (!date) return "";

  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

export function formatCPF(value: string) {
  value = value.replace(/\D/g, "");

  if (value.length > 11) value = value.slice(0, 11);

  return value
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}