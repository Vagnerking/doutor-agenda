/**
 * Gera iniciais de um nome com máximo de 2 caracteres
 * @param name - Nome completo
 * @returns Iniciais com no máximo 2 caracteres
 */
export function getInitials(name: string): string {
  if (!name || name.trim().length === 0) {
    return "";
  }

  const words = name
    .trim()
    .split(" ")
    .filter((word) => word.length > 0);

  if (words.length === 0) {
    return "";
  }

  if (words.length === 1) {
    // Se há apenas uma palavra, pega os 2 primeiros caracteres
    return words[0].substring(0, 2).toUpperCase();
  }

  // Se há múltiplas palavras, pega a primeira letra da primeira e última palavra
  const firstInitial = words[0][0];
  const lastInitial = words[words.length - 1][0];

  return (firstInitial + lastInitial).toUpperCase();
}
