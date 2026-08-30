const params = new URLSearchParams(window.location.search);
const formEditarPost = document.getElementById("formEditarPost");
const postId = params.get("id");

const inputTitulo = document.getElementById("inputTitulo");
const selectTipo = document.getElementById("selectTipo");
const selectBairro = document.getElementById("selectBairro");
const inputOutroBairro = document.getElementById("inputOutroBairro");
const textareaDescricao = document.getElementById("textareaDescricao");
const inputWhatsapp = document.getElementById("inputWhatsapp");
const nomeUsuario = document.getElementById("usuario");
const fotoPerfil = document.getElementById("fotoPerfil");

function setloading(btn, textoOriginal, carregando){
    btn.disabled = carregando;
    btn.textContent = carregando ? "Aguarde..." : textoOriginal;
    btn.style.opacity = carregando ? "0.7" : "1";
}

async function carregarUsuario() {

    try {

        const resposta = await fetch("/me");

        const dados = await resposta.json();

        if (!resposta.ok) {

            if (resposta.status === 401) {
                mostrarToast("Sua sessão expirou. Faça login novamente.", "info");
                window.location.href = "/index.html";
            }

            return null;
        }

        nomeUsuario.textContent = dados.usuario.nome;

        if (dados.usuario.foto) {

            fotoPerfil.src = dados.usuario.foto;

        } else {

            fotoPerfil.src = "/img/avatar-padrao.jpg";

        }

        return dados.usuario;

    } catch (erro) {

        console.error("Erro ao carregar usuário:", erro);

        return null;
    }
}


async function carregarPost() {

    if (!postId) {
        mostrarToast("Publicação não encontrada.", "erro");
        window.location.href = "/main";
        return;
    }

    try {

        const resposta = await fetch(`/posts/${postId}`);

        const dados = await resposta.json();

        if (!resposta.ok) {

            if (resposta.status === 401) {
                mostrarToast("Sua sessão expirou. Faça login novamente.", "info");
                window.location.href = "/index.html";
                return;
            }

            if (resposta.status === 404) {
                mostrarToast("Publicação não encontrada.", "erro");
                window.location.href = "/main";
                return;
            }

            mostrarToast(dados.mensagem || "Não foi possível carregar a publicação.", "erro");
            window.location.href = "/main";
            return;
        }

        inputTitulo.value = dados.titulo;
        selectTipo.value = dados.tipo;

        if (
            dados.bairro === "Bangu" ||
            dados.bairro === "Santíssimo" ||
            dados.bairro === "Senador Camará" ||
            dados.bairro === "Viegas" ||
            dados.bairro === "Padre Miguel" ||
            dados.bairro === "Realengo"
        ) {

            selectBairro.value = dados.bairro;

        } else {

            selectBairro.value = "Outro";

            inputOutroBairro.style.display = "block";
            inputOutroBairro.required = true;

            inputOutroBairro.value = dados.bairro;
        }

        textareaDescricao.value = dados.descricao;
        inputWhatsapp.value = dados.whatsapp;

    } catch (erro) {

        console.error("Erro ao carregar publicação:", erro);

        mostrarToast("Erro ao conectar com o servidor.", "erro");
        window.location.href = "/main";
    }
}
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

formEditarPost.addEventListener('submit',async (event) =>{
    event.preventDefault();

            const btn = event.submitter || formEditarPost.querySelector("button[type='submit']");

            // Validação do WhatsApp
const whatsappLimpo = document.getElementById("inputWhatsapp").value.replace(/\D/g, "");

if (whatsappLimpo.length < 10 || whatsappLimpo.length > 11) {
    mostrarToast("Informe um número de WhatsApp válido com DDD. Ex: 21999999999", "aviso");
    return;
}


    const confirmar = await confirmarAcao("Você deseja salvar essas alterações?", "Salvar", "neutro");
    
    if(!confirmar){
        return
    };
    
    let bairro = selectBairro.value;

    if (bairro === "Outro") {
        bairro = inputOutroBairro.value.trim();
    }

    if (!bairro) {
    mostrarToast("Informe o bairro.", "aviso");
    return;
}


   const dadosAtualizados = {
    titulo: inputTitulo.value,
    tipo: selectTipo.value,
    bairro: bairro,
    descricao: textareaDescricao.value,
    whatsapp: whatsappLimpo
};

    try {

        setloading(btn, "Salvar alterações", true);

    const resposta = await fetch(`/posts/${postId}`, {
        method: "PUT",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(dadosAtualizados)
    });

    const dados = await resposta.json();

    if (!resposta.ok) {

        if (resposta.status === 401) {
            mostrarToast("Sua sessão expirou. Faça login novamente.", "info");
            window.location.href = "/index.html";
            return;
        }

        if (resposta.status === 403) {
            mostrarToast("Você não pode editar essa publicação.", "erro");
            window.location.href = "/main";
            return;
        }

        if (resposta.status === 404) {
            mostrarToast("Publicação não encontrada.", "erro");
            window.location.href = "/main";
            return;
        }

        mostrarToast(dados.mensagem || "Não foi possível atualizar a publicação.", "erro");
        return;
    }

    if (dados.sucesso) {

        mostrarToast(dados.mensagem || "Publicação atualizada com sucesso.", "sucesso");

        window.location.href = "/main";
        return;
    }

} catch (erro) {

    console.error("Erro ao atualizar publicação:", erro);

    mostrarToast("Erro ao conectar com o servidor.", "erro");

} finally{
    setloading(btn, "Salvar alterações", false);
}
})
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

            mostrarToast(data.mensagem || "Não foi possível sair.", "erro");

        } catch (erro) {

            console.error("Erro ao realizar logout:", erro);

            mostrarToast("Erro ao conectar com o servidor.", "erro");
        } 
    });
}
async function iniciarPagina() {

    const usuario = await carregarUsuario();

    if (!usuario) {
        return;
    }

    await carregarPost();
}

iniciarPagina();