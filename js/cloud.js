/**
 * CLOUD SAVE / LOAD: reads and writes the inventory in Firebase Firestore (inventory/data).
 */

const CLOUD_DOC = () => window.db.collection("inventory").doc("data");

function withTimeout(promise, ms, label){
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(label + " timed out")), ms)),
  ]);
}

async function saveInventoryToCloud(establishments, attractions, cbtos, officers){
  await withTimeout(CLOUD_DOC().set({
    establishments, attractions, cbtos: cbtos||[], officers: officers||[],
    updatedAt: new Date().toISOString(),
  }), 15000, "Saving");
}

async function loadInventoryFromCloud(){
  const snap = await withTimeout(CLOUD_DOC().get(), 15000, "Loading");
  if(!snap.exists) return null;
  return snap.data();
}
