export type UserUpdateProfile = {
    profileImage?: string;
    bannerImage?: string;
    backgroundImage?: string;
};

export type CreateUserInput = {
    email: string;
    password: string;
    username: string;
    profileImage?: string;
    bannerImage?: string;
    backgroundImage?: string;
};
