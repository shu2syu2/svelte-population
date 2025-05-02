<script>
  import { onMount, tick } from 'svelte';
  import { Chart, registerables } from 'chart.js';

  Chart.register(...registerables);

  export let data;
  let year = data.year;
  let startYear = data.minYear;
  let endYear = data.maxYear;

  let pieCanvas;
  let lineCanvas;
  let pieChart;
  let lineChart;

  // ソート状態
  let sortKey = 'id';
  let sortOrder = 'asc';

  let showData = false;
  let displayedYear = null;

  
  // 表示用データ（並び替えられる）
  $: sortedData = [...data.populationData].sort((a, b) => {
  let valA = a[sortKey];
  let valB = b[sortKey];

  // 数値として扱えるように変換
  const isNumeric = ['population', 'population_man', 'population_woman'].includes(sortKey);
  if (isNumeric) {
    valA = Number(valA);
    valB = Number(valB);
  }

  if (typeof valA === 'string') {
    return sortOrder === 'asc'
      ? valA.localeCompare(valB)
      : valB.localeCompare(valA);
  } else {
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  }
});


  function toggleSort(key) {
    if (sortKey === key) {
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = key;
      sortOrder = 'asc';
    }
  }

  function goToYear() {
    const y = parseInt(year);
    if (!isNaN(y)) {
      // ページをリロードして表示する
      window.location.href = `?year=${y}`;
    }
  }


  onMount(async () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('year')) {
      showData = true;
      displayedYear = params.get('year');
    }
  
    await tick();

    if (!pieCanvas || !lineCanvas || !data.populationData?.length) return;

    const totalMan = data.populationData.reduce((sum, row) => sum + Number(row.population_man), 0);
    const totalWoman = data.populationData.reduce((sum, row) => sum + Number(row.population_woman), 0);

    // 円グラフ（全国男女比）
    if (pieChart) pieChart.destroy();
    pieChart = new Chart(pieCanvas, {
      type: 'pie',
      data: {
        labels: ['男性', '女性'],
        datasets: [{
          data: [totalMan, totalWoman],
          backgroundColor: ['#4A90E2', '#E94E77']
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `${year}年の全国男女比`
          }
        }
      }
    });

    // 折れ線グラフ（都道府県ごとの総人口・男性・女性）
    const labels = data.populationData.map(row => row.name);
    const total = data.populationData.map(row => row.population);
    const men = data.populationData.map(row => row.population_man);
    const women = data.populationData.map(row => row.population_woman);

    if (lineChart) lineChart.destroy();
    lineChart = new Chart(lineCanvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '総人口',
            data: total,
            borderColor: '#333',
            backgroundColor: 'rgba(100,100,100,0.1)',
            fill: false,
            tension: 0.0,
            pointRadius: 2
          },
          {
            label: '男性',
            data: men,
            borderColor: '#4A90E2',
            backgroundColor: 'rgba(74,144,226,0.2)',
            fill: false,
            tension: 0.0,
            pointRadius: 2
          },
          {
            label: '女性',
            data: women,
            borderColor: '#E94E77',
            backgroundColor: 'rgba(233,78,119,0.2)',
            fill: false,
            tension: 0.0,
            pointRadius: 2
          }
        ]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `${year}年 都道府県別人口推移（男女別）`
          },
          legend: {
            position: 'bottom'
          }
        },
        scales: {
          x: {
            ticks: {
              autoSkip: false,       // ← ★県名をすべて表示
              maxRotation: 90,
              minRotation: 60
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (v) => Number(v).toLocaleString()
            }
          }
        }
      }
    });

  });
</script>

<h1>人口一覧</h1>

<!-- 年入力 -->
<section>
  <h2>年を選択</h2>
  <div>
    <label>
      <input bind:value={year} type="number" min={startYear} max={endYear} />
    </label>
    <button on:click={goToYear}>表示</button>
    {#if displayedYear}
      <span style="margin-left: 1em;">検索結果：{displayedYear}年人口一覧</span>
    {/if}
  </div>
</section>

<!-- 円グラフ -->
{#if showData && data.populationData?.length}
<section>
  <h2>全国男女比</h2>
  <div class="charts">
    <canvas
      bind:this={pieCanvas}
      width="400"
      height="400"
      style="width: 400px; height: 400px;"
    ></canvas>
  </div>
</section>
{/if}

<!-- 折れ線グラフ -->
{#if showData && data.populationData?.length}
<section>
  <h2>都道府県別人口推移（男女別）</h2>
  <div class="line-chart-scroll">
    <canvas
      bind:this={lineCanvas}
      width="1000"
      height="400"
      style="width: 100%; height: 400px; display: block;"
    ></canvas>
  </div>
</section>
{/if}

<!-- 表 -->
{#if showData && data.populationData?.length}
<section class="table-wrapper">
  <h2>都道府県別人口一覧(千人)</h2>
  <div class="table-container">
    <table>
  <thead>
    <tr>
      <th on:click={() => toggleSort('id')}>
        ID {sortKey === 'id' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
      </th>
      <th on:click={() => toggleSort('name')}>
        都道府県 {sortKey === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
      </th>
      <th on:click={() => toggleSort('population')}>
        総人口 {sortKey === 'population' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
      </th>
      <th on:click={() => toggleSort('population_man')}>
        男性 {sortKey === 'population_man' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
      </th>
      <th on:click={() => toggleSort('population_woman')}>
        女性 {sortKey === 'population_woman' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
      </th>
    </tr>
  </thead>
  <tbody>
    {#each sortedData as row}
      <tr>
        <td>{row.id}</td>
        <td>{row.name}</td>
        <td>{Number(row.population).toLocaleString()}</td>
        <td>{Number(row.population_man).toLocaleString()}</td>
        <td>{Number(row.population_woman).toLocaleString()}</td>
      </tr>
    {/each}
  </tbody>
</table>
  </div>
</section>
{/if}

<style>
  h2 {
    font-size: 1.1rem;
    margin: 1rem 0 0.5rem;
    padding-bottom: 4px;
  }

  section {
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #999; /* ← セクション区切り線 */
  }

  .table-wrapper {
    width: 50%;
    float: left;
    box-sizing: border-box;
    padding-right: 10px;
  }

  .table-container {
    overflow-x: auto;
    max-width: 100%;
  }

  table {
    border-collapse: collapse;
    min-width: 600px;
    width: 100%;
    font-size: 0.9rem;
  }

  th, td {
    border: 1px solid #444;
    padding: 4px 8px;
    text-align: right;
  }

  th:first-child, td:first-child {
    text-align: left;
  }

  thead {
    background-color: #f0f0f0;
  }

  tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  .line-chart-scroll {
    width: 80vw;              /* 画面の80%幅 */
    margin-top: 20px;
    border: 1px solid #ccc;
    overflow-x: auto;
  }

  .line-chart-scroll canvas {
    display: block;
  }
</style>


