const { getFirestore } = require('../../config/firebase');
const { v4: uuid } = require('uuid');

const COL = 'blog_posts';
const toDoc = (doc) => ({ id: doc.id, ...doc.data() });

exports.getAll = async (filters = {}) => {
  let ref = getFirestore().collection(COL);
  if (filters.status) ref = ref.where('status', '==', filters.status);
  const snap = await ref.orderBy('createdAt', 'desc').get();
  return snap.docs.map(toDoc);
};

exports.getById = async (id) => {
  const doc = await getFirestore().collection(COL).doc(id).get();
  return doc.exists ? toDoc(doc) : null;
};

exports.create = async (data) => {
  const id = uuid();
  const record = { ...data, status: data.status || 'DRAFT', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  await getFirestore().collection(COL).doc(id).set(record);
  return { id, ...record };
};

exports.update = async (id, data) => {
  const updates = { ...data, updatedAt: new Date().toISOString() };
  await getFirestore().collection(COL).doc(id).update(updates);
  return exports.getById(id);
};

exports.updateStatus = async (id, status) => exports.update(id, { status });

exports.remove = async (id) => {
  await getFirestore().collection(COL).doc(id).delete();
};
