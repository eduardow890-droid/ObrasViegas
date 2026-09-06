const formEditarPerfil = document.getElementById("formEditarPerfil");
const inputNome = document.getElementById("inputNome");
const inputEmail = document.getElementById("inputEmail");
const inputFoto = document.getElementById("inputFoto");
const previewFoto = document.getElementById("previewFoto");
const camposLoja = document.getElementById("camposLoja");
const inputContato = document.getElementById("inputContato");
const inputBairro = document.getElementById("inputBairro");
const inputCategoria = document.getElementById("inputCategoria");

function definirCamposComerciaisVisiveis(visiveis) {
    camposLoja.hidden = !visiveis;
    inputContato.disabled = !visiveis;
    inputBairro.disabled = !visiveis;
    inputCategoria.disabled = !visiveis;
}

function setloading(btn, textoOriginal, carregando){
    btn.disabled = carregando;
    btn.textContent = carregando ? "Aguarde..." : textoOriginal;
    btn.style.opacity = carregando ? "0.7" : "1";
}


async function carregarEdicao() {

    try {

        const resposta = await fetch("/me");

        const dados = await resposta.json();

        if (!resposta.ok || !dados.autenticado) {

            mostrarToast("Sua sessão expirou. Faça login novamente.", "aviso");

            window.location.href = "/index.html";

            return;
        }

        inputNome.value = dados.usuario.nome;
        inputEmail.value = dados.usuario.email;

        const eLoja = dados.usuario.tipo === "loja";
        definirCamposComerciaisVisiveis(eLoja);

        if (eLoja && camposLoja) {
            inputContato.value = dados.usuario.contato || "";
            inputBairro.value = dados.usuario.bairro || "";
            inputCategoria.value = dados.usuario.categoria || "";
        }

        if (dados.usuario.foto) {
            previewFoto.src = dados.usuario.foto;
        }

    } catch (erro) {

        console.error("Erro ao carregar perfil:", erro);

        mostrarToast("Não foi possível carregar seus dados. Tente novamente.", "erro");

    }

}


formEditarPerfil.addEventListener("submit", async (event) => {

    event.preventDefault();

        const btn = event.submitter || formEditarPerfil.querySelector("button[type='submit']");


   const confirma = await confirmarAcao("Você deseja salvar essas alterações?", "Salvar", "neutro");
    if (!confirma) {
        return;
    }


    const nome = inputNome.value.trim();
    const email = inputEmail.value.trim();


    if (!nome || !email) {

        mostrarToast("Preencha todos os campos.", "aviso");

        return;
    }


    // Cria o FormData somente agora
    const formulario = new FormData();

    formulario.append("nome", nome);
    formulario.append("email", email);

    if (camposLoja && !camposLoja.hidden) {
        const contato = inputContato.value.trim();
        const bairro = inputBairro.value.trim();
        const categoria = inputCategoria.value.trim();

        if (!contato || !bairro || !categoria) {
            mostrarToast("Preencha os dados comerciais da loja.", "aviso");
            return;
        }

        formulario.append("contato", contato);
        formulario.append("bairro", bairro);
        formulario.append("categoria", categoria);
    }


    // Só adiciona a foto se o usuário tiver escolhido uma
    if (inputFoto.files[0]) {

        formulario.append("foto", inputFoto.files[0]);

    }


    try {

        setloading(btn, "Salvar alterações", true);

        const resposta = await fetch("/perfil", {

            method: "PUT",

            body: formulario

        });


        const dados = await resposta.json();


        if (!resposta.ok) {

            mostrarToast(dados.mensagem || "Erro ao atualizar perfil.", "erro");

            return;
        }


        mostrarToast("Perfil atualizado com sucesso!", "sucesso");

        window.location.href = "/perfil";


    } catch (erro) {

        console.error("Erro:", erro);

        mostrarToast("Erro ao conectar com o servidor.", "erro");

    } finally {
        setloading(btn, "Salvar alterações", false)
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