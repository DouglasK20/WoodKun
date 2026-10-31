// O Drizzle embrulha o erro do MySQL num DrizzleQueryError; o código original fica em error.cause
export function isForeignKeyError(error: unknown) {
  const cause = (error as { cause?: { code?: string } } | null)?.cause
  return cause?.code === "ER_ROW_IS_REFERENCED_2"
}
