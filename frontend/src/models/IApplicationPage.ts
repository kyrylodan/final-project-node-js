export interface IApplicationEditForm {
    name: string;
    surname: string;
    email: string;
    phone: string;
    age: string;
    course: string;
    course_format: string;
    course_type: string;
    status: string;
    sum: string;
    alreadyPaid: string;
    group: string;
}

export type ApplicationsSortField =
    | "id"
    | "name"
    | "surname"
    | "email"
    | "phone"
    | "age"
    | "course"
    | "course_format"
    | "course_type"
    | "status"
    | "sum"
    | "alreadyPaid"
    | "group"
    | "created_at"
    | "manager";

export type ApplicationsSortOrder = "asc" | "desc";

export interface IApplicationsFilters {
    name: string;
    surname: string;
    email: string;
    phone: string;
    age: string;
    course: string;
    course_format: string;
    course_type: string;
    status: string;
    group: string;
    startDate: string;
    endDate: string;
    my: boolean;
    sortBy: ApplicationsSortField;
    sortOrder: ApplicationsSortOrder;
}

export type ApplicationsTextFilterField = "name" | "surname" | "email" | "phone" | "age";

export type ApplicationsTextFilters = Pick<
    IApplicationsFilters,
    ApplicationsTextFilterField
>;

export interface IApplicationFormErrors {
    name?: string;
    surname?: string;
    email?: string;
    phone?: string;
    age?: string;
    course?: string;
    course_format?: string;
    course_type?: string;
    status?: string;
    sum?: string;
    alreadyPaid?: string;
    group?: string;
    newGroup?: string;
}

export type ApplicationPaginationItem = number | "dots-left" | "dots-right";
