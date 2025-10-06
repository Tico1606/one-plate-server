-- Habilitar extensão unaccent no PostgreSQL
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Verificar se a extensão foi criada
SELECT * FROM pg_extension WHERE extname = 'unaccent';

-- Testar a função unaccent
SELECT unaccent('Pão de Açúcar') as normalized;
