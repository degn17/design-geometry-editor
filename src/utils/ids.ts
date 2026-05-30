let nextId = 1;

export function createId(prefix: string): string {
  nextId += 1;
  return `${prefix}-${Date.now().toString(36)}-${nextId.toString(36)}`;
}
