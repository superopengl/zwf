export function labelNameToVarName(spaceSnake) {
  return spaceSnake ? spaceSnake.trim().replace(/ +/g, '_') : spaceSnake;
}
