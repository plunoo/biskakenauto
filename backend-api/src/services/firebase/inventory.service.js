const { getFirestore } = require('../../config/firebase');
const { v4: uuid } = require('uuid');

const COL = 'inventory';
const toDoc = (doc) => ({ id: doc.id, ...doc.data() });

exports.getAll = async () => {
  const snap = await getFirestore().collection(COL).orderBy('name').get();
  return snap.docs.map(toDoc);
};

exports.getById = async (id) => {
  const doc = await getFirestore().collection(COL).doc(id).get();
  return doc.exists ? toDoc(doc) : null;
};

exports.create = async (data) => {
  const id = uuid();
  const record = { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  await getFirestore().collection(COL).doc(id).set(record);
  return { id, ...record };
};

exports.update = async (id, data) => {
  const updates = { ...data, updatedAt: new Date().toISOString() };
  await getFirestore().collection(COL).doc(id).update(updates);
  return exports.getById(id);
};

exports.updateStock = async (id, quantity) => exports.update(id, { stock: quantity });

exports.remove = async (id) => {
  await getFirestore().collection(COL).doc(id).delete();
};
