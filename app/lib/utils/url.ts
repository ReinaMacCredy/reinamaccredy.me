export const getSearchParams = (): URLSearchParams => new URLSearchParams(window.location.search);

export const getSearchParam = (key: string, fallback: string | null = null): string | null => {
  const params = getSearchParams();
  return params.has(key) ? params.get(key) : fallback;
};

export const hasFlag = (key: string): boolean => {
  const params = getSearchParams();
  const value = params.get(key);
  return params.has(key) && (value === '' || value === '1' || value === 'true');
};

