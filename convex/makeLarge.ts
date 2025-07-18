export function generateArrayOfArraysWithSize(
  targetSizeBytes: number,
): string[][] {
  if (targetSizeBytes <= 2) return [];

  const result: string[][] = [];
  const baseString = "item";
  const stringWithQuotesAndComma = baseString.length + 3; // "item",
  const arrayOverhead = 2; // []
  const outerArrayOverhead = 2; // []

  let remainingSize = targetSizeBytes - outerArrayOverhead;

  while (remainingSize > arrayOverhead + stringWithQuotesAndComma) {
    const maxItems = Math.min(
      1000,
      Math.floor((remainingSize - arrayOverhead) / stringWithQuotesAndComma),
    );

    if (maxItems <= 0) break;

    const currentArray = Array(maxItems).fill(baseString);
    result.push(currentArray);

    const arraySize = arrayOverhead + maxItems * stringWithQuotesAndComma - 1; // -1 for last comma
    remainingSize -= arraySize + (result.length > 1 ? 1 : 0); // +1 for array separator comma
  }

  return result;
}
