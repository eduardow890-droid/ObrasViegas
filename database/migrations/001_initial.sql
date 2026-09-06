DO $$
BEGIN
    CREATE TYPE public.tipo_conta_enum AS ENUM ('usuario', 'loja', 'admin');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS public.contas (
    id SERIAL PRIMARY KEY,
    tipo public.tipo_conta_enum NOT NULL,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    contato TEXT,
    bairro TEXT,
    categoria TEXT,
    foto TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.posts (
    id SERIAL PRIMARY KEY,
    conta_id INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    titulo TEXT NOT NULL,
    bairro TEXT NOT NULL,
    descricao TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    foto TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT posts_conta_id_fkey
        FOREIGN KEY (conta_id)
        REFERENCES public.contas(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_posts_conta_id
    ON public.posts USING btree (conta_id);

CREATE INDEX IF NOT EXISTS idx_posts_created_at
    ON public.posts USING btree (created_at DESC);

CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR(255) PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);
