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


async function carregarUsuario() {

    try {

        const resposta = await fetch("/me");

        const dados = await resposta.json();

        if (!resposta.ok) {

            if (resposta.status === 401) {
                alert("Sua sessão expirou. Faça login novamente.");
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
        alert("Publicação não encontrada.");
        window.location.href = "/main";
        return;
    }

    try {

        const resposta = await fetch(`/posts/${postId}`);

        const dados = await resposta.json();

        if (!resposta.ok) {

            if (resposta.status === 401) {
                alert("Sua sessão expirou. Faça login novamente.");
                window.location.href = "/index.html";
                return;
            }

            if (resposta.status === 404) {
                alert("Publicação não encontrada.");
                window.location.href = "/main";
                return;
            }

            alert(dados.mensagem || "Não foi possível carregar a publicação.");
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

        alert("Erro ao conectar com o servidor.");
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

    const confirmar = confirm("Você deseja salvar essas alterações?")
    
    if(!confirmar){
        return
    };
    
    let bairro = selectBairro.value;

    if (bairro === "Outro") {
        bairro = inputOutroBairro.value.trim();
    }

    if (!bairro) {
    alert("Informe o bairro.");
    return;
}


   const dadosAtualizados = {
    titulo: inputTitulo.value,
    tipo: selectTipo.value,
    bairro: bairro,
    descricao: textareaDescricao.value,
    whatsapp: inputWhatsapp.value
};

    try {

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
            alert("Sua sessão expirou. Faça login novamente.");
            window.location.href = "/index.html";
            return;
        }

        if (resposta.status === 403) {
            alert("Você não pode editar essa publicação.");
            window.location.href = "/main";
            return;
        }

        if (resposta.status === 404) {
            alert("Publicação não encontrada.");
            window.location.href = "/main";
            return;
        }

        alert(dados.mensagem || "Não foi possível atualizar a publicação.");
        return;
    }

    if (dados.sucesso) {

        alert(dados.mensagem || "Publicação atualizada com sucesso.");

        window.location.href = "/main";
        return;
    }

} catch (erro) {

    console.error("Erro ao atualizar publicação:", erro);

    alert("Erro ao conectar com o servidor.");
}
})
const btnLogout = document.getElementById("btnLogout");

if (btnLogout) {
    btnLogout.addEventListener("click", async () => {

        const confirmacao = confirm("Deseja realmente sair?");

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

            alert(data.mensagem || "Não foi possível sair.");

        } catch (erro) {

            console.error("Erro ao realizar logout:", erro);

            alert("Erro ao conectar com o servidor.");
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