export interface IApplicationComment {
    text: string;
    author: string;
    createdAt: string;
}

export interface IApplication {
    _id?: string;
    id?: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    age: number;
    course: string;
    course_format: string;
    course_type: string;
    manager?: string | null;
    group?: string | null;
    status?: string | null;
    sum?: number | null;
    alreadyPaid?: number | null;
    already_paid?: number | null;
    msg?: string | null;
    message?: string | null;
    messageText?: string | null;
    utm?: string | null;
    utm_source?: string | null;
    utmSource?: string | null;
    comments?: IApplicationComment[];
    created_at: string;
}

export interface IApplicationsResponse {
    data: IApplication[];
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    groups: string[];
}

export interface IApplicationMutationResponse {
    message: string;
    data: IApplication;
}
