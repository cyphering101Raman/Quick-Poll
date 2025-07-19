import mongoose from "mongoose"
import bcrypt from "bcrypt"

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      index: true
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password required']
    },
    avatar: {
      type: String, // cloudinary url
      required: true,
    },
    role: {
      type: String,
      default: "user",
    }
  }, { timestamps: true });


// 📝 This pre("save") hook runs automatically before saving a document to the database.
UserSchema.pre("save", async function(next){
  if(!this.isModified("password")) return next();

  const hashedPassword = await bcrypt.hash(this.password, 10);
  this.password = hashedPassword;
  next();
})

UserSchema.methods.isPasswordValid = async function(password){
  return await bcrypt.compare(password, this.password)
}

const User = mongoose.model("User", UserSchema)

export default User