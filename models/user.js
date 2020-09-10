const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
mongoose.set("debug", true);
const bcrypt = require("bcrypt");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", userSchema, "users");

userSchema.statics.addUser = async function (email, password, name) {
  let password_hash = await hashMessage(password);
  let user = new User({
    email: email,
    password: password_hash,
    name: name,
    verified: false,
  });

  //TODO Switch from fixed email & and prod/test variables to switch text within email
  let res = await user
    .save(function (err, user) {
      if (!err) {
        const msg = {
          to: email,
          from: "test@test.com",
          subject: "Please Verify Your Hatch Account",
          text: `Please use this link to verify your account http://localhost:9000/signup/verify/${user._id}`,
          html: `<p> Please use this link to verify your account <br/> <b>http://localhost:9000/signup/verify/${user._id}</b> </p>`,
        };
        sgMail.send(msg);
      }
    })
    .catch((err) => err);

  if (!res instanceof Error) {
    return "Successfully added User";
  } else {
    return new Error("Signup failed, email might already be in use");
  }
};

userSchema.statics.login = async function (email, password) {
  let result = await User.find({
    email: email,
  }).exec();
  let val = bcrypt.compareSync(password, result[0].password);
  if (val) {
    if (result[0].verified) {
      return result[0];
    }
    return new Error(
      "User is not verified, please verify your account to login"
    );
  }
  return new Error("Incorrect email or password");
};

userSchema.statics.verifyUser = function (_id) {
  User.updateOne(
    { _id },
    {
      verified: true,
    },
    function (err, usr) {
      if (err) {
        console.log(err);
      } else {
        console.log("Updated User : ", usr);
      }
    }
  )
    .then((res) => res)
    .catch((err) => err);
};

const hashMessage = async (password) => {
  const hash = await bcrypt.hash(password, 5);
  return hash;
};

module.exports = userSchema;
