// =============================================================================
// Supabase Storage
// =============================================================================

const { createClient } = require("@supabase/supabase-js");

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
    : null;

async function uploadParaStorage(bucket, nomeArquivo, buffer, mimetype) {
    if (!supabase) {
        throw new Error("Supabase não configurado.");
    }

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(nomeArquivo, buffer, {
            contentType: mimetype,
            upsert: true
        });

    if (error) {
        throw new Error(`Erro ao enviar imagem: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(nomeArquivo);

    return urlData.publicUrl;
}

async function removerDoStorage(bucket, nomeArquivo) {
    if (!nomeArquivo || !supabase) return;

    await supabase.storage
        .from(bucket)
        .remove([nomeArquivo]);
}

function extrairNomeArquivoStorage(url) {
    if (!url) return null;
    const partes = url.split("/");
    return partes[partes.length - 1];
}

module.exports = {
    uploadParaStorage,
    removerDoStorage,
    extrairNomeArquivoStorage
};