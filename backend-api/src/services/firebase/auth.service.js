const { getFirestore } = require('../../config/firebase');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');

const COLLECTION = 'users';

exports.findUserByEmail = async (email) => {
  const db = getFirestore();
  const snap = await db.collection(COLLECTION).where('email', '==', email).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() };
};

exports.findUserById = async (id) => {
  const db = getFirestore();
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

exports.getAllUsers = async () => {
  const db = getFirestore();
  const snap = await db.collection(COLLECTION).get();
  return snap.docs.map(d => { const data = d.data(); delete data.password; return { id: d.id, ...data }; });
};

exports.createUser = async (data) => {
  const db = getFirestore();
  const id = uuid();
  const hashed = await bcrypt.hash(data.password, 12);
  const user = { ...data, password: hashed, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  await db.collection(COLLECTION).doc(id).set(user);
  const { password: _, ...safe } = user;
  return { id, ...safe };
};

exports.updateUser = async (id, data) => {
  const db = getFirestore();
  const updates = { ...data, updatedAt: new Date().toISOString() };
  if (updates.password) updates.password = await bcrypt.hash(updates.password, 12);
  await db.collection(COLLECTION).doc(id).update(updates);
  return exports.findUserById(id);
};

exports.deleteUser = async (id) => {
  const db = getFirestore();
  await db.collection(COLLECTION).doc(id).delete();
};

exports.verifyPassword = async (plain, hashed) => bcrypt.compare(plain, hashed);
exports.hashPassword = async (plain) => bcrypt.hash(plain, 12);
