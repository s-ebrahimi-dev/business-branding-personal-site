
import mongoose from 'mongoose';

const encryptedSecretSchema = new mongoose.Schema(
  {
    iv: {
      type: String,
      required: true,
    },
    ciphertext: {
      type: String,
      required: true,
    },
    authTag: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const aiProviderConfigSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ['avalai'],
      default: 'avalai',
      required: true,
    },

    apiKey: {
      type: encryptedSecretSchema,
      required: true,
      select: false,
    },

    model: {
      type: String,
      default: 'gpt-4.1-mini',
      required: true,
    },

    lastTestedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const AIProviderConfig = mongoose.model(
  'AIProviderConfig',
  aiProviderConfigSchema
);

export default AIProviderConfig;
