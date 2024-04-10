export const rawPathRegexp = /^(.+?(?:(?:\.([a-z0-9]+))?))$/;

export function rawPathToToken(rawPath: string) {
  const [filepath = '', extension = ''] = (rawPathRegexp.exec(rawPath) || []).slice(1);

  return { filepath, extension };
}
