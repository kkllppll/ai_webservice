// ініціалізація Firebase
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
  const historyContainer = document.getElementById('historyContainer');
  const modal = document.getElementById('modal');
  const closeModal = document.getElementById('closeModal');
  
  const modalText = document.getElementById('modalText');
  const modalSentiment = document.getElementById('modalSentiment');
  const modalToxicity = document.getElementById('modalToxicity');
  const modalTopics = document.getElementById('modalTopics');
  const modalSummary = document.getElementById('modalSummary');
  
  firebase.auth().onAuthStateChanged(async user => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
  

  
  
    const token = await user.getIdToken(true);
    const response = await fetch('/api/analyses', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
  
    const analyses = await response.json();
  
    if (!Array.isArray(analyses) || analyses.length === 0) {
      historyContainer.innerHTML = '<p>Історія порожня.</p>';
      return;
    }
  
    analyses.reverse().forEach(analysis => {
      const card = document.createElement('div');
      card.className = 'analysis-card';
  
      const preview = analysis.preview_text || analysis.input_text?.slice(0, 100) + '...';
      const date = new Date(analysis.timestamp).toLocaleString('uk-UA');
      const sentimentMap = {
        positive: 'Позитивна',
        neutral: 'Нейтральна',
        negative: 'Негативна'
      };
      const sentimentRaw = analysis.results.sentiment?.label || '—';
      const sentiment = sentimentMap[sentimentRaw] || sentimentRaw;
      
      const toxicityScore = analysis.results.toxicity?.scores?.toxic;
      const toxicityLabel = toxicityScore >= 0.5 ? 'Токсично' : 'Нетоксично';
      const toxicity = `${toxicityLabel} (${Math.round(toxicityScore * 100)}%)`;
      
  
      card.innerHTML = `
        <p><strong>Дата:</strong> ${date}</p>
        <p><strong>Превʼю:</strong> ${preview}</p>
        <p><strong>Тональність:</strong> ${sentiment}</p>
        <p><strong>Токсичність:</strong> ${toxicity}</p>
        <div style="margin-top: 10px;">
          <button class="nav-btn btn-small" data-id="${analysis.id}" data-full='${JSON.stringify(analysis)}'>Детальніше</button>
          <button class="nav-btn btn-small export-btn" data-full='${JSON.stringify(analysis)}'>Експорт в PDF</button>
          <button class="nav-btn btn-small danger-btn" data-del="${analysis.id}">Видалити</button>
        </div>
      `;
  
      historyContainer.appendChild(card);
    });
  
    document.querySelectorAll('[data-id]').forEach(btn => {
        btn.addEventListener('click', () => {
            const data = JSON.parse(btn.dataset.full);
          
            modalText.textContent = data.input_text || '—';
            const sentimentLabel = data.results.sentiment?.label || '—';
            const sentimentMap = {
            positive: 'Позитивна',
            neutral: 'Нейтральна',
            negative: 'Негативна'
            };
            modalSentiment.textContent = sentimentMap[sentimentLabel] || '—';

            const toxicityScore = data.results.toxicity?.scores?.toxic;
            const toxicityLabel = toxicityScore >= 0.5 ? 'Токсично' : 'Нетоксично';
            modalToxicity.textContent = `${toxicityLabel} (${Math.round(toxicityScore * 100)}%)`;
            modalTopics.textContent = data.results.topics?.join(', ') || '—';
            modalSummary.textContent = data.summary || '—';
            modal.classList.remove('hidden');
          
            // побудова діаграми
            const sentiment = data.results.sentiment?.label;
            const sentimentData = {
              positive: sentiment === 'positive' ? 1 : 0,
              neutral: sentiment === 'neutral' ? 1 : 0,
              negative: sentiment === 'negative' ? 1 : 0
            };
          
            const canvas = document.getElementById('sentimentChart');
            if (window.sentimentChart instanceof Chart) {
              window.sentimentChart.destroy();
            }
            window.sentimentChart = new Chart(canvas.getContext('2d'), {
              type: 'doughnut',
              data: {
                labels: ['Позитивна', 'Нейтральна', 'Негативна'],
                datasets: [{
                  data: [
                    sentiment === 'positive' ? 1 : 0,
                    sentiment === 'neutral' ? 1 : 0,
                    sentiment === 'negative' ? 1 : 0
                  ],
                  backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
                }]
              },
              options: {
                responsive: false,
                plugins: {
                  legend: { display: true, position: 'bottom' }
                }
              }
            });
            

          });
          
    });
  
    document.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const confirmDel = confirm('Видалити цей запис?');
        if (!confirmDel) return;
  


        console.log("DEL BUTTON:", btn);
        console.log("DATA-DEL:", btn.dataset.del);

        const id = btn.dataset.del;
  
        const res = await fetch(`/api/delete_analysis/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer ' + token
          }
        });
  
        if (res.ok) {
          btn.closest('.analysis-card').remove();
        } else {
          alert('Помилка при видаленні');
        }
      });
    });
  
    document.querySelectorAll('.export-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const data = JSON.parse(btn.dataset.full);
        const { jsPDF } = window.jspdf;
  
        // підключення шрифту
        jsPDF.API.events.push(['addFonts', function () {
          this.addFileToVFS("NotoSans-Regular.ttf", NOTO_SANS_BASE64);
          this.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
        }]);
  
        const doc = new jsPDF();
        doc.setFont("NotoSans");
  
        const margin = 10;
        let y = 20;
  
        doc.setFontSize(14);
        doc.text(`Дата: ${new Date(data.timestamp).toLocaleString('uk-UA')}`, margin, y);
        y += 10;
  
        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(`Текст: ${data.input_text}`, 180);
        doc.text(splitText, margin, y);
        y += splitText.length * 7;
  
        doc.text(`Тональність: ${data.results.sentiment?.label || '—'}`, margin, y); y += 10;
        doc.text(`Токсичність: ${data.results.toxicity?.label || '—'}`, margin, y); y += 10;
        doc.text(`Тематика: ${(data.results.topics || []).join(', ') || '—'}`, margin, y); y += 10;
  
        const summaryText = doc.splitTextToSize(`Резюме: ${data.summary || '—'}`, 180);
        doc.text(summaryText, margin, y);
  
        doc.save(`analysis-${data.id || Date.now()}.pdf`);
      });
    });
  
    document.getElementById('clearHistoryBtn').addEventListener('click', async () => {
      if (!confirm('Очистити всю історію?')) return;
  
      const res = await fetch('/api/delete_history', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
  
      if (res.ok) {
        historyContainer.innerHTML = '<p>Історію очищено.</p>';
      } else {
        alert('Помилка при очищенні історії');
      }
    });
  });
  
  closeModal.addEventListener('click', () => modal.classList.add('hidden'));
  window.addEventListener('click', e => {
    if (e.target === modal) modal.classList.add('hidden');
  });
  
  const searchInput = document.getElementById('searchInput');
  const filterDate = document.getElementById('filterDate');
  
  function filterHistory() {
    const keyword = searchInput.value.toLowerCase();
    const selectedDate = filterDate.value;
    const cards = document.querySelectorAll('.analysis-card');
  
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const dateMatch = selectedDate ? card.innerHTML.includes(selectedDate) : true;
      const keywordMatch = keyword ? text.includes(keyword) : true;
      card.style.display = (dateMatch && keywordMatch) ? 'block' : 'none';
    });
  }
  
  searchInput?.addEventListener('input', filterHistory);
  filterDate?.addEventListener('change', filterHistory);

  
