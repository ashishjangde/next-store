interface IUser {
    id: string;
    name: string;
    email: string;
    username: string;
    profile_picture?: string;
    roles: string[];
    account_status: "ACTIVE" | "SUSPENDED" | "DEACTIVATED";
    is_verified: boolean;
    created_at: Date;
    updated_at: Date;
}

interface IUpdateProfile {
    name?: string;
    username?: string;
    email?: string;
}

interface IChangePassword {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface IProfilePictureResponse {
    message: string;
    user: IUser;
}

interface IPasswordChangeResponse {
    message: string;
}

interface IAccountDeleteResponse {
    message: string;
}