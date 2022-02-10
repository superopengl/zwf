export function varNameToLabelName(underSnake) {
  return underSnake ? underSnake.replace(/_/g, ' ').trim() : underSnake;
}

