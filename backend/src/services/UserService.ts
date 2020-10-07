import { IUser, User, Role } from "../models/User";
import { IFile, File } from "../models/File";

import { requireNonNull } from "../helpers/DataValidation";

import AuthService from "./AuthService";
import FileService from "./FileService";

class UserService {
    
    // verify that a role is in a list
    public static hasRoles(rolesNeeded: Role[], role: Role): boolean {
        return rolesNeeded.includes(role);
    }

    // profile service
    public static async profile(userId: string): Promise<IUser> {
        return requireNonNull(await User.findById(userId).exec());
    }

    // profile update
    public static async updateProfile(user_id: string | undefined, firstname: string | undefined, lastname: string | undefined, email: string | undefined, password: string | undefined): Promise<Record<string, IUser | string>> {
        let user = requireNonNull(await User.findById(user_id).exec());
    
        if(firstname != undefined)
            user.firstname = firstname;
        if(lastname != undefined)
            user.lastname = lastname;
        if(email != undefined)
            user.email = email;
        if(password != undefined)
            user.password = password;

        user = requireNonNull(await user.save());

        const newToken = AuthService.generateJWTToken(user);

        return { "user": user, "newToken": newToken };
    }

    // delete user account service
    public static async delete(_id: string): Promise<IUser> {
        const user: IUser = requireNonNull(await User.findById(_id));
        const user_root: IFile = requireNonNull(await File.findById(user.directory_id));
        requireNonNull(await FileService.deleteDirectory(user_root, true)); // true => force root directory to be deleted
        return requireNonNull(await User.findByIdAndDelete(_id).exec());
    }
}

export default UserService;