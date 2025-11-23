/**
 * Utility for generating realistic dummy member data for testing
 */

const { Member } = require('../models');

// Counter to ensure unique identifiers
let emailCounter = 0;
let uoIdCounter = 0;

// Test data identifier - all test emails use this domain to make cleanup easy
const TEST_EMAIL_DOMAIN = '@test.uoregon.edu';

// Predefined lists for realistic data generation
const FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn',
  'Sam', 'Cameron', 'Dakota', 'Sage', 'River', 'Phoenix', 'Blake', 'Reese',
  'Rowan', 'Finley', 'Emery', 'Hayden', 'Parker', 'Skylar', 'Drew', 'Logan',
  'Jamie', 'Dana', 'Kendall', 'Aubrey', 'Quinn', 'Sage', 'Noah', 'Emma',
  'Olivia', 'Liam', 'Ava', 'Mia', 'Ethan', 'Isabella', 'Mason', 'Sophia',
  'James', 'Charlotte', 'Benjamin', 'Amelia', 'Lucas', 'Harper', 'Henry', 'Evelyn'
];

const LAST_NAMES = [
  'Johnson', 'Smith', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris',
  'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen',
  'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green',
  'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter'
];

const MAJORS = [
  'Computer Science', 'Business Administration', 'Psychology', 'Environmental Studies',
  'Mathematics', 'English Literature', 'Biology', 'Chemistry', 'Physics', 'History',
  'Political Science', 'Economics', 'Sociology', 'Anthropology', 'Art History',
  'Music', 'Theater Arts', 'Journalism', 'Communications', 'Education',
  'Engineering', 'Architecture', 'Public Health', 'Nursing', 'Social Work',
  'International Studies', 'Linguistics', 'Philosophy', 'Religious Studies', 'Geography'
];

const PRONOUNS = [
  'he/him', 'she/her', 'they/them', 'she/they', 'he/they', 'any pronouns'
];

const DUES_STATUSES = ['paid', 'unpaid', 'exempt'];
const MEMBERSHIP_STATUSES = ['active', 'inactive', 'graduated', 'suspended'];

/**
 * Generate a random integer between min and max (inclusive)
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random element from an array
 */
function randomElement(array) {
  return array[randomInt(0, array.length - 1)];
}

/**
 * Generate a unique UO ID (95# format)
 * Format: 95XXXXXXX (9 digits starting with 95)
 */
function generateUOId() {
  uoIdCounter++;
  // Generate 7 random digits after "95"
  const randomDigits = String(randomInt(1000000, 9999999));
  return `95${randomDigits}${String(uoIdCounter).padStart(2, '0')}`;
}

/**
 * Generate a unique email address
 * Format: firstname.lastname@uoregon.edu (or @test.uoregon.edu for test data)
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @param {boolean} isTestData - If true, uses test domain for easy identification
 */
function generateEmail(firstName, lastName, isTestData = false) {
  emailCounter++;
  const domain = isTestData ? TEST_EMAIL_DOMAIN : '@uoregon.edu';
  const baseEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${emailCounter > 1 ? emailCounter : ''}${domain}`;
  return baseEmail;
}

/**
 * Generate a phone number
 * Format: 555-XXXX
 */
function generatePhone() {
  const areaCode = '555';
  const number = String(randomInt(1000, 9999));
  return `${areaCode}-${number}`;
}

/**
 * Generate a graduation year
 * Returns a year between current year and 4 years ahead
 */
function generateGraduationYear() {
  const currentYear = new Date().getFullYear();
  return randomInt(currentYear, currentYear + 4);
}

/**
 * Generate realistic dummy member data
 * @param {Object} overrides - Optional object to override any generated field
 * @param {boolean} isTestData - If true, marks data as test data (uses test email domain)
 * @returns {Object} Member data object ready for Member.create()
 */
function generateMemberData(overrides = {}, isTestData = false) {
  const firstName = randomElement(FIRST_NAMES);
  const lastName = randomElement(LAST_NAMES);
  
  const memberData = {
    name: `${firstName} ${lastName}`,
    email: generateEmail(firstName, lastName, isTestData),
    uo_id: generateUOId(),
    phone: generatePhone(),
    major: randomElement(MAJORS),
    pronouns: randomElement(PRONOUNS),
    graduation_year: generateGraduationYear(),
    dues_status: randomElement(DUES_STATUSES),
    membership_status: randomElement(MEMBERSHIP_STATUSES),
    workplace_id: null,
    role_id: null,
    ...overrides // Allow overrides for any field
  };

  return memberData;
}

/**
 * Check if we're in a safe environment for test data insertion
 * Only allows test data in development or test environments
 */
function isSafeForTestData() {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' || env === 'test';
}

/**
 * Generate and create a test member in the database
 * SAFETY: Only works in development/test environments to prevent mixing with production data
 * All test members use @test.uoregon.edu email domain for easy identification and cleanup
 * 
 * @param {Object} overrides - Optional object to override any generated field
 * @returns {Promise<Object>} Created member object from database
 * @throws {Error} If called in production environment
 */
async function createTestMember(overrides = {}) {
  // Safety check - prevent accidental use in production
  if (!isSafeForTestData()) {
    throw new Error(
      'createTestMember() can only be used in development or test environments. ' +
      'Current environment: ' + (process.env.NODE_ENV || 'development')
    );
  }

  const memberData = generateMemberData(overrides, true); // true = mark as test data
  
  // Check if member with this email already exists and clean it up
  const existingMember = await Member.findByEmail(memberData.email);
  if (existingMember) {
    await Member.delete(existingMember.id);
  }

  const member = await Member.create(memberData);
  return member;
}

/**
 * Clean up all test members from the database
 * Removes all members with @test.uoregon.edu email domain
 * SAFETY: Only works in development/test environments
 * 
 * @returns {Promise<number>} Number of members deleted
 * @throws {Error} If called in production environment
 */
async function cleanupTestMembers() {
  if (!isSafeForTestData()) {
    throw new Error(
      'cleanupTestMembers() can only be used in development or test environments. ' +
      'Current environment: ' + (process.env.NODE_ENV || 'development')
    );
  }

  const { query } = require('../config/db');
  const result = await query(
    'DELETE FROM members WHERE email LIKE $1 RETURNING id',
    [`%${TEST_EMAIL_DOMAIN}`]
  );
  
  return result.rowCount;
}

/**
 * Reset counters (useful for test cleanup)
 */
function resetCounters() {
  emailCounter = 0;
  uoIdCounter = 0;
}

module.exports = {
  generateMemberData,
  createTestMember,
  cleanupTestMembers,
  resetCounters,
  TEST_EMAIL_DOMAIN // Export for use in cleanup scripts
};

