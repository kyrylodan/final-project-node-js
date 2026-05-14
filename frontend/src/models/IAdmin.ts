export interface IAdminStatusStatistic {
    status: string;
    count: number;
}

export interface IAdminStatisticsResponse {
    total: number;
    statuses: IAdminStatusStatistic[];
}
