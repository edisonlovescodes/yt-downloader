type SearchParams =
  | Record<string, string | string[] | undefined>
  | undefined;

const experienceParamKeys = [
  'experienceId',
  'experience_id',
  'experience',
] as const;

const companyParamKeys = [
  'companyId',
  'company_id',
  'company',
] as const;

const experienceHeaderKeys = [
  'x-whop-experience-id',
  'x-whop-target-experience-id',
  'x-whop-experienceid',
] as const;

const companyHeaderKeys = [
  'x-whop-company-id',
  'x-whop-companyid',
] as const;

function coerceValue(value: string | string[] | undefined | null): string | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

export function getExperienceIdFromRequest(
  headerList: Headers,
  searchParams?: SearchParams
): string | null {
  for (const key of experienceParamKeys) {
    const value = coerceValue(searchParams?.[key]);
    if (value) {
      return value;
    }
  }

  for (const key of experienceHeaderKeys) {
    const value = headerList.get(key);
    if (value) {
      return value;
    }
  }

  return null;
}

export function getCompanyIdFromRequest(
  headerList: Headers,
  searchParams?: SearchParams
): string | null {
  for (const key of companyParamKeys) {
    const value = coerceValue(searchParams?.[key]);
    if (value) return value;
  }

  for (const key of companyHeaderKeys) {
    const value = headerList.get(key);
    if (value) return value;
  }

  return null;
}
