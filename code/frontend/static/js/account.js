const firebaseConfig = {
  apiKey: ,
  authDomain: "nlp-project-ai.firebaseapp.com",
  projectId: "nlp-project-ai",
  storageBucket: "nlp-project-ai.firebasestorage.app",
  messagingSenderId: "223454429125",
  appId: "1:223454429125:web:835509e1244675bbacd5ac",
  measurementId: "G-MH3LSZ3ZLY"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById('userEmail').textContent = 'Email: ' + user.email;

    const date = new Date(user.metadata.creationTime);
    const formatted = date.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    document.getElementById('userDate').textContent = 'Дата реєстрації: ' + formatted;
  } else {
    window.location.href = '/login';
  }
});

document.getElementById('deleteHistoryBtn').addEventListener('click', async () => {
  const token = await auth.currentUser.getIdToken(true);

  try {
    const response = await fetch('/api/delete_history', {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    const message = document.getElementById('actionMessage');
    if (response.ok) {
      message.textContent = 'Історію успішно видалено.';
    } else {
      message.textContent = 'Не вдалося видалити історію.';
    }
    message.classList.remove('hidden');
  } catch (err) {
    console.error('Помилка:', err);
  }
});

document.getElementById('deleteAccountBtn').addEventListener('click', async () => {
  try {
    await auth.currentUser.delete();
    alert('Акаунт видалено. До побачення!');
    window.location.href = '/login';
  } catch (err) {
    alert('Помилка при видаленні акаунта: ' + err.message);
  }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  try {
    await auth.signOut();
    window.location.href = '/';
  } catch (err) {
    alert('Помилка при виході з акаунта: ' + err.message);
  }
});

