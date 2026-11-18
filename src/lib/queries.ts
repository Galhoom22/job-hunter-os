import { queryOptions } from "@tanstack/react-query";
import { getConfigFiles, getDashboardData } from "./repo-data.functions";

export const dashboardQuery = queryOptions({ queryKey: ["dashboard"], queryFn: () => getDashboardData() });
export const configQuery = queryOptions({ queryKey: ["config"], queryFn: () => getConfigFiles() });
