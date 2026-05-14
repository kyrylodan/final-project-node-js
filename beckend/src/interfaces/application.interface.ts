export interface IApplicationComment {
    text: string;
    author: string;
    createdAt: Date;
}

export interface IApplication extends Document {
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
    created_at: Date;
}
