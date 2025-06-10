const firebaseConfig = {
  apiKey: "AIzaSyD0S2-_l1QBXsp2emZU2qLmD027be7lW7o",
  authDomain: "nlp-project-ai.firebaseapp.com",
  projectId: "nlp-project-ai",
  storageBucket: "nlp-project-ai.firebasestorage.app",
  messagingSenderId: "223454429125",
  appId: "1:223454429125:web:835509e1244675bbacd5ac",
  measurementId: "G-MH3LSZ3ZLY"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const form = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');
const registerBtn = document.getElementById('registerBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = form.email.value.trim();
  const password = form.password.value;

  if (!email || !password || password.length < 6) {
    showError('Введіть коректні email і пароль (мінімум 6 символів).');
    return;
  }

  try {
    await auth.signInWithEmailAndPassword(email, password);
    window.location.href = "/analyze";
  } catch (error) {
    showError(mapFirebaseError(error));
  }
});

registerBtn.addEventListener('click', async () => {
  const email = form.email.value.trim();
  const password = form.password.value;

  if (!email || !password || password.length < 6) {
    showError('Для реєстрації введіть коректні дані.');
    return;
  }

  try {
    await auth.createUserWithEmailAndPassword(email, password);
    window.location.href = "/analyze";
  } catch (error) {
    showError(mapFirebaseError(error));
  }
});

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.remove('hidden');
}

function mapFirebaseError(error) {
  if (error.code === 'auth/user-not-found') return 'Користувача не знайдено.';
  if (error.code === 'auth/wrong-password') return 'Неправильний пароль.';
  if (error.code === 'auth/email-already-in-use') return 'Такий email вже зареєстрований.';
  if (error.code === 'auth/invalid-email') return 'Некоректний email.';
  if (error.code === 'auth/weak-password') return 'Пароль має містити щонайменше 6 символів.';
  return 'Сталася помилка. Спробуйте ще раз.';
}
