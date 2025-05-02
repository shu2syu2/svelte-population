import { pool } from '$lib/db.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
  const year = Number(url.searchParams.get('year')) || 2005; // デフォルトは2005年

  const res = await pool.query(
    `
    SELECT
      p.id,
      p.name,
      pop.population,
      pop.population_man,
      pop.population_woman
    FROM
      population.prefectures p
    JOIN
      population.population pop
    ON
      p.id = pop.id
    WHERE
      pop.year = $1 and p.id != 0
    ORDER BY
      p.id;
    `,
    [year]
  );

  return {
    year,
    populationData: res.rows
  };
}
