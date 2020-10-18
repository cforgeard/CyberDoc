//from swagger file users.yml

import { FileTag } from './files-api-models';

export class User {
    public _id: string;
    public firstname: string;
    public lastname: string;
    public email: string;
    public phoneNumber: string;
    public twoFactorApp: boolean;
    public twoFactorSms: boolean;
    public twoFactorEmail: boolean;
    public updated_at: string;
    public created_at: string;
    public role: string;
    public directory_id: string;
    public tags: FileTag[];
}
