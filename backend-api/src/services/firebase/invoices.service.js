const { getFirestore } = require('../../config/firebase');
const { v4: uuid } = require('uuid');

const COL = 'invoices';
const toDoc = (doc) => ({ id: doc.id, ...doc.data() });

exports.getAll = async () => {
  const snap = await getFirestore().collection(COL).orderBy('createdAt', 'desc').get();
  return snap.docs.map(toDoc);
};

exports.getById = async (id) => {
  const doc = await getFirestore().collection(COL).doc(id).get();
  return doc.exists ? toDoc(doc) : null;
};

exports.create = async (data) => {
  const id = uuid();
  const record = { ...data, status: data.status || 'UNPAID', payments: data.payments || [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  await getFirestore().collection(COL).doc(id).set(record);
  return { id, ...record };
};

exports.update = async (id, data) => {
  const updates = { ...data, updatedAt: new Date().toISOString() };
  await getFirestore().collection(COL).doc(id).update(updates);
  return exports.getById(id);
};

exports.recordPayment = async (id, payment) => {
  const invoice = await exports.getById(id);
  if (!invoice) throw new Error('Invoice not found');
  const payments = [...(invoice.payments || []), { ...payment, id: uuid(), date: new Date().toISOString() }];
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const status = totalPaid >= invoice.grandTotal ? 'PAID' : 'PARTIAL';
  return exports.update(id, { payments, status });
};

exports.remove = async (id) => {
  await getFirestore().collection(COL).doc(id).delete();
};
