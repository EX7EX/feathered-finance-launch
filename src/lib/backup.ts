import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Database Backup
export const backupDatabase = async () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(process.cwd(), 'backups', `db-backup-${timestamp}.sql`);

    // Create backups directory if it doesn't exist
    await fs.mkdir(path.join(process.cwd(), 'backups'), { recursive: true });

    // Export database
    const { data, error } = await supabase.rpc('backup_database');
    if (error) throw error;

    // Save backup file
    await fs.writeFile(backupPath, data);

    return {
      success: true,
      path: backupPath,
      timestamp
    };
  } catch (error) {
    console.error('Database backup failed:', error);
    return {
      success: false,
      error
    };
  }
};

// Restore Database
export const restoreDatabase = async (backupPath: string) => {
  try {
    // Read backup file
    const backupData = await fs.readFile(backupPath, 'utf-8');

    // Restore database
    const { error } = await supabase.rpc('restore_database', {
      backup_data: backupData
    });
    if (error) throw error;

    return {
      success: true,
      path: backupPath
    };
  } catch (error) {
    console.error('Database restore failed:', error);
    return {
      success: false,
      error
    };
  }
};

// Application State Backup
export const backupApplicationState = async () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(process.cwd(), 'backups', `state-backup-${timestamp}.json`);

    // Create backups directory if it doesn't exist
    await fs.mkdir(path.join(process.cwd(), 'backups'), { recursive: true });

    // Get application state
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    if (usersError) throw usersError;

    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('*');
    if (settingsError) throw settingsError;

    // Save backup file
    await fs.writeFile(
      backupPath,
      JSON.stringify({
        users,
        settings,
        timestamp
      }, null, 2)
    );

    return {
      success: true,
      path: backupPath,
      timestamp
    };
  } catch (error) {
    console.error('Application state backup failed:', error);
    return {
      success: false,
      error
    };
  }
};

// Restore Application State
export const restoreApplicationState = async (backupPath: string) => {
  try {
    // Read backup file
    const backupData = JSON.parse(await fs.readFile(backupPath, 'utf-8'));

    // Restore users
    if (backupData.users) {
      const { error: usersError } = await supabase
        .from('users')
        .upsert(backupData.users);
      if (usersError) throw usersError;
    }

    // Restore settings
    if (backupData.settings) {
      const { error: settingsError } = await supabase
        .from('settings')
        .upsert(backupData.settings);
      if (settingsError) throw settingsError;
    }

    return {
      success: true,
      path: backupPath
    };
  } catch (error) {
    console.error('Application state restore failed:', error);
    return {
      success: false,
      error
    };
  }
};

// Cleanup Old Backups
export const cleanupOldBackups = async (olderThanDays: number = 30) => {
  try {
    const backupsDir = path.join(process.cwd(), 'backups');
    const files = await fs.readdir(backupsDir);
    const now = new Date();
    const cutoffDate = new Date(now.setDate(now.getDate() - olderThanDays));

    for (const file of files) {
      const filePath = path.join(backupsDir, file);
      const stats = await fs.stat(filePath);
      const fileDate = new Date(stats.mtime);

      if (fileDate < cutoffDate) {
        await fs.unlink(filePath);
      }
    }

    return {
      success: true,
      cleanedFiles: files.length
    };
  } catch (error) {
    console.error('Backup cleanup failed:', error);
    return {
      success: false,
      error
    };
  }
};

// Verify Backup
export const verifyBackup = async (backupPath: string) => {
  try {
    const backupData = await fs.readFile(backupPath, 'utf-8');
    const isValid = backupData.includes('CREATE TABLE') || backupData.includes('INSERT INTO');

    return {
      success: true,
      isValid,
      path: backupPath
    };
  } catch (error) {
    console.error('Backup verification failed:', error);
    return {
      success: false,
      error
    };
  }
}; 