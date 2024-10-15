const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { NotificationType } = require("../constants/Notification");

const NotificationSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  // Owner organisation, empty if it is global notification
  organisation: {
    type: Schema.Types.ObjectId,
    ref: "organisation",
  },
  enabled: {
    type: Boolean,
    required: true,
    default: true,
  },
  created: {
    type: Date,
    required: true,
    default: Date.now,
  },
  type: {
    type: Number,
    required: true,
    default: NotificationType.DEFAULT,
  },
  read_users: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  // Optional for Anti DDoS Event
  event_param_anti_ddos: {
    type: {
      target_domain: {
        type: String,
        required: true,
      },
      attacker_ip: {
        type: String,
        required: true,
      },
      sd_ad_uid: {
        type: String,
      },
    },
    required: false,
  },
});

NotificationSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
  },
});

const NotificationModel = mongoose.model("notification", NotificationSchema);

module.exports = { NotificationModel, NotificationSchema };
