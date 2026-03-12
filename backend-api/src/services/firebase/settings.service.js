const { getFirestore } = require('../../config/firebase');

const DOC = 'landing';
const COL = 'settings';

exports.getLandingSettings = async () => {
  const doc = await getFirestore().collection(COL).doc(DOC).get();
  return doc.exists ? doc.data() : {};
};

exports.updateLandingSettings = async (data) => {
  const ref = getFirestore().collection(COL).doc(DOC);
  await ref.set({ ...data, updatedAt: new Date().toISOString() }, { merge: true });
  const updated = await ref.get();
  return updated.data();
};
