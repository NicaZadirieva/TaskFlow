export type GithubLabel = {
  id: number;
  name: string;
  color?: string;        // TODO: не получаю от бэкенда
  description?: string | null;
};

export const GithubLabelDefaultColor = "grey";