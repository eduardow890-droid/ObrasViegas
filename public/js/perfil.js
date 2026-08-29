const nomeUsuario = document.getElementById("nomeUsuario");
const emailUsuario = document.getElementById("emailUsuario");
const totalPosts = document.getElementById("totalPosts");
const totalServicos = document.getElementById("totalServicos");
const totalPedidos = document.getElementById("totalPedidos");
const fotoPerfil = document.getElementById("fotoPerfil");

async function carregarPerfil(){

    try{
        const resposta = await fetch("/me");

        const dados = await resposta.json();

        if(!dados.autenticado){
        window.location.href = "index.html";
        return
        };

        nomeUsuario.textContent = dados.usuario.nome;
        emailUsuario.textContent =  dados.usuario.email;

        if (dados.usuario.foto) {
        fotoPerfil.src = dados.usuario.foto;
        }

    }catch(erro){
        console.error("Erro ao carregar perfil", erro);

        nomeUsuario.textContent = "Erro ao carregar";
        emailUsuario.textContent = "";
    }
}
const listaMeusPosts = document.getElementById("listaMeusPosts");

async function carregarMeusPosts() {

    try{
    const resposta = await fetch("/carregarPosts");

    const texto = await resposta.text();

const dados = JSON.parse(texto);

    if (!dados.sucesso){
        listaMeusPosts.textContent = dados.mensagem;
        return
    };

    listaMeusPosts.innerHTML = "";

    totalPosts.textContent = dados.posts.length;

const quantidadeServicos = dados.posts.filter(
    post => post.tipo === "servico"
).length;

const quantidadePedidos = dados.posts.filter(
    post => post.tipo === "pedido"
).length;

totalServicos.textContent = quantidadeServicos;
totalPedidos.textContent = quantidadePedidos;

    if(dados.posts.length === 0){

        listaMeusPosts.textContent = 
        "Você ainda não publicou nada."

        return;
    }

        dados.posts.forEach(post => {

    const artigo = document.createElement("article");
    artigo.classList.add("meu-post");

    // Cabeçalho
    const header = document.createElement("header");
    header.classList.add("meu-post-header");

    const titulo = document.createElement("h3");
    titulo.textContent = post.titulo;

    const tipo = document.createElement("span");

    if (post.tipo === "servico") {
        tipo.textContent = "Oferece serviço";
    } else {
        tipo.textContent = "Procuro ajuda";
    }

    const bairro = document.createElement("span");
    bairro.textContent = post.bairro;

    header.appendChild(titulo);

    // Informações
    const informacoes = document.createElement("div");
    informacoes.classList.add("meu-post-info");

    informacoes.appendChild(tipo);
    informacoes.appendChild(bairro);

    // Descrição
    const descricao = document.createElement("p");
    descricao.classList.add("meu-post-descricao");
    descricao.textContent = post.descricao;

    let imagemPost = null;

if (post.foto) {
    imagemPost = document.createElement("img");

    imagemPost.classList.add("post-imagem");

    imagemPost.src = post.foto;

    imagemPost.alt = `Imagem da publicação: ${post.titulo}`;
}

    // Botões
    const acoes = document.createElement("div");
    acoes.classList.add("meu-post-acoes");

    const botaoEditar = document.createElement("button");
    botaoEditar.textContent = "Editar";
    botaoEditar.classList.add("btn-editar");

    botaoEditar.addEventListener("click", () => {

    window.location.href = `/editar-post?id=${post.id}`;

});

    const botaoExcluir = document.createElement("button");
    botaoExcluir.textContent = "Excluir";
    botaoExcluir.classList.add("btn-excluir");

    botaoExcluir.addEventListener("click", async () => {

   const confirmar = await confirmarAcao("Você deseja excluir esta publicação?", "Excluir");

    if (!confirmar) {
        return;
    }

    try {

        const resposta = await fetch(`/posts/${post.id}`, {
            method: "DELETE"
        });

        const dados = await resposta.json();

        if (!resposta.ok || !dados.sucesso) {

            if (resposta.status === 401) {
                mostrarToast("Sua sessão expirou. Faça login novamente.", "info");
                window.location.href = "/index.html";
                return;
            }

            mostrarToast(dados.mensagem || "Não foi possível excluir a publicação.", "erro");
            return;
        }

        artigo.remove();

        // Atualiza os contadores sem precisar recarregar a página
        const novoTotal = Number(totalPosts.textContent) - 1;
        totalPosts.textContent = novoTotal;

        if (post.tipo === "servico") {
            totalServicos.textContent = Number(totalServicos.textContent) - 1;
        } else {
            totalPedidos.textContent = Number(totalPedidos.textContent) - 1;
        }

        if (novoTotal === 0) {
            listaMeusPosts.textContent = "Você ainda não publicou nada.";
        }

    } catch (erro) {

        console.error("Erro ao excluir publicação:", erro);

        mostrarToast("Erro ao conectar com o servidor.", "erro");
    }
});

    acoes.appendChild(botaoEditar);
    acoes.appendChild(botaoExcluir);

    // Montagem
artigo.appendChild(header);
artigo.appendChild(informacoes);
artigo.appendChild(descricao);

if (imagemPost) {
    artigo.appendChild(imagemPost);
}

artigo.appendChild(acoes);

    listaMeusPosts.appendChild(artigo);
});
    }catch (erro){
        console.error("Erro ao carregar meus posts:", erro);

        listaMeusPosts.textContent = "Não foi possivel carregar suas publicações";
    } 
    
}

carregarPerfil();
carregarMeusPosts();