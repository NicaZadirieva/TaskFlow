// GitHub label: color — hex БЕЗ '#'
export type GithubLabel = {
  id?: number;
  name: string;
  color: string;        // hex без '#'
  description?: string | null;
  default?: boolean;
};