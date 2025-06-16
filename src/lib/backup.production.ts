import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { trackError } from './monitoring.production';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Production backup configuration
export const backupConfig = {
  database: {
    schedule: '0 0 * * *', // Daily at midnight
    retention: '30d',
    location: 's3://prod-backups/database',
  },
  application: {
    schedule: '0 */6 * * *', // Every 6 hours
    retention: '7d',
    location: 's3://prod-backups/application',
  },
};

// Enhanced database backup
export const backupDatabase = async () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(process.cwd(), 'backups', `db-backup-${timestamp}.sql`);

    // Create backups directory if it doesn't exist
    await fs.mkdir(path.join(process.cwd(), 'backups'), { recursive: true });

    // Export database
    const { data, error } = await supabase.rpc('backup_database');
    if (error) throw error;

    // Save backup file locally
    await fs.writeFile(backupPath, data);

    // Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BACKUP_BUCKET!,
        Key: `database/${timestamp}.sql`,
        Body: data,
      })
    );

    // Clean up local file
    await fs.unlink(backupPath);

    return {
      success: true,
      timestamp,
      location: `s3://${process.env.AWS_BACKUP_BUCKET}/database/${timestamp}.sql`,
    };
  } catch (error) {
    trackError(error as Error, { context: 'database_backup' });
    return {
      success: false,
      error,
    };
  }
};

// Enhanced database restore
export const restoreDatabase = async (backupKey: string) => {
  try {
    // Download from S3
    const { Body } = await s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.AWS_BACKUP_BUCKET!,
        Key: backupKey,
      })
    );

    if (!Body) throw new Error('Backup file not found');

    const backupData = await Body.transformToString();

    // Restore database
    const { error } = await supabase.rpc('restore_database', {
      backup_data: backupData,
    });
    if (error) throw error;

    return {
      success: true,
      backupKey,
    };
  } catch (error) {
    trackError(error as Error, { context: 'database_restore' });
    return {
      success: false,
      error,
    };
  }
};

// Enhanced application state backup
export const backupApplicationState = async () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // Get application state
    const { data: users, error: usersError } = await supabase.from('users').select('*');
    if (usersError) throw usersError;

    const { data: settings, error: settingsError } = await supabase.from('settings').select('*');
    if (settingsError) throw settingsError;

    const state = {
      users,
      settings,
      timestamp,
    };

    // Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BACKUP_BUCKET!,
        Key: `application/${timestamp}.json`,
        Body: JSON.stringify(state, null, 2),
      })
    );

    return {
      success: true,
      timestamp,
      location: `s3://${process.env.AWS_BACKUP_BUCKET}/application/${timestamp}.json`,
    };
  } catch (error) {
    trackError(error as Error, { context: 'application_backup' });
    return {
      success: false,
      error,
    };
  }
};

// Enhanced application state restore
export const restoreApplicationState = async (backupKey: string) => {
  try {
    // Download from S3
    const { Body } = await s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.AWS_BACKUP_BUCKET!,
        Key: backupKey,
      })
    );

    if (!Body) throw new Error('Backup file not found');

    const backupData = JSON.parse(await Body.transformToString());

    // Restore users
    if (backupData.users) {
      const { error: usersError } = await supabase.from('users').upsert(backupData.users);
      if (usersError) throw usersError;
    }

    // Restore settings
    if (backupData.settings) {
      const { error: settingsError } = await supabase.from('settings').upsert(backupData.settings);
      if (settingsError) throw settingsError;
    }

    return {
      success: true,
      backupKey,
    };
  } catch (error) {
    trackError(error as Error, { context: 'application_restore' });
    return {
      success: false,
      error,
    };
  }
};

// Enhanced backup cleanup
export const cleanupOldBackups = async (olderThanDays: number = 30) => {
  try {
    const now = new Date();
    const cutoffDate = new Date(now.setDate(now.getDate() - olderThanDays));

    // List all backups
    const { Contents } = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: process.env.AWS_BACKUP_BUCKET!,
      })
    );

    if (!Contents) return { success: true, cleanedFiles: 0 };

    // Delete old backups
    const deletePromises = Contents.filter((obj) => {
      if (!obj.LastModified) return false;
      return obj.LastModified < cutoffDate;
    }).map((obj) =>
      s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BACKUP_BUCKET!,
          Key: obj.Key,
        })
      )
    );

    await Promise.all(deletePromises);

    return {
      success: true,
      cleanedFiles: deletePromises.length,
    };
  } catch (error) {
    trackError(error as Error, { context: 'backup_cleanup' });
    return {
      success: false,
      error,
    };
  }
};

// Enhanced backup verification
export const verifyBackup = async (backupKey: string) => {
  try {
    // Download from S3
    const { Body } = await s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.AWS_BACKUP_BUCKET!,
        Key: backupKey,
      })
    );

    if (!Body) throw new Error('Backup file not found');

    const backupData = await Body.transformToString();
    const isValid = backupData.includes('CREATE TABLE') || backupData.includes('INSERT INTO');

    return {
      success: true,
      isValid,
      backupKey,
    };
  } catch (error) {
    trackError(error as Error, { context: 'backup_verification' });
    return {
      success: false,
      error,
    };
  }
}; 