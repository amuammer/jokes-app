create table jokes(
  id int unique not null,
  type varchar(100) not null,
  setup varchar(1000) not null,
  punchline varchar(1000) not null
);
