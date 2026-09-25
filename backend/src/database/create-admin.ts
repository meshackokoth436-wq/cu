/**
 * Bootstraps a Super Administrator account.
 *
 * Deliberately NOT part of seed.ts and NOT run automatically: baking a
 * default admin account (even a randomly-generated one) into seed data is
 * how "admin/admin" breaches happen — anyone with the repo would know an
 * admin account exists and could guess at it. This script requires a human
 * to explicitly run it and provide (or generate) real credentials.
 *
 * Usage:
 *
 *   npm run create:admin -- --email admin@tumcu.ac.ke --name "Site Administrator"
 *
 *   npm run create:admin -- --email admin@tumcu.ac.ke --name "Site Administrator" --password "..."
 *
 * If --password is omitted, a strong random password is generated and
 * printed ONCE — it is not stored anywhere in recoverable form.
 *
 * Safe to re-run:
 * if the email already exists, the script promotes that existing account
 * to Super Admin instead of creating a duplicate.
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';

import { pool } from '../config/database';
import { logger } from '../utils/logger';


/* ============================================================================
   ARGUMENTS
   ============================================================================ */

interface ParsedArgs {
  email?: string;
  name?: string;
  password?: string;
}


/* ============================================================================
   PARSE COMMAND-LINE ARGUMENTS
   ============================================================================ */

function parseArgs(argv: string[]): ParsedArgs {
  const args: ParsedArgs = {};

  for (let i = 0; i < argv.length; i++) {

    if (argv[i] === '--email') {
      args.email = argv[++i];
    }

    else if (argv[i] === '--name') {
      args.name = argv[++i];
    }

    else if (argv[i] === '--password') {
      args.password = argv[++i];
    }
  }

  return args;
}


/* ============================================================================
   GENERATE STRONG PASSWORD
   ============================================================================ */

function generateStrongPassword(): string {

  /*
   * 20 random bytes encoded as base64url.
   *
   * We append characters from the required classes so the generated
   * password satisfies the application's password policy.
   */

  const random =
    crypto
      .randomBytes(20)
      .toString('base64url');

  return `${random}A9!`;
}


/* ============================================================================
   MAIN
   ============================================================================ */

