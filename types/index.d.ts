export {};
import { IUser, UserSchema } from "../src/models/user";
declare global {
    namespace Express {
        interface Request {
            user: IUser | null;
        }

        export interface Tonics {}
    }
}
