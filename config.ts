import { config as movieConfig } from "./movies/sonic1/config";

export type Config = {
  title: string;
  url: string;
  folder: string;
  startTimeFilter: string;
  endTimeFilter: string;
};

export const config: Config = movieConfig;