async function run() {

  const args =
    parseArgs(process.argv.slice(2));


  /* --------------------------------------------------------------------------
     VALIDATE EMAIL
     -------------------------------------------------------------------------- */

  if (!args.email) {

    logger.error(
      'Usage: npm run create:admin -- --email you@example.com --name "Full Name" [--password "..."]'
    );

    process.exitCode = 1;
    return;
  }


  const email =
    args.email
      .trim()
      .toLowerCase();


  const fullName =
    args.name?.trim() ||
    'Super Administrator';


  /* --------------------------------------------------------------------------
     VALIDATE PASSWORD
     -------------------------------------------------------------------------- */

  if (
    args.password &&
    args.password.length < 10
  ) {

    logger.error(
      'Password must be at least 10 characters.'
    );

    process.exitCode = 1;
    return;
  }


  /* --------------------------------------------------------------------------
     FIND SUPER ADMIN ROLE
     -------------------------------------------------------------------------- */

  const [
    superAdminRoleRows,
  ] = await pool.query(
    `SELECT id
       FROM roles
      WHERE code = 'super_admin'`
  );


  const superAdminRole =
    (
      superAdminRoleRows as {
        id: string;
      }[]
    )[0];


  if (!superAdminRole) {

    logger.error(
      'super_admin role not found — run `npm run seed` first.'
    );

    process.exitCode = 1;
    return;
  }


  /* --------------------------------------------------------------------------
     CHECK WHETHER USER ALREADY EXISTS
     -------------------------------------------------------------------------- */

  const [
    existingRows,
  ] = await pool.query(
    `SELECT id, email
       FROM users
      WHERE email = :email`,
    {
      email,
    }
  );


  const existing =
    (
      existingRows as {
        id: string;
        email: string;
      }[]
    )[0];


  /*
   * Only generate a password when it will actually be written.
   *
   * Existing account + no --password:
   *     password remains unchanged.
   *
   * Existing account + --password:
   *     password gets replaced.
   *
   * New account:
   *     password is generated unless explicitly supplied.
   */

  const willSetPassword =
    !existing ||
    Boolean(args.password);


  const password =
    willSetPassword
      ? args.password ||
        generateStrongPassword()
      : null;


  const passwordWasGenerated =
    willSetPassword &&
    !args.password;


  let userId: string;


  /* ==========================================================================
     EXISTING ACCOUNT
     ========================================================================== */

  if (existing) {

    userId = existing.id;


    /*
     * Activate and unlock the existing account.
     */

    await pool.query(
      `UPDATE users
          SET account_status = 'active',
              email_verified_at =
                COALESCE(email_verified_at, NOW()),
              failed_login_attempts = 0,
              locked_until = NULL
        WHERE id = :id`,
      {
        id: userId,
      }
    );


    logger.info(
      `Existing account found for ${email} — promoting to Super Administrator.`
    );


    /*
     * Only change the password when the user explicitly supplied
     * --password.
     */

    if (password) {

      const passwordHash =
        await bcrypt.hash(
          password,
          12
        );


      await pool.query(
        `UPDATE users
            SET password_hash = :passwordHash
          WHERE id = :id`,
        {
          passwordHash,
          id: userId,
        }
      );


      logger.info(
        'Password updated to the value provided via --password.'
      );

    } else {

      logger.info(
        'No --password given — existing password left unchanged.'
      );

    }


  /* ==========================================================================
     NEW ACCOUNT
     ========================================================================== */

  } else {

    const passwordHash =
      await bcrypt.hash(
        password as string,
        12
      );


    await pool.query(
      `INSERT INTO users
         (
           id,
           username,
           email,
           password_hash,
           full_name,
           account_status,
           email_verified_at
         )
       VALUES
         (
           UUID(),
           :username,
           :email,
           :passwordHash,
           :fullName,
           'active',
           NOW()
         )`,
      {
        username:
          email.split('@')[0] +
          '_admin',

        email,

        passwordHash,

        fullName,
      }
    );


    /*
     * MySQL generates the UUID() value.
     *
     * Look the newly-created account up using
     * its unique email address.
     */

    const [
      rows,
    ] = await pool.query(
      `SELECT id
         FROM users
        WHERE email = :email`,
      {
        email,
      }
    );


    const createdUser =
      (
        rows as {
          id: string;
        }[]
      )[0];


    if (!createdUser) {

      throw new Error(
        `User was inserted but could not be found afterwards: ${email}`
      );
    }


    userId =
      createdUser.id;


    logger.info(
      `Created new account for ${email}.`
    );
  }


  /* ==========================================================================
     ASSIGN SUPER ADMIN ROLE
     ========================================================================== */

  await pool.query(
    `INSERT INTO user_roles
       (
         id,
         user_id,
         role_id,
         scope_type,
         start_date,
         is_current
       )
     SELECT
       UUID(),
       :userId,
       :roleId,
       'global',
       CURDATE(),
       TRUE

      WHERE NOT EXISTS (
        SELECT 1
          FROM user_roles
         WHERE user_id = :userId
           AND role_id = :roleId
           AND is_current = TRUE
      )`,
    {
      userId,
      roleId:
        superAdminRole.id,
    }
  );


  /* ==========================================================================
     SUCCESS MESSAGE
     ========================================================================== */

  logger.info(
    '✅ Super Administrator account is ready.'
  );

  logger.info(
    `   Email:    ${email}`
  );

  logger.info(
    `   Login at: /login`
  );


  /* --------------------------------------------------------------------------
     SHOW GENERATED PASSWORD ONLY WHEN ONE WAS GENERATED
     -------------------------------------------------------------------------- */

  if (passwordWasGenerated) {

    logger.warn(
      '─'.repeat(60)
    );

    logger.warn(
      `   Generated password (shown once): ${password}`
    );

    logger.warn(
      '   Store this securely and change it after first login.'
    );

    logger.warn(
      '─'.repeat(60)
    );
  }


  /*
   * IMPORTANT:
   *
   * Do NOT call pool.end() here.
   *
   * The application's database.ts exports a custom pool wrapper that
   * intentionally exposes query() and getConnection(), but not end().
   *
   * Calling pool.end() therefore caused:
   *
   *     TypeError:
   *     import_database.pool.end is not a function
   *
   * The database wrapper manages its own underlying connection.
   *
   * Setting exitCode allows the script to finish successfully without
   * attempting to call an unsupported cleanup method.
   */

  process.exitCode = 0;
}


/* ============================================================================
   RUN SCRIPT
   ============================================================================ */

run().catch((err) => {

  logger.error(
    {
      err,
    },
    'Failed to create super admin'
  );

  process.exitCode = 1;
});