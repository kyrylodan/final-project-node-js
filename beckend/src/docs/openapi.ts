export const openApiDocument = {
    openapi: "3.0.3",
    info: {
        title: "CRM Programming School API",
        version: "1.0.0",
        description:
            "API for authentication, applications management, manager administration, activation and password recovery flows.",
    },
    servers: [
        {
            url: "http://localhost:3000/api",
            description: "Local development server",
        },
    ],
    tags: [
        { name: "Auth", description: "Authentication and manager action flows" },
        { name: "Applications", description: "Applications listing, export, comments, and editing" },
        { name: "Admin", description: "Admin statistics and manager management" },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
        schemas: {
            ErrorResponse: {
                type: "object",
                properties: {
                    message: { type: "string", example: "Invalid token" },
                },
                required: ["message"],
            },
            TokenPair: {
                type: "object",
                properties: {
                    accessToken: { type: "string" },
                    refreshToken: { type: "string" },
                },
                required: ["accessToken", "refreshToken"],
            },
            User: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    name: { type: "string" },
                    surname: { type: "string" },
                    email: { type: "string", format: "email" },
                    phone: { type: "string" },
                    age: { type: "number" },
                    course: { type: "string" },
                    course_format: { type: "string" },
                    course_type: { type: "string" },
                    role: { type: "string", enum: ["admin", "manager"] },
                    isActive: { type: "boolean" },
                    isBanned: { type: "boolean" },
                    created_at: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                    },
                    last_login: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                    },
                },
                required: ["name", "surname", "email", "role"],
            },
            Comment: {
                type: "object",
                properties: {
                    text: { type: "string" },
                    author: { type: "string" },
                    createdAt: { type: "string", format: "date-time" },
                },
                required: ["text", "author", "createdAt"],
            },
            Application: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    id: { type: "string", nullable: true },
                    name: { type: "string" },
                    surname: { type: "string" },
                    email: { type: "string", format: "email" },
                    phone: { type: "string" },
                    age: { type: "number" },
                    course: { type: "string" },
                    course_format: { type: "string" },
                    course_type: { type: "string" },
                    manager: { type: "string", nullable: true },
                    group: { type: "string", nullable: true },
                    status: { type: "string", nullable: true },
                    sum: { type: "number", nullable: true },
                    alreadyPaid: { type: "number", nullable: true },
                    already_paid: { type: "number", nullable: true },
                    msg: { type: "string", nullable: true },
                    utm: { type: "string", nullable: true },
                    comments: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Comment" },
                    },
                    created_at: { type: "string", format: "date-time" },
                },
                required: [
                    "name",
                    "surname",
                    "email",
                    "phone",
                    "age",
                    "course",
                    "course_format",
                    "course_type",
                    "created_at",
                ],
            },
            ApplicationsResponse: {
                type: "object",
                properties: {
                    data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Application" },
                    },
                    page: { type: "integer", example: 1 },
                    limit: { type: "integer", example: 25 },
                    totalItems: { type: "integer", example: 100 },
                    totalPages: { type: "integer", example: 4 },
                    sortBy: { type: "string", example: "created_at" },
                    sortOrder: { type: "string", enum: ["asc", "desc"], example: "desc" },
                    groups: {
                        type: "array",
                        items: { type: "string" },
                    },
                },
                required: [
                    "data",
                    "page",
                    "limit",
                    "totalItems",
                    "totalPages",
                    "sortBy",
                    "sortOrder",
                    "groups",
                ],
            },
            SignInRequest: {
                type: "object",
                properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string", format: "password" },
                },
                required: ["email", "password"],
            },
            SignInResponse: {
                type: "object",
                properties: {
                    user: { $ref: "#/components/schemas/User" },
                    token: { $ref: "#/components/schemas/TokenPair" },
                },
                required: ["user", "token"],
            },
            AddCommentRequest: {
                type: "object",
                properties: {
                    comment: { type: "string" },
                },
                required: ["comment"],
            },
            UpdateApplicationRequest: {
                type: "object",
                properties: {
                    name: { type: "string", nullable: true },
                    surname: { type: "string", nullable: true },
                    email: { type: "string", format: "email", nullable: true },
                    phone: { type: "string", nullable: true },
                    age: { type: "string", nullable: true },
                    course: { type: "string", nullable: true },
                    course_format: { type: "string", nullable: true },
                    course_type: { type: "string", nullable: true },
                    status: { type: "string", nullable: true },
                    sum: { type: "string", nullable: true },
                    alreadyPaid: { type: "string", nullable: true },
                    group: { type: "string", nullable: true },
                },
            },
            ApplicationMutationResponse: {
                type: "object",
                properties: {
                    message: { type: "string" },
                    data: { $ref: "#/components/schemas/Application" },
                },
                required: ["message", "data"],
            },
            Manager: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    email: { type: "string", format: "email" },
                    name: { type: "string" },
                    surname: { type: "string" },
                    role: { type: "string", enum: ["manager"] },
                    created_at: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                    },
                    last_login: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                    },
                    isActive: { type: "boolean" },
                    isBanned: { type: "boolean" },
                    applicationsTotal: { type: "integer" },
                    applicationsInWork: { type: "integer" },
                },
                required: [
                    "_id",
                    "email",
                    "name",
                    "surname",
                    "role",
                    "isActive",
                    "isBanned",
                    "applicationsTotal",
                    "applicationsInWork",
                ],
            },
            ManagersResponse: {
                type: "object",
                properties: {
                    data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Manager" },
                    },
                    page: { type: "integer" },
                    limit: { type: "integer" },
                    totalItems: { type: "integer" },
                    totalPages: { type: "integer" },
                },
                required: ["data", "page", "limit", "totalItems", "totalPages"],
            },
            ManagerCreateRequest: {
                type: "object",
                properties: {
                    email: { type: "string", format: "email" },
                    name: { type: "string" },
                    surname: { type: "string" },
                },
                required: ["email", "name", "surname"],
            },
            ManagerMutationResponse: {
                type: "object",
                properties: {
                    message: { type: "string" },
                    data: { $ref: "#/components/schemas/Manager" },
                },
                required: ["message", "data"],
            },
            StatisticsResponse: {
                type: "object",
                properties: {
                    total: { type: "integer" },
                    statuses: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                status: { type: "string" },
                                count: { type: "integer" },
                            },
                            required: ["status", "count"],
                        },
                    },
                },
                required: ["total", "statuses"],
            },
            ActionLinkResponse: {
                type: "object",
                properties: {
                    message: { type: "string" },
                    link: { type: "string" },
                    expiresAt: { type: "string", format: "date-time" },
                },
                required: ["message", "link", "expiresAt"],
            },
            ManagerActionInfo: {
                type: "object",
                properties: {
                    email: { type: "string", format: "email" },
                    name: { type: "string" },
                    surname: { type: "string" },
                    action: {
                        type: "string",
                        enum: ["activation", "recovery"],
                    },
                },
                required: ["email", "name", "surname", "action"],
            },
            ManagerActionCompleteRequest: {
                type: "object",
                properties: {
                    password: { type: "string", format: "password" },
                },
                required: ["password"],
            },
            MessageResponse: {
                type: "object",
                properties: {
                    message: { type: "string" },
                },
                required: ["message"],
            },
            BanRequest: {
                type: "object",
                properties: {
                    isBanned: { type: "boolean" },
                },
                required: ["isBanned"],
            },
        },
    },
    paths: {
        "/auth/sign-in": {
            post: {
                tags: ["Auth"],
                summary: "Sign in as admin or manager",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/SignInRequest" },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Signed in successfully",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/SignInResponse" },
                            },
                        },
                    },
                    "401": {
                        description: "Invalid credentials",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                            },
                        },
                    },
                },
            },
        },
        "/auth/activate/{token}": {
            get: {
                tags: ["Auth"],
                summary: "Get manager action info by token",
                parameters: [
                    {
                        in: "path",
                        name: "token",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    "200": {
                        description: "Token is valid",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ManagerActionInfo" },
                            },
                        },
                    },
                    "400": {
                        description: "Invalid action link",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ["Auth"],
                summary: "Complete activation or password recovery",
                parameters: [
                    {
                        in: "path",
                        name: "token",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ManagerActionCompleteRequest",
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Password saved",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/MessageResponse" },
                            },
                        },
                    },
                    "400": {
                        description: "Invalid or expired action link",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                            },
                        },
                    },
                },
            },
        },
        "/applications": {
            get: {
                tags: ["Applications"],
                summary: "Get paginated applications with filters and sorting",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { in: "query", name: "page", schema: { type: "integer", example: 1 } },
                    { in: "query", name: "limit", schema: { type: "integer", example: 25 } },
                    { in: "query", name: "name", schema: { type: "string" } },
                    { in: "query", name: "surname", schema: { type: "string" } },
                    { in: "query", name: "email", schema: { type: "string" } },
                    { in: "query", name: "phone", schema: { type: "string" } },
                    { in: "query", name: "age", schema: { type: "string" } },
                    { in: "query", name: "course", schema: { type: "string" } },
                    { in: "query", name: "course_format", schema: { type: "string" } },
                    { in: "query", name: "course_type", schema: { type: "string" } },
                    { in: "query", name: "status", schema: { type: "string" } },
                    { in: "query", name: "group", schema: { type: "string" } },
                    { in: "query", name: "my", schema: { type: "boolean" } },
                    { in: "query", name: "startDate", schema: { type: "string", format: "date" } },
                    { in: "query", name: "endDate", schema: { type: "string", format: "date" } },
                    {
                        in: "query",
                        name: "sortBy",
                        schema: {
                            type: "string",
                            enum: [
                                "id",
                                "name",
                                "surname",
                                "email",
                                "phone",
                                "age",
                                "course",
                                "course_format",
                                "course_type",
                                "status",
                                "sum",
                                "alreadyPaid",
                                "group",
                                "created_at",
                                "manager",
                            ],
                        },
                    },
                    {
                        in: "query",
                        name: "sortOrder",
                        schema: { type: "string", enum: ["asc", "desc"] },
                    },
                ],
                responses: {
                    "200": {
                        description: "Applications page",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ApplicationsResponse" },
                            },
                        },
                    },
                    "401": {
                        description: "Unauthorized",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                            },
                        },
                    },
                },
            },
        },
        "/applications/export": {
            get: {
                tags: ["Applications"],
                summary: "Export filtered applications to XLSX",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { in: "query", name: "name", schema: { type: "string" } },
                    { in: "query", name: "surname", schema: { type: "string" } },
                    { in: "query", name: "email", schema: { type: "string" } },
                    { in: "query", name: "phone", schema: { type: "string" } },
                    { in: "query", name: "age", schema: { type: "string" } },
                    { in: "query", name: "course", schema: { type: "string" } },
                    { in: "query", name: "course_format", schema: { type: "string" } },
                    { in: "query", name: "course_type", schema: { type: "string" } },
                    { in: "query", name: "status", schema: { type: "string" } },
                    { in: "query", name: "group", schema: { type: "string" } },
                    { in: "query", name: "my", schema: { type: "boolean" } },
                    { in: "query", name: "startDate", schema: { type: "string", format: "date" } },
                    { in: "query", name: "endDate", schema: { type: "string", format: "date" } },
                    {
                        in: "query",
                        name: "sortBy",
                        schema: { type: "string" },
                    },
                    {
                        in: "query",
                        name: "sortOrder",
                        schema: { type: "string", enum: ["asc", "desc"] },
                    },
                ],
                responses: {
                    "200": {
                        description: "XLSX file generated",
                        content: {
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
                                schema: {
                                    type: "string",
                                    format: "binary",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/applications/{id}": {
            patch: {
                tags: ["Applications"],
                summary: "Update editable application fields",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UpdateApplicationRequest",
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Application updated",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApplicationMutationResponse",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/applications/{id}/comment": {
            patch: {
                tags: ["Applications"],
                summary: "Add comment to an application",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/AddCommentRequest",
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Comment added",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApplicationMutationResponse",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/admin/stats": {
            get: {
                tags: ["Admin"],
                summary: "Get application statistics by status",
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": {
                        description: "Statistics loaded",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/StatisticsResponse" },
                            },
                        },
                    },
                },
            },
        },
        "/admin/managers": {
            get: {
                tags: ["Admin"],
                summary: "Get paginated managers",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { in: "query", name: "page", schema: { type: "integer", example: 1 } },
                    { in: "query", name: "limit", schema: { type: "integer", example: 4 } },
                ],
                responses: {
                    "200": {
                        description: "Managers page",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ManagersResponse" },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ["Admin"],
                summary: "Create a manager",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/ManagerCreateRequest" },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "Manager created",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ManagerMutationResponse" },
                            },
                        },
                    },
                },
            },
        },
        "/admin/managers/{id}/activate-link": {
            post: {
                tags: ["Admin"],
                summary: "Generate manager activation link",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    "200": {
                        description: "Activation link generated",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ActionLinkResponse" },
                            },
                        },
                    },
                },
            },
        },
        "/admin/managers/{id}/recovery-link": {
            post: {
                tags: ["Admin"],
                summary: "Generate password recovery link",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    "200": {
                        description: "Recovery link generated",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ActionLinkResponse" },
                            },
                        },
                    },
                },
            },
        },
        "/admin/managers/{id}/ban": {
            patch: {
                tags: ["Admin"],
                summary: "Ban or unban manager",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        in: "path",
                        name: "id",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/BanRequest" },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Manager status updated",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ManagerMutationResponse" },
                            },
                        },
                    },
                },
            },
        },
    },
} as const;
