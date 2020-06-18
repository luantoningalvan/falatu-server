import { Service } from 'typedi';
import { S3 } from 'aws-sdk';
import { s3 } from '../config/S3';

interface DeleteObjectParams {
  Bucket: string;
  Key: string;
}

@Service()
export class StorageProvider {
  private readonly storage: typeof s3;

  constructor() {
    this.storage = s3;
  }

  public async deleteObject(key: string) {
    const params: DeleteObjectParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    };

    // Promisify
    const data = await new Promise<S3.DeleteObjectOutput>((resolve, reject) => {
      this.storage.deleteObject(params, (err, data) => {
        if (err) reject(err);
        if (data) resolve(data);
      });
    });

    return data;
  }
}
