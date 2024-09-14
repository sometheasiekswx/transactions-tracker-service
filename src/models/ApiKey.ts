import mongoose, {Schema} from 'mongoose';

export interface IApiKey {
    bearer_token: string;
}

const apiKeySchema: Schema<IApiKey> = new Schema({
    bearer_token: {type: String, required: true},
});

const ApiKey = mongoose.model<IApiKey>('Api_Key', apiKeySchema);

export default ApiKey;
