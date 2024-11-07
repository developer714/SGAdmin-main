const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { FwAction } = require("../constants/config/Fw");

const AuthConfigSchema = Schema({
  site_id: {
    type: Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: "site",
  },
  enabled: {
    type: Boolean,
    required: true,
    default: false, // must be false
  },
  good_auth_action: {
    type: Number,
    required: true,
    default: FwAction.ALLOW,
  },
  bad_auth_action: {
    type: Number,
    required: true,
    default: FwAction.BLOCK,
  },
});

AuthConfigSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const AuthConfigModel = mongoose.model("authconfig", AuthConfigSchema);

module.exports = { AuthConfigModel, AuthConfigSchema };
