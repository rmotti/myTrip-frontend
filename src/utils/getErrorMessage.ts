export function getErrorMessage(err: unknown, fallback = 'Algo deu errado'): string {
  if (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string') {
    return (err as any).message as string
  }
  return fallback
}

