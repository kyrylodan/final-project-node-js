export interface IManagerAdminItem {
    _id: string;
    email: string;
    name: string;
    surname: string;
    role: string;
    created_at?: string;
    last_login?: string | null;
    isActive: boolean;
    isBanned: boolean;
    applicationsTotal: number;
    applicationsInWork: number;
}

export interface IManagersResponse {
    data: IManagerAdminItem[];
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
}

export interface IManagerMutationResponse {
    message: string;
    data: IManagerAdminItem;
}

export interface IManagerActionLinkResponse {
    message: string;
    link: string;
    expiresAt: string;
}

export interface IManagerActionInfoResponse {
    email: string;
    name: string;
    surname: string;
    action: "activation" | "recovery";
}
