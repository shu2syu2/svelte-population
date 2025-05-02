import { pool } from '$lib/db.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
  const prefId = url.searchParams.get('prefId');
  const start = parseInt(url.searchParams.get('start'));
  const end = parseInt(url.searchParams.get('end'));

  const prefecturesRes = await pool.query(
    'SELECT id, name FROM population.prefectures WHERE id != 0 ORDER BY id'
  );

  const populationRes = (prefId && start && end)
    ? await pool.query(
        `SELECT * FROM population.population
         WHERE id = $1 AND year BETWEEN $2 AND $3
         ORDER BY year`,
        [prefId, start, end]
      )
    : { rows: [] };

  return {
    prefectures: prefecturesRes.rows,
    population: populationRes.rows,
    prefId,
    start,
    end
  };
}
