const formEditarPerfil = document.getElementById("formEditarPerfil");
const inputNome = document.getElementById("inputNome");
const inputEmail = document.getElementById("inputEmail");
const inputFoto = document.getElementById("inputFoto");
const previewFoto = document.getElementById("previewFoto");


async function carregarEdicao() {

    try {

        const resposta = await fetch("/me");

        const dados = await resposta.json();

        if (!resposta.ok || !dados.autenticado) {

            alert("Sua sessão expirou. Faça login novamente.");

            window.location.href = "/index.html";

            return;
        }

        inputNome.value = dados.usuario.nome;
        inputEmail.value = dados.usuario.email;

        if (dados.usuario.foto) {
            previewFoto.src = dados.usuario.foto;
        }

    } catch (erro) {

        console.error("Erro ao carregar perfil:", erro);

        alert("Não foi possível carregar seus dados. Tente novamente.");

    }

}


formEditarPerfil.addEventListener("submit", async (event) => {

    event.preventDefault();

    const confirma = confirm("Você deseja salvar essas alterações?");

    if (!confirma) {
        return;
    }


    const nome = inputNome.value.trim();
    const email = inputEmail.value.trim();


    if (!nome || !email) {

        alert("Preencha todos os campos.");

        return;
    }


    // Cria o FormData somente agora
    const formulario = new FormData();

    formulario.append("nome", nome);
    formulario.append("email", email);


    // Só adiciona a foto se o usuário tiver escolhido uma
    if (inputFoto.files[0]) {

        formulario.append("foto", inputFoto.files[0]);

    }


    try {

        const resposta = await fetch("/perfil", {

            method: "PUT",

            body: formulario

        });


        const dados = await resposta.json();


        if (!resposta.ok) {

            alert(dados.mensagem || "Erro ao atualizar perfil.");

            return;
        }


        alert("Perfil atualizado com sucesso!");

        window.location.href = "/perfil";


    } catch (erro) {

        console.error("Erro:", erro);

        alert("Erro ao conectar com o servidor.");

    }

});


inputFoto.addEventListener("change", () => {

    const arquivo = inputFoto.files[0];


    if (!arquivo) {
        return;
    }


    const url = URL.createObjectURL(arquivo);

    previewFoto.src = url;

});


carregarEdicao();