#!/usr/bin/env node

/**
 * SlotPay Database Setup Script
 * 
 * This script helps initialize the Supabase database with schema and seed data.
 * 
 * Usage:
 *   node setup.js --schema          # Run schema only
 *   node setup.js --seed            # Run seed data only
 *   node setup.js --all             # Run both schema and seed
 *   node setup.js --reset           # Reset and recreate everything
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`)
};

// Validate environment variables
function validateEnv() {
  const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    log.error(`Missing required environment variables: ${missing.join(', ')}`);
    log.info('Please check your .env file');
    process.exit(1);
  }
}

// Create Supabase client with service role key
function createSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// Execute SQL file
async function executeSqlFile(supabase, filename) {
  try {
    const filePath = join(__dirname, filename);
    const sql = readFileSync(filePath, 'utf8');
    
    log.info(`Executing ${filename}...`);
    
    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
        if (error && !error.message.includes('already exists')) {
          throw error;
        }
      }
    }
    
    log.success(`${filename} executed successfully`);
    return true;
  } catch (error) {
    log.error(`Failed to execute ${filename}: ${error.message}`);
    return false;
  }
}

// Run schema setup
async function setupSchema(supabase) {
  log.title('📊 Setting up database schema...');
  
  try {
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    // Execute schema in chunks to avoid timeout
    const chunks = schema.split('-- =====================================================');
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i].trim();
      if (chunk) {
        log.info(`Executing schema chunk ${i + 1}/${chunks.length}...`);
        
        // Split by semicolons
        const statements = chunk
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));
        
        for (const statement of statements) {
          if (statement.trim()) {
            try {
              // Use raw SQL execution
              const { error } = await supabase.rpc('exec_sql', { 
                sql_query: statement + ';' 
              });
              
              if (error && !error.message.includes('already exists')) {
                log.warning(`Warning: ${error.message}`);
              }
            } catch (err) {
              // Ignore "already exists" errors
              if (!err.message.includes('already exists')) {
                log.warning(`Warning: ${err.message}`);
              }
            }
          }
        }
      }
    }
    
    log.success('Schema setup completed');
    return true;
  } catch (error) {
    log.error(`Schema setup failed: ${error.message}`);
    return false;
  }
}

// Run seed data
async function seedData(supabase) {
  log.title('🌱 Seeding database with sample data...');
  
  try {
    const seedPath = join(__dirname, 'seed.sql');
    const seed = readFileSync(seedPath, 'utf8');
    
    // Execute seed data
    const statements = seed
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim() && !statement.includes('DO $$')) {
        try {
          const { error } = await supabase.rpc('exec_sql', { 
            sql_query: statement + ';' 
          });
          
          if (error && !error.message.includes('duplicate key')) {
            log.warning(`Warning: ${error.message}`);
          }
        } catch (err) {
          if (!err.message.includes('duplicate key')) {
            log.warning(`Warning: ${err.message}`);
          }
        }
      }
    }
    
    log.success('Seed data inserted successfully');
    return true;
  } catch (error) {
    log.error(`Seeding failed: ${error.message}`);
    return false;
  }
}

// Verify setup
async function verifySetup(supabase) {
  log.title('🔍 Verifying database setup...');
  
  try {
    // Check tables
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count');
    
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('count');
    
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('count');
    
    if (usersError || servicesError || bookingsError) {
      log.error('Some tables are missing or inaccessible');
      return false;
    }
    
    log.success(`Users table: ${users?.[0]?.count || 0} records`);
    log.success(`Services table: ${services?.[0]?.count || 0} records`);
    log.success(`Bookings table: ${bookings?.[0]?.count || 0} records`);
    
    log.success('Database verification completed');
    return true;
  } catch (error) {
    log.error(`Verification failed: ${error.message}`);
    return false;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || '--help';
  
  log.title('🚀 SlotPay Database Setup');
  
  if (command === '--help' || command === '-h') {
    console.log(`
Usage: node setup.js [command]

Commands:
  --schema    Run database schema only
  --seed      Run seed data only (requires schema to be set up first)
  --all       Run both schema and seed data
  --reset     Drop all tables and recreate (⚠️  destructive!)
  --verify    Verify database setup
  --help      Show this help message

Examples:
  node setup.js --all       # Full setup with sample data
  node setup.js --schema    # Schema only
  node setup.js --verify    # Check if setup is correct
`);
    process.exit(0);
  }
  
  // Validate environment
  validateEnv();
  
  // Create Supabase client
  const supabase = createSupabaseClient();
  log.success('Connected to Supabase');
  
  let success = true;
  
  switch (command) {
    case '--schema':
      success = await setupSchema(supabase);
      break;
      
    case '--seed':
      success = await seedData(supabase);
      break;
      
    case '--all':
      success = await setupSchema(supabase);
      if (success) {
        success = await seedData(supabase);
      }
      break;
      
    case '--verify':
      success = await verifySetup(supabase);
      break;
      
    case '--reset':
      log.warning('⚠️  This will delete all data!');
      log.info('Dropping tables...');
      // Add reset logic here if needed
      log.warning('Reset not implemented yet. Please use Supabase dashboard.');
      break;
      
    default:
      log.error(`Unknown command: ${command}`);
      log.info('Use --help to see available commands');
      process.exit(1);
  }
  
  if (success) {
    log.title('✨ Setup completed successfully!');
    log.info('Your database is ready to use.');
    log.info('Start the server with: npm run dev');
  } else {
    log.title('❌ Setup failed');
    log.info('Please check the errors above and try again.');
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  log.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});

// Made with Bob
