create table population.population (
  id integer not null
  , year integer not null
  , population bigint not null
  , population_man bigint not null
  , population_woman bigint not null
  , primary key (id, year)
);
