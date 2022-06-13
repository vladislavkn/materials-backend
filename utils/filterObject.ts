const filterObject = <T extends object>(
  source: Record<string, any>,
  falsyValues: any[] = [undefined]
): T =>
  Object.entries(source)
  .reduce<T>((acc, [key, value]) => ({
    ...acc,
    ...((!falsyValues.includes(value)) && {[key]: value})
  }), {} as T);

export default filterObject;