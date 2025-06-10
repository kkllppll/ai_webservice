let sentimentChart = null;
let toxicityChart = null;


document.getElementById('analyzeBtn').addEventListener('click', async () => {
  const text = document.getElementById('inputText').value.trim();
  const resultsBlock = document.getElementById('results');
  const loader = document.getElementById('baseLoader');

  if (!text) {
    alert('Будь ласка, введіть текст.');
    return;
  }

  loader.classList.remove('hidden'); // показуємо

  try {
    const user = await new Promise(resolve => {
      const unsubscribe = firebase.auth().onAuthStateChanged(user => {
        unsubscribe(); // відписка одразу після отримання
        resolve(user);
      });
    });
    
    if (!user) {
      alert("Користувача не знайдено. Увійдіть у систему.");
      window.location.href = "/login";
      return;
    }
    
    const token = await user.getIdToken(true); // отримаємо новий токен
    

    // основний аналіз
    const response = await fetch('/api/full-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ text })
    });

    const data = await response.json();
    console.log("FULL RESPONSE", data);

    if (!response.ok || data.error) {
      alert("Сервер повернув помилку: " + (data.error || "Невідома помилка"));
      return;
    }

    const sentimentScores = data.results.sentiment?.scores;
    const toxicity = data.results.toxicity;
    const topics = data.results.topics;
    const summary = data.summary;

    if (!sentimentScores || !toxicity) {
      alert("Некоректна відповідь від сервера.");
      return;
    }

    // візуалізація настроїв
    const ctx = document.getElementById('sentimentChart').getContext('2d');
    if (sentimentChart) {
      sentimentChart.destroy();
    }

    sentimentChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Позитивний', 'Нейтральний', 'Негативний'],
        datasets: [{
          data: [
            sentimentScores.positive,
            sentimentScores.neutral,
            sentimentScores.negative
          ],
          backgroundColor: ['#10b981', '#facc15', '#ef4444'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                size: 14
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                return `${label}: ${(value * 100).toFixed(1)}%`;
              }
            }
          }
        }
      }
    });
    
    const labelMap = {
      positive: 'Позитивний',
      neutral: 'Нейтральний',
      negative: 'Негативний'
    };
    
    const mainLabel = data.results.sentiment.label;
    document.getElementById('mainSentimentText').textContent = `Основний тон: ${labelMap[mainLabel] || 'Невідомо'}`;
    

    // т
    if (toxicityChart) {
      toxicityChart.destroy();
    }
    
    const toxicValue = toxicity.scores.toxic;
    
    const color = toxicValue > 0.7
      ? '#ef4444' // червоний
      : toxicValue > 0.3
        ? '#facc15' // жовтий
        : '#10b981'; // зелений
    
    const options = {
      series: [toxicValue * 100],
      chart: {
        height: 250,
        type: 'radialBar'
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: '60%'
          },
          dataLabels: {
            name: {
              show: true,
              fontSize: '16px'
            },
            value: {
              formatter: val => val.toFixed(1) + '%',
              fontSize: '22px'
            }
          }
        }
      },
      labels: ['Токсичність'],
      colors: [color]
    };
    
    toxicityChart = new ApexCharts(document.querySelector("#toxicityChart"), options);
    toxicityChart.render();
    
    const alertBox = document.getElementById('toxicityAlert');
    alertBox.classList.add('hidden');
    alertBox.className = 'alert-box'; // скидаємо стилі

    if (toxicValue > 0.7) {
      alertBox.textContent = 'Увага! Виявлено високу токсичність у тексті.';
      alertBox.classList.add('alert-danger');
      alertBox.classList.remove('hidden');
    } else if (toxicValue > 0.3) {
      alertBox.textContent = 'Попередження: текст містить помірну токсичність.';
      alertBox.classList.add('alert-warning');
      alertBox.classList.remove('hidden');
    }

    // тематики
    const topicContainer = document.getElementById('topics');
    topicContainer.innerHTML = '';
    if (Array.isArray(topics)) {
      topics.forEach(topic => {
        const span = document.createElement('span');
        span.textContent = topic.replace(/_/g, ' ');
        span.className = 'topic-badge';
        topicContainer.appendChild(span);
      });
      
    }

    // summary
    document.getElementById('summaryText').textContent = summary || '—';

    const copyBtn = document.getElementById('copySummaryBtn');
    const copyStatus = document.getElementById('copyStatus');

    copyBtn.addEventListener('click', () => {
      const text = document.getElementById('summaryText').textContent;

      navigator.clipboard.writeText(text).then(() => {
        copyStatus.classList.remove('hidden');
        setTimeout(() => copyStatus.classList.add('hidden'), 2000);
      });
  });

  loader.classList.add('hidden'); // ховаємо


    resultsBlock.classList.remove('hidden');

    //  чекаємо щоб аналіз точно зберігся в історії
    await new Promise(resolve => setTimeout(resolve, 1000));

    // завантаження попередніх аналізів
    const historyRes = await fetch('/api/analyses', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });


    const historyData = await historyRes.json();

    const recentContainer = document.getElementById('recentAnalyses');
    recentContainer.innerHTML = ''; // очищення

    const lastThree = historyData.slice(0, 3); // найновіші 3

    lastThree.forEach((analysis, index) => {
      const card = document.createElement('div');
      card.className = 'analysis-card' + (index === 0 ? ' latest' : '');
      
      const toneMap = {
        positive: 'Позитивна',
        neutral: 'Нейтральна',
        negative: 'Негативна'
      };
      
      const toxMap = {
        toxic: 'Токсичний',
        'non-toxic': 'Нетоксичний'
      };
      
      const translatedTone = toneMap[analysis.results.sentiment.label] || analysis.results.sentiment.label;
      const translatedTox = toxMap[analysis.results.toxicity.label] || analysis.results.toxicity.label;
    
      

      card.innerHTML = `
        <p><strong>Дата:</strong> ${new Date(analysis.timestamp || Date.now()).toLocaleString()}</p>
        <p><strong>Превʼю:</strong> ${analysis.preview_text}</p>
        <p><strong>Тональність:</strong> ${translatedTone}</p>
        <p><strong>Токсичність:</strong> ${translatedTox}</p>
      `;

      recentContainer.appendChild(card);
    });

    document.getElementById('recentAnalysesSection').classList.remove('hidden');

  } catch (error) {
    alert('Сталася помилка. Спробуйте ще раз.');
    console.error(error);
  }
});


