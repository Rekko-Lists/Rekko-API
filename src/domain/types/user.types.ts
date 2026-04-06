export type UserUpdateProfile = {
    profileImage?: string;
    bannerImage?: string;
    backgroundImage?: string;
    biography?: string;
};

export type CreateUserInput = {
    email: string;
    password: string;
    username: string;
    profileImage?: string;
    bannerImage?: string;
    backgroundImage?: string;
    biography?: string;
};

export type UserWhereUnique =
    | { userId: number }
    | { username: string }
    | { email: string };
