ALTER TABLE public.contas
    ADD COLUMN IF NOT EXISTS termos_versao_aceita VARCHAR(20),
    ADD COLUMN IF NOT EXISTS termos_aceitos_em TIMESTAMPTZ;
