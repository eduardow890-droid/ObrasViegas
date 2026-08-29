const formBuscar = document.getElementById("formBuscar");
const inputBuscar = document.getElementById("inputBusca");
const filtroBairro = document.getElementById("filtroBairro");
const filtroTipo = document.getElementById("filtroTipo");
const listaResultados = document.getElementById("listaResultados");
const usuario = document.getElementById("usuario");
const fotoPerfil = document.getElementById("fotoPerfil");

function criarPost(post) {

    const artigo = document.createElement("article");
    artigo.classList.add("post-card");


    const titulo = document.createElement("h3");
    titulo.classList.add("post-titulo");
    titulo.textContent = post.titulo;


    const header = document.createElement("header");
    header.classList.add("post-header");


    const autorInfo = document.createElement("div");
    autorInfo.classList.add("post-autor-info");


    const nome = document.createElement("h3");
    nome.textContent = post.nome;


    let tipoTexto;

    if (post.tipo === "servico") {

        tipoTexto = "Oferece serviço";

    } else if (post.tipo === "pedido") {

        tipoTexto = "Procuro ajuda";

    }


    const especialidade = document.createElement("p");

    especialidade.classList.add("especialidade");

    especialidade.textContent =
        `${tipoTexto} • ${post.bairro}`;


   const avatar = document.createElement("img");

avatar.classList.add("post-avatar");

if (post.foto) {
    avatar.src = post.foto;
} else {
    avatar.src = "/img/avatar-padrao.jpg";
}

avatar.alt = `Foto de ${post.nome}`;

    const conteudo = document.createElement("div");

    conteudo.classList.add("post-conteudo");


    const descricao = document.createElement("p");

    descricao.textContent = post.descricao;


    const footer = document.createElement("footer");

    footer.classList.add("post-footer");


    const whatsapp = document.createElement("a");

    whatsapp.classList.add("btn-whatsapp");

    whatsapp.textContent = "Chamar no WhatsApp";

    whatsapp.href = `https://wa.me/55${post.whatsapp}`;

    whatsapp.target = "_blank";


    // Montagem do card

    header.appendChild(avatar);

    autorInfo.appendChild(nome);

    autorInfo.appendChild(especialidade);

    header.appendChild(autorInfo);


    conteudo.appendChild(descricao);

    if (post.foto_post) {
    const imagem = document.createElement("img");

    imagem.classList.add("post-imagem");

    imagem.src = post.foto_post;

    imagem.alt = `Imagem da publicação: ${post.titulo}`;

    conteudo.appendChild(imagem);
}


    footer.appendChild(whatsapp);


    artigo.appendChild(header);

    artigo.appendChild(titulo);

    artigo.appendChild(conteudo);

    artigo.appendChild(footer);


    return artigo;
}


formBuscar.addEventListener("submit", async (event) => {

    event.preventDefault();


    const busca = inputBuscar.value.trim();

    const bairro = filtroBairro.value;

    const tipo = filtroTipo.value;


    const parametros = new URLSearchParams();


    if (busca) {

        parametros.append("busca", busca);

    }


    if (bairro) {

        parametros.append("bairro", bairro);

    }


    if (tipo) {

        parametros.append("tipo", tipo);

    }

    listaResultados.textContent = "Buscando publicações..."

    try{

    const resposta = await fetch(
        `/posts?${parametros.toString()}`
    );


    const dados = await resposta.json();

   if (resposta.status === 401) {
    alert("Sua sessão expirou. Faça login novamente.");
    window.location.href = "/index.html";
    return;
}

    listaResultados.innerHTML = "";


    if (dados.posts.length === 0) {

        listaResultados.textContent =
            "Nenhuma publicação encontrada.";

        return;
    }


    dados.posts.forEach(post => {

        const artigo = criarPost(post);

        listaResultados.appendChild(artigo);

    });
    }catch(erro){

        console.error("Erro de conexão ao buscar publicações:", erro);

        listaResultados.textContent =
            "Não foi possível conectar ao servidor.";
    }
    

});

async function carregarUsuario() {

    try{

    const resposta = await fetch('/me');// entrar na rota /me

    if(!resposta.ok){// se a resposta nao for sucesso irá retornar para index.html
        window.location.href = "index.html";
        return;
    }

    const data = await resposta.json();

    document.getElementById('usuario').textContent =  // Adicionar uma saudação para o usuario dentro de main.html
    data.usuario.nome;

     if (data.usuario.foto) {
        fotoPerfil.src = data.usuario.foto;
        }
    
    return data.usuario;

} catch (erro) {
        console.error("Erro ao carregar usuário:", erro);

        alert("Não foi possível conectar ao servidor.");

        return null
    }
}
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
carregarUsuario();