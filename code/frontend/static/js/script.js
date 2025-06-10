let sentimentChart = null;

document.getElementById('analyzeBtn').addEventListener('click', async () => {
  const text = document.getElementById('inputText').value.trim();
  const sentimentText = document.getElementById('mainSentimentText');
  const toxicityText = document.getElementById('toxicityResult');
  const results = document.getElementById('results');
  const loader = document.getElementById('baseLoader');
  const alertBox = document.getElementById('toxicityAlert');
  const toxCtaBlock = document.getElementById('toxCtaBlock');

  if (!text) {
    alert('Будь ласка, введіть текст.');
    return;
  }

  // скидаємо попередні результати
  loader.classList.remove('hidden');
  results.classList.add('hidden');
  alertBox.classList.add('hidden');
  toxCtaBlock.classList.add('hidden');

  try {
    const response = await fetch('/api/analyze_base', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) throw new Error('Помилка при аналізі');

    const data = await response.json();
    const sentiment = data.results.sentiment;
    const toxicity = data.results.toxicity;

    // --- SENTIMENT CHART ---
    const scores = sentiment.scores;
    const ctx = document.getElementById('sentimentChart').getContext('2d');
    if (sentimentChart) sentimentChart.destroy();

    sentimentChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Позитивний', 'Нейтральний', 'Негативний'],
        datasets: [{
          data: [
            scores.positive,
            scores.neutral,
            scores.negative
          ],
          backgroundColor: ['#10b981', '#facc15', '#ef4444'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.label}: ${(context.raw * 100).toFixed(1)}%`;
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

    sentimentText.textContent = `Основний тон: ${labelMap[sentiment.label] || 'Невідомо'}`;

    // --- TOXICITY ---
    const toxScore = toxicity.scores.toxic;
    const toxLabel = toxicity.label === 'toxic'
      ? 'Текст містить токсичність!'
      : 'Текст не є токсичним.';

    toxicityText.textContent = toxLabel;

    // скидаємо класи
    alertBox.className = 'alert-box';
    alertBox.classList.add('hidden');
    toxCtaBlock.classList.add('hidden');

    if (toxicity.label === 'toxic') {
      if (toxScore > 0.7) {
        alertBox.textContent = 'Увага! Виявлено високу токсичність.';
        alertBox.classList.add('alert-danger');
      } else {
        alertBox.textContent = 'Попередження: текст містить помірну токсичність.';
        alertBox.classList.add('alert-warning');
      }
      alertBox.classList.remove('hidden');
      toxCtaBlock.classList.remove('hidden');
    }

    results.classList.remove('hidden');
  } catch (error) {
    alert('Сталася помилка. Спробуйте ще раз.');
    console.error(error);
  } finally {
    loader.classList.add('hidden');
  }
});
