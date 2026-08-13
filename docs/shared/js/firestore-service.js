// Firestore Service

async function getProfileFromFirestore() {
  try {
    const doc = await db.collection("profile").doc("main").get();
    return doc.exists ? doc.data() : null;
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function getGalleryFromFirestore() {
  try {
    const snap = await db.collection("gallery").orderBy("title").get();
    return snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function saveGalleryItemToFirestore(id, data) {
  try {
    if (id) {
      await db.collection("gallery").doc(id).set(data);
    } else {
      await db.collection("gallery").add(data);
    }
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function deleteGalleryItemFromFirestore(id) {
  try {
    await db.collection("gallery").doc(id).delete();
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}
