alter table public.anime add column imdb_id text check(imdb_id ~ '^tt[0-9]{5,12}$'), add column trailer_url text, add column synopsis_language text;
update public.anime set synopsis_language='en' where synopsis is not null and synopsis !~ '[ぁ-んァ-ン一-龯А-Яа-я]';
