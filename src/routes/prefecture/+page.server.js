import { Pool } from 'pg';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
  const pool = new Pool(); // .envのPGHOST/PGUSERなどを使用

  // 都道府県一覧（ID≠0）
  const prefecturesRes = await pool.query(`
    SELECT id, name FROM population.prefectures WHERE id <> 0 ORDER BY id
  `);

  // 年の範囲（min, max）
  const yearRangeRes = await pool.query(`
    SELECT MIN(year) AS min, MAX(year) AS max FROM population.population
  `);

  // クエリパラメータを取得
  const prefId = url.searchParams.get('prefId');
  const start = url.searchParams.get('start');
  const end = url.searchParams.get('end');

  let populationByRange = [];

  // 入力が揃っていれば人口データを取得
  if (prefId && start && end) {
    const populationRes = await pool.query(
      `
        SELECT year, population, population_man, population_woman
        FROM population.population
        WHERE id = $1 AND year BETWEEN $2 AND $3
        ORDER BY year ASC
      `,
      [prefId, start, end]
    );

    populationByRange = populationRes.rows;
  }

  return {
    prefectures: prefecturesRes.rows,
    minYear: yearRangeRes.rows[0].min,
    maxYear: yearRangeRes.rows[0].max,
    populationByRange
  };
}
