const formPost = document.getElementById("formPost");
const selectBairro = document.getElementById("selectBairro");
const inputOutroBairro = document.getElementById("inputOutroBairro");
const fotoPerfil = document.getElementById("fotoPerfil");
const fotoPost = document.getElementById("fotoPost");

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

    alert("Não foi possível conectar ao servidor.");

    return null;
}


}

// =============================================================================
// Publicar post
// =============================================================================

formPost.addEventListener("submit", async (event) => {


event.preventDefault();

const confirmacao = confirm(
    "Você deseja publicar esse post?"
);

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

    alert("Selecione o tipo da publicação.");

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

formulario.append(
    "whatsapp",
    document.getElementById("whatsapp").value
);


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

    const resposta = await fetch("/posts", {
        method: "POST",
        body: formulario
    });

    const data = await resposta.json();

    console.log("Resposta do servidor:", data);


    // =====================================================================
    // Erros
    // =====================================================================

    if (!resposta.ok) {

        if (resposta.status === 401) {

            alert(
                "Sua sessão expirou. Faça login novamente."
            );

            window.location.href = "/index.html";

            return;
        }

        alert(
            data.mensagem ||
            "Não foi possível publicar o post."
        );

        return;
    }


    // =====================================================================
    // Sucesso
    // =====================================================================

    if (data.sucesso) {

        alert(
            data.mensagem ||
            "Post publicado com sucesso."
        );

        window.location.href = "/main";

        return;
    }

} catch (erro) {

    console.error(
        "Erro ao publicar post:",
        erro
    );

    alert(
        "Erro ao conectar com o servidor. Tente novamente."
    );
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

    const confirmacao = confirm(
        "Deseja realmente sair?"
    );

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

        alert(
            data.mensagem ||
            "Não foi possível sair."
        );

    } catch (erro) {

        console.error(
            "Erro ao realizar logout:",
            erro
        );

        alert(
            "Erro ao conectar com o servidor."
        );
    }

});


}

// =============================================================================
// Inicialização
// =============================================================================

carregarUsuario();
