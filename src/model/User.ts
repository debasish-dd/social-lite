import mongoose, { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
    email: string;
    password: string;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
    _id?: mongoose.Types.ObjectId;
}

const userSchema = new Schema<IUser>(
    {
        email: {
            required: true,
            unique: true,
            type: String,
        },
        password: {
            type: String,
            required: true,
            select: false
        },
        name: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true
    }
)


userSchema.pre("save" , async function(){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
    }
})


const User = models?.User || model("User", userSchema);

export default User