const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserConstants = require("../constants/User");

const UserSchema = Schema({
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  enabled: {
    type: Boolean,
    required: true,
    default: true,
  },
  passwordHash: {
    type: String,
    // required: true,
  },
  title: {
    type: String,
  },
  firstName: {
    type: String,
    // required: true,
  },
  lastName: {
    type: String,
    // required: true,
  },
  acceptTerms: Boolean,
  role: {
    type: Number,
    required: true,
    default: UserConstants.UserRole.READONLY_USER,
  },
  verificationToken: String,
  verified: Date,
  //avatar: String,
  resetToken: {
    token: String,
    expires: Date,
  },
  passwordReset: Date,
  created: {
    type: Date,
    default: Date.now,
  },
  updated: Date,
  last_login: Date,
  deleted: Date,
  /** ObjectId of the account who owns me, 0 for admins */
  organisation: {
    type: Schema.Types.ObjectId,
    ref: "organisation",
  },

  // Auth0 fields
  user_id: {
    type: String,
    unique: true,
    sparse: true, // unique if not null
  },
  /** 
     * Object Id of the External Webhook config for the current organisation, Only the organisation user has this field.
     * It has been moved to OrganisationSchema
    external_webhook: {
        type: Schema.Types.ObjectId,
        ref: "externalwebhook",
    },
    */
});

UserSchema.virtual("username").get(function () {
  return this.firstName + " " + this.lastName;
});

UserSchema.virtual("isVerified").get(function () {
  return !!(this.verified || this.passwordReset);
});

UserSchema.virtual("isDeleted").get(function () {
  return !!this.deleted;
});

UserSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
    delete ret.passwordHash;
  },
});

const UserModel = mongoose.model("user", UserSchema);

module.exports = { UserModel, UserSchema };
