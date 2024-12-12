export type UpdateUserInfoDto = {
  id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  bio?: string;
  location?: string;
}