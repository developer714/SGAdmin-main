const mongoose = require("mongoose");
const { APIKeyState } = require("../constants/Api");
const Schema = mongoose.Schema;

const ApiKeySchema = Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  name: {
    type: String,
    required: true,
  },
  key: {
    type: String,
    required: true,
    unique: true,
  },
  permissions: {
    type: [Number],
    required: true,
  },
  status: {
    type: Number,
    required: true,
    default: APIKeyState.ACTIVE,
  },
  duration: {
    type: Number,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
  expires_at: {
    type: Date,
    required: true,
  },
  revoked_at: Date,
});

const ApiKeyModel = mongoose.model("api_key", ApiKeySchema);

module.exports = { ApiKeyModel, ApiKeySchema };
