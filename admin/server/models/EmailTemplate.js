const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EmailTemplateSchema = Schema({
  type: {
    type: Number,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
});

EmailTemplateSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
  },
});

const EmailTemplateModel = mongoose.model("emailtemplate", EmailTemplateSchema);

module.exports = { EmailTemplateModel, EmailTemplateSchema };
