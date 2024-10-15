const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { LicenseLevel } = require("../constants/Paywall");
const { UserRole } = require("../constants/User");
const { UserModel } = require("./User");

const OrganisationSchema = Schema({
  title: {
    type: String,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: Date,
  deleted: Date,
  license: {
    type: Number,
    required: true,
    default: LicenseLevel.COMMUNITY,
  },
  package: {
    // Dedicated for Enterprise plan
    type: Schema.Types.ObjectId,
    ref: "custompackage",
  },
  current_period_end: {
    type: Date,
  },
  start_date: {
    // Dedicated for Enterprise plan
    type: Date,
  },
  license_next: Number,
  // external_webhook: {
  //     type: Schema.Types.ObjectId,
  //     ref: "externalwebhook",
  // },
  stripe: {
    customerId: String,
    paymentMethodId: String,
    subscriptionId: String,
  },
  traffic_account: {
    current_period_start: {
      type: Date,
    },
    updated: {
      type: Date,
    },
    requests_number: {
      type: Number,
      required: true,
      default: 0,
    },
    traffic_bytes: {
      type: Number,
      required: true,
      default: 0,
    },
    // status_text: {
    //     type: String,
    // },
  },
  rate_limit_traffic_account: {
    current_period_started_at: {
      type: Date,
    },
    updated_at: {
      type: Date,
    },
    requests_number: {
      type: Number,
      required: true,
      default: 0,
    },
    traffic_bytes: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  anti_ddos_traffic_account: {
    current_period_started_at: {
      type: Date,
    },
    updated_at: {
      type: Date,
    },
    requests_number: {
      type: Number,
      required: true,
      default: 0,
    },
    traffic_bytes: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  bot_traffic_account: {
    current_period_started_at: {
      type: Date,
    },
    updated_at: {
      type: Date,
    },
    requests_number: {
      type: Number,
      required: true,
      default: 0,
    },
    traffic_bytes: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  zoho_crm: {
    Account: {
      id: { type: String /*, required: true, default: "" */ },
      Account_Name: { type: String /*, required: true, default: "" */ },
      Phone: { type: String },
      Billing_Street: { type: String },
      Billing_City: { type: String },
      Billing_State: { type: String },
      Billing_Code: { type: String },
      Billing_Country: { type: String },
      Shipping_Street: { type: String },
      Shipping_City: { type: String },
      Shipping_State: { type: String },
      Shipping_Code: { type: String },
      Shipping_Country: { type: String },
    }, // Account ID on Zoho CRM
    Contact: {
      id: { type: String /*, required: true, default: "" */ },
      First_Name: { type: String },
      Last_Name: { type: String /*, required: true, default: "" */ },
      // Account_Name: { type: String },
      Email: { type: String /*, required: true, default: "" */ },
      Phone: { type: String },
      Mailing_Street: { type: String },
      Mailing_City: { type: String },
      Mailing_State: { type: String },
      Mailing_Zip: { type: String },
      Mailing_Country: { type: String },
      Other_Street: { type: String },
      Other_City: { type: String },
      Other_State: { type: String },
      Other_Zip: { type: String },
      Other_Country: { type: String },
    }, // Contact ID on Zoho CRM
  },
  /*
    bmpackage: {
        type: Schema.Types.ObjectId,
        ref: "bmpackage",
    },
    bm_created_at: {
        type: Date,
    },
    bm_expire_at: {
        type: Date,
    },
    */
  idp_connection_id: String,
  idp_connection_name: String,
});

OrganisationSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
  },
});

OrganisationSchema.virtual("external_webhooks", {
  ref: "externalwebhook",
  localField: "_id",
  foreignField: "organisation",
});

OrganisationSchema.virtual("sites", {
  ref: "site",
  localField: "_id",
  foreignField: "owner_id",
});

OrganisationSchema.virtual("users", {
  ref: "user",
  localField: "_id",
  foreignField: "organisation",
});

OrganisationSchema.virtual("isDeleted").get(function () {
  return !!this.deleted;
});

OrganisationSchema.virtual("administrator").get(async function () {
  const user = await UserModel.findOne({
    role: UserRole.ORGANISATION_ACCOUNT,
    organisation: this._id,
    enabled: true,
    deleted: { $in: [undefined, null] },
    verified: { $nin: [undefined, null] },
  })?.sort({ created: 1 }); // choose the first registered user
  return user;
});

const OrganisationModel = mongoose.model("organisation", OrganisationSchema);
module.exports = { OrganisationModel, OrganisationSchema };
