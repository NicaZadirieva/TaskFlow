export type GithubLabel = {
  id: number;
  name: string;
};


export type GithubLabelCanBeWithoutId = Omit<GithubLabel, 'id'>;

export const GithubLabelDefaultColor = "grey";