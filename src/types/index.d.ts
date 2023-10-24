export {};
import { IUser, UserSchema } from "../models/user";
declare global {
    namespace Express {
        interface Request {
            user: IUser | null;
        }

        export interface Tonics {}
    }
}