async function regenerateText(mode) {
  const input = document.getElementById('inputText').value.trim();
  if (!input) return alert("Немає тексту для перегенерації.");

  const prompt = mode === 'lower'
    ? `Перепиши цей текст, зроби його менш токсичним:\n"${input}"`
    : `Перепиши цей текст, зроби його провокативнішим і токсичнішим:\n"${input}"`;

  const res = await fetch('/api/regenerate_text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });

  const data = await res.json();
  const outputBox = document.getElementById('regeneratedResult');
  if (data.text) {
    outputBox.textContent = data.text;
  } else {
    outputBox.textContent = "Сталася помилка при генерації.";
  }
}


document.getElementById('downloadPdfBtn')?.addEventListener('click', () => {
  const element = document.querySelector('.container'); // або інший контейнер
  const opt = {
    margin:       0.5,
    filename:     `analyze-${Date.now()}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
});




async function handleFile() {
  const file = document.getElementById('uploadFile').files[0];
  if (!file) return alert("Оберіть файл для аналізу.");

  const user = await new Promise(resolve => {
    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      unsubscribe();
      resolve(user);
    });
  });

  if (!user) {
    alert("Будь ласка, увійдіть у систему.");
    window.location.href = '/login';
    return;
  }

  const token = await user.getIdToken(true);
  const formData = new FormData();

  const selectedLang = document.getElementById('audioLanguage')?.value || "auto";
  formData.append('language', selectedLang);

  formData.append('file', file);

  const loader = document.getElementById('baseLoader');
  loader.classList.remove('hidden');

  try {
    const res = await fetch('/api/analyze_file_full', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      body: formData
    });

    const data = await res.json();
    loader.classList.add('hidden');

    if (!res.ok || data.error) {
      alert("Помилка аналізу файлу: " + (data.error || 'Невідомо'));
      return;
    }

    // вставляємо весь текст у textarea (повний текст з файлу)
    document.getElementById('inputText').value = data.input_text;

    // автоматично натискаємо "проаналізувати"
    document.getElementById('analyzeBtn').click();

  } catch (err) {
    loader.classList.add('hidden');
    alert("Сталася помилка при обробці файлу.");
    console.error(err);
  }
}

document.getElementById('uploadFile').addEventListener('change', () => {
  const file = document.getElementById('uploadFile').files[0];
  const audioLangBlock = document.getElementById('languageSelectBlock');

  // якщо файл існує та розширення аудіо
  if (file && /\.(mp3|wav|m4a)$/i.test(file.name)) {
    audioLangBlock.classList.remove('hidden');  // показуємо select
  } else {
    audioLangBlock.classList.add('hidden');  // ховаємо select
  }
});
