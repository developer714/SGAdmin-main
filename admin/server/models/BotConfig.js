const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { FwAction } = require("../constants/config/Fw");

const BotConfigSchema = Schema({
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
  good_bot_action: {
    type: Number,
    required: true,
    default: FwAction.ALLOW,
  },
  bad_bot_action: {
    type: Number,
    required: true,
    default: FwAction.BLOCK,
  },
});

BotConfigSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const BotConfigModel = mongoose.model("botconfig", BotConfigSchema);

module.exports = { BotConfigModel, BotConfigSchema };
