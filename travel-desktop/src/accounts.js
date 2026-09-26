const crypto = require('node:crypto');
const { promisify } = require('node:util');
const scrypt = promisify(crypto.scrypt);
const profiles = {
 owner: { label: 'Owner / CEO / admin', role: 'admin' },
 marketing_manager: { label: 'Marketing manager', role: 'lead' },
 marketing_strategy: { label: 'Marketing strategy employee', role: 'employee' },
 content_creator: { label: 'Content creator', role: 'employee' },
 employee: { label: 'Employee', role: 'employee' },
};
function email(value) { return String(value || '').trim().toLowerCase(); }
function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email(value)) && email(value).length <= 254; }
function validatePassword(value) {
 if (typeof value !== 'string' || value.length < 10 || value.length > 128) throw new Error('Use a password of 10–128 characters.');
}
async function credential(password) {
 validatePassword(password);
 const salt = crypto.randomBytes(16).toString('hex');
 const hash = await scrypt(password, salt, 64);
 return { salt, hash: hash.toString('hex'), algorithm: 'scrypt' };
}
async function configure(data, personId, address, password, profile) {
 const person = data.people.find(p => p.id === personId);
 if (!person || !validEmail(address)) throw new Error('Enter a valid account email.');
 const normalized = email(address);
 if (data.people.some(p => p.id !== personId && email(p.email) === normalized)) throw new Error('An account with this email already exists.');
 const expected = profiles[profile];
 if (!expected || expected.role !== person.role) throw new Error('Account profile does not match permission role.');
 const hashed = await credential(password);
 person.email = normalized; person.profile = profile; person.jobTitle = expected.label; person.credential = hashed;
 data.authEnabled = true;
 return person;
}
async function authenticate(data, address, password) {
 const person = data?.people.find(p => email(p.email) === email(address) && p.credential);
 const stored = person?.credential || { salt: 'invalid-account', hash: '00'.repeat(64) };
 const safePassword = typeof password === 'string' && password.length <= 128 ? password : '';
 const hash = await scrypt(safePassword, stored.salt, 64);
 const expected = Buffer.from(stored.hash, 'hex');
 if (!person || expected.length !== hash.length || !crypto.timingSafeEqual(expected, hash)) throw new Error('Email or password is incorrect.');
 return person;
}
function temporaryPassword() { return `Av-${crypto.randomBytes(12).toString('base64url')}`; }
function publicAccounts(data) {
 return (data?.people || []).filter(p => p.email && p.credential).map(p => ({ id: p.id, name: p.name, email: p.email, profile: p.profile, jobTitle: p.jobTitle, department: p.department }));
}
module.exports = { profiles, email, validEmail, validatePassword, credential, configure, authenticate, temporaryPassword, publicAccounts };
