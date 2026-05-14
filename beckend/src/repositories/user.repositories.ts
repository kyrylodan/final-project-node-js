import { IUser } from "../interfaces/user.interface";
import User from "../models/user.model";

class UserRepository {
    public async getByEmail(email: string): Promise<IUser | null> {
        return User.findOne({ email });
    }

    public async getById(id: string): Promise<IUser | null> {
        return User.findById(id);
    }

    public async create(dto: Partial<IUser>): Promise<IUser> {
        return User.create(dto);
    }

    public async updateById(id: string, dto: Partial<IUser>): Promise<IUser | null> {
        return User.findByIdAndUpdate(id, { $set: dto }, { new: true });
    }
}

export const userRepository = new UserRepository();
