



document.addEventListener('DOMContentLoaded', async () => {
  const navbar = document.getElementById('navbar');

  const user = await new Promise(resolve => {
    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      unsubscribe();
      resolve(user);
    });
  });

  let html = '<nav><div class="nav-inner">';

  // показуємо "головна" лише якщо користувач НЕ авторизований
  if (!user) {
    html += `
      <a href="/" class="nav-btn"><i data-feather="home"></i> Головна</a>
    `;
  }

  if (user) {
    html += `
      <a href="/analyze" class="nav-btn"><i data-feather="activity"></i> Аналіз</a>
      <a href="/history" class="nav-btn"><i data-feather="clock"></i> Історія</a>
      <a href="/account" class="nav-btn"><i data-feather="user"></i> Акаунт</a>
      <a href="#" class="nav-btn" id="logoutBtn"><i data-feather="log-out"></i> Вийти</a>
    `;
  } else {
    html += `
      <a href="/login" class="nav-btn"><i data-feather="log-in"></i> Авторизація</a>
    `;
  }

  html += '</div></nav>';

  navbar.innerHTML = html;
  feather.replace();

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await firebase.auth().signOut();
      window.location.href = "/";
    });
  }
});
