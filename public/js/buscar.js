const formBuscar = document.getElementById("formBuscar");
const inputBuscar = document.getElementById("inputBusca");
const filtroBairro = document.getElementById("filtroBairro");
const filtroTipo = document.getElementById("filtroTipo");
const listaResultados = document.getElementById("listaResultados");


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

    avatar.src = "avatar-pedreiro.jpeg";

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


    const resposta = await fetch(
        `/posts?${parametros.toString()}`
    );


    const dados = await resposta.json();


    console.log("Resultado:", dados);


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

});