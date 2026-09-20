const formPost = document.getElementById("formPost");
const selectBairro = document.getElementById("selectBairro");
const inputOutroBairro = document.getElementById("inputOutroBairro");
const fotoPerfil = document.getElementById("fotoPerfil");
const fotoPost = document.getElementById("fotoPost");

function setloading(btn, textoOriginal, carregando){
    btn.disabled = carregando;
    btn.textContent = carregando ? "Aguarde..." : textoOriginal;
    btn.style.opacity = carregando ? "0.7" : "1";
}

// =============================================================================
// Carregar usuário
// =============================================================================

async function carregarUsuario() {


try {


    const resposta = await fetch("/me");

    if (!resposta.ok) {

        console.error("Usuário não autenticado.");

        window.location.href = "/index.html";

        return;
    }

    const data = await resposta.json();

    const elementoUsuario = document.getElementById("usuario");

    if (elementoUsuario) {
        elementoUsuario.textContent = data.usuario.nome;
    }

    if (data.usuario.foto && fotoPerfil) {
        fotoPerfil.src = data.usuario.foto;
    }

    return data.usuario;

} catch (erro) {

    console.error("Erro ao carregar usuário:", erro);

    mostrarToast("Não foi possível conectar ao servidor.", "erro");

    return null;
}


}

// =============================================================================
// Publicar post
// =============================================================================

formPost.addEventListener("submit", async (event) => {


event.preventDefault();

        const btn = event.submitter || formPost.querySelector("button[type='submit']");


const confirmacao = await confirmarAcao("Você deseja publicar esse post?", "Publicar", "neutro");
if (!confirmacao) {
    return;
}


// =========================================================================
// Bairro
// =========================================================================

let bairro = selectBairro.value;

if (bairro === "Outro") {
    bairro = inputOutroBairro.value.trim();
}


// =========================================================================
// Tipo
// =========================================================================

const tipoSelecionado = document.querySelector(
    'input[name="tipo"]:checked'
);

if (!tipoSelecionado) {

    mostrarToast("Selecione o tipo da publicação.", "aviso");

    return;
}


// =========================================================================
// FormData
// =========================================================================

const formulario = new FormData();

formulario.append(
    "tipo",
    tipoSelecionado.value
);

formulario.append(
    "titulo",
    document.getElementById("titulo").value
);

formulario.append(
    "bairro",
    bairro
);

formulario.append(
    "descricao",
    document.getElementById("descricao").value
);

const whatsappLimpo = document.getElementById("whatsapp").value.replace(/\D/g, "");

if (whatsappLimpo.length < 10 || whatsappLimpo.length > 11) {
    mostrarToast("Informe um número de WhatsApp válido com DDD. Ex: 21999999999", "aviso");
    return;
}

formulario.append("whatsapp", whatsappLimpo);


// =========================================================================
// Foto
// =========================================================================

if (fotoPost.files.length > 0) {

    formulario.append(
        "foto",
        fotoPost.files[0]
    );
}


// =========================================================================
// Envio
// =========================================================================

try {

    setloading(btn, "Publicar no Feed", true)

    const resposta = await fetch("/posts", {
        method: "POST",
        body: formulario
    });

    const data = await resposta.json();


    // =====================================================================
    // Erros
    // =====================================================================

    if (!resposta.ok) {

        if (resposta.status === 401) {

            mostrarToast(
                "Sua sessão expirou. Faça login novamente.", "info"
            );

            window.location.href = "/index.html";

            return;
        }

        mostrarToast(
            data.mensagem ||
            "Não foi possível publicar o post.", "erro"
        );

        return;
    }


    // =====================================================================
    // Sucesso
    // =====================================================================

    if (data.sucesso) {

        mostrarToast(
            data.mensagem ||
            "Post publicado com sucesso.", "sucesso"
        );

        window.location.href = "/main";

        return;
    }

} catch (erro) {

    console.error(
        "Erro ao publicar post:",
        erro
    );

    mostrarToast(
        "Erro ao conectar com o servidor. Tente novamente.", "erro"
    );
} finally {
    setloading(btn, "Publicar no Feed", false)
}


});

// =============================================================================
// Campo "Outro bairro"
// =============================================================================

selectBairro.addEventListener("change", () => {


if (selectBairro.value === "Outro") {

    inputOutroBairro.style.display = "block";

    inputOutroBairro.required = true;

} else {

    inputOutroBairro.style.display = "none";

    inputOutroBairro.required = false;

    inputOutroBairro.value = "";
}


});

// =============================================================================
// Logout
// =============================================================================

const btnLogout = document.getElementById("btnLogout");

if (btnLogout) {


btnLogout.addEventListener("click", async () => {

 const confirmacao = await confirmarAcao("Deseja realmente sair?", "Sair");

    if (!confirmacao) {
        return;
    }

    try {

        const resposta = await fetch("/logout", {
            method: "POST"
        });

        const data = await resposta.json();


        if (data.sucesso) {

            window.location.href = "/index.html";

            return;
        }

        mostrarToast(
            data.mensagem ||
            "Não foi possível sair.", "erro"
        );

    } catch (erro) {

        console.error(
            "Erro ao realizar logout:",
            erro
        );

        mostrarToast(
            "Erro ao conectar com o servidor.", "erro"
        );
    }

});


}

// =============================================================================
// Inicialização
// =============================================================================

carregarUsuario();
