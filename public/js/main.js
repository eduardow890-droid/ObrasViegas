const fotoPerfil = document.getElementById("fotoPerfil");


async function carregarUsuario() {

    try{

    const resposta = await fetch('/me');// entrar na rota /me

    if(!resposta.ok){// se a resposta nao for sucesso irá retornar para index.html
        console.error("Usuário não autenticado");
        window.location.href = "index.html";
        return;
    }

    const data = await resposta.json();

    document.getElementById('nomeUsuario').textContent =  // Adicionar uma saudação para o usuario dentro de main.html
    data.usuario.nome;

     if (data.usuario.foto) {
        fotoPerfil.src = data.usuario.foto;
        }
    
    return data.usuario;
}catch(erro){

    console.error("Erro ao carregar usuário:", erro);

    mostrarToast("Não foi possivel conectar ao servidor.", "erro");

    return null;
}
}

document.getElementById("logout").addEventListener("click", async () => {

   const confirmar = await confirmarAcao("Deseja realmente sair?", "Sair");

    if (!confirmar) {
        return;
    }

    try {

        const resposta = await fetch("/logout", {
            method: "POST"
        });

        const data = await resposta.json();

        if (!resposta.ok) {

            console.error("Erro ao realizar logout:", data);

            mostrarToast(
                data.mensagem ||
                "Não foi possível sair da conta.", "erro"
            );

            return;
        }

        if (data.sucesso) {
            window.location.href = "/index.html";
        }

    } catch (erro) {

        console.error("Erro de conexão ao realizar logout:", erro);

        mostrarToast("Não foi possível conectar ao servidor.", "erro");
    }
});

async function carregarPosts(usuario) {
   
    const listaPosts = document.getElementById("listaPosts");
   
   try{
   
    const resposta = await fetch('/posts');

    const data = await resposta.json();

    if(!resposta.ok){

        console.error("Erro ao carregar posts:", data)

        listaPosts.textContent = "Não foi possivel carregar as publicações.";

        return;
    }

    if (data.posts.length === 0) {

    listaPosts.textContent =
        "Nenhuma publicação encontrada.";

    return;
}
    
    data.posts.forEach(post => {
        
        const artigo = document.createElement("article");

        artigo.classList.add("post-card");

        const titulo = document.createElement("h3");

        titulo.classList.add("post-titulo");

        titulo.textContent = post.titulo;

        const nome = document.createElement("h3");

        nome.textContent = post.nome;

        const header = document.createElement("header");

        header.classList.add("post-header");

        const autorInfo = document.createElement("div");

        autorInfo.classList.add("post-autor-info");

        let tipoTexto;

        if(post.tipo === "servico"){
            tipoTexto = "Oferece serviço";  
        }else if (post.tipo === "pedido"){
            tipoTexto = "Procuro ajuda";
        };

        const especialidade = document.createElement('p');

        especialidade.classList.add("especialidade");

        especialidade.textContent = `${tipoTexto} • ${post.bairro}`;

        const conteudo = document.createElement('div');

        conteudo.classList.add('post-conteudo');
        
        const descricao = document.createElement('p');

        descricao.textContent = post.descricao;

        let imagemPost = null;

        if (post.foto_post) {

            imagemPost = document.createElement("img");

            imagemPost.classList.add("post-imagem");

            imagemPost.src = post.foto_post;

            imagemPost.alt = `Imagem da publicação: ${post.titulo}`;
        }

        const footer = document.createElement('footer');

        footer.classList.add('post-footer');

        const whatsapp = document.createElement("a");

        whatsapp.classList.add('btn-whatsapp');

        whatsapp.textContent = "Chamar no WhatsApp";
        
        whatsapp.href = `https://wa.me/55${post.whatsapp}`;

        whatsapp.target = "_blank";

        const avatar = document.createElement('img');

        avatar.classList.add("post-avatar");

        if(post.foto){
            avatar.src = post.foto;
        }else{
            avatar.src = "/img/avatar-padrao.jpg"
        }

        avatar.alt = `Foto de ${post.nome}`;

        if(post.usuario_id === usuario.id){
            const btnEditar = document.createElement("button");

            btnEditar.textContent = "Editar";
            btnEditar.classList.add('btn-editar');

            btnEditar.addEventListener('click', async()=>{
                window.location.href = `editar-post?id=${post.id}`
            });
              

            const btnExcluir = document.createElement("button");

            btnExcluir.textContent = "Excluir";
            btnExcluir.classList.add("btn-excluir");

            footer.appendChild(btnEditar);
            footer.appendChild(btnExcluir);

            btnExcluir.addEventListener('click', async () => {
   const confirmar = await confirmarAcao("Você deseja excluir essa publicação?", "Excluir");

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

    } catch (erro) {

        console.error("Erro ao excluir publicação:", erro);

        mostrarToast("Erro ao conectar com o servidor.", "erro");
    }
});

        }
        
        listaPosts.appendChild(artigo);

        artigo.appendChild(header);

        artigo.appendChild(titulo);

        header.appendChild(avatar)

        header.appendChild(autorInfo);

        autorInfo.appendChild(nome);

        autorInfo.appendChild(especialidade);

        artigo.appendChild(conteudo);

        conteudo.appendChild(descricao);

        if(imagemPost){
            conteudo.appendChild(imagemPost)
        }

        artigo.appendChild(footer);

        footer.appendChild(whatsapp)

    });
}catch(erro){

    console.error("Erro ao carregar posts:", erro);

    listaPosts.textContent =
        "Não foi possivel conectar ao servidor."
    }
}

async function iniciarPagina() {
    
    const usuario = await carregarUsuario();

    if (!usuario){
        return
    }
    await carregarPosts(usuario);
}

iniciarPagina();