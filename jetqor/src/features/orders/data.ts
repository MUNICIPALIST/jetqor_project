// Define the order status steps with their icons and labels
export const statusSteps = [
  {
    key: "packaging",
    label: "Упаковка",
    icon: "i-jq-category-filled",
    iconColor: "text-orange-500",
    completedLabel: "В упаковке",
  },
  {
    key: "assembly",
    label: "На сборке",
    icon: "i-jq-category-filled",
    iconColor: "text-yellow-500",
    completedLabel: "Собран",
  },
  {
    key: "packed",
    label: "Готов к отправке",
    icon: "i-jq-card-box-filled",
    iconColor: "text-blue-500",
    completedLabel: "Готов к отправке",
  },
  {
    key: "completed",
    label: "Завершен",
    icon: "i-jq-tick",
    iconColor: "text-green-500",
    completedLabel: "Завершено",
  },
  {
    key: "cancelled",
    label: "Отменен",
    icon: "i-jq-close",
    iconColor: "text-red-500",
    completedLabel: "Отменен",
  },
  {
    key: "return_request",
    label: "Запрошен возврат",
    icon: "i-jq-paper-fail",
    iconColor: "text-brown-500",
    completedLabel: "Запрошен возврат",
  },
  {
    key: "return",
    label: "Возврат",
    icon: "i-jq-paper-fail",
    iconColor: "text-gray-500",
    completedLabel: "Возвращен",
  },
];
