export interface IUser {
    _id?: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    age: number;
    course: string;
    course_format: string;
    course_type: string;
    status?: string | null;
    sum?: number | null;
    alreadyPaid?: number | null;
    created_at?: string | Date;
    last_login?: string | Date | null;
    role: string;
    isActive?: boolean;
    isBanned?: boolean;
    actionToken?: string | null;
    actionTokenType?: "activation" | "recovery" | null;
    actionTokenExpiresAt?: string | Date | null;
    password?: string;
}
