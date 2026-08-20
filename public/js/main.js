async function verificarLogin() {
    const resposta = await fetch('/me');

    if(!resposta.ok){
        window.location.href = "/index.html";
        return;
    }

    const data =  await resposta.json();

    console.log("Usuário autenticado:", data.usuario)
}

async function carregarUsuario() {

    const resposta = await fetch('/me');// entrar na rota /me

    if(!resposta.ok){// se a resposta nao for sucesso irá retornar para index.html
        window.location.href = "index.html";
        return;
    }

    const data = await resposta.json();

    document.getElementById('nomeUsuario').textContent =  // Adicionar uma saudação para o usuario dentro de main.html
    data.usuario.nome;
    
    return data.usuario;
}

document.getElementById("logout").addEventListener('click', async () => {
    
    const resposta  =  await fetch('/logout', {
        method: "POST"
    });
    const data =  await resposta.json();

if(data.sucesso){
    window.location.href = "index.html";
};
})

async function carregarPosts() {
    const resposta = await fetch('/posts');

    const data = await resposta.json();

    console.log("Posts recebidos:", data);

    const listaPosts = document.getElementById("listaPosts");

    const usuario = await carregarUsuario();

    
    data.posts.forEach(post => {
        console.log("Post:", post)
        
        if(post.usuario_id === usuario.id){
            console.log("MEU POST:", post);
        }else{
            console.log("Post de outro usuario", post)
        }
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

        const footer = document.createElement('footer');

        footer.classList.add('post-footer');

        const whatsapp = document.createElement("a");

        whatsapp.classList.add('btn-whatsapp');

        whatsapp.textContent = "Chamar no WhatsApp";
        
        whatsapp.href = `https://wa.me/55${post.whatsapp}`;

        whatsapp.target = "_blank";

        const avatar = document.createElement('img');

        avatar.classList.add("post-avatar");

        avatar.src = "avatar-pedreiro.jpeg";

        avatar.alt = `foto de ${post.nome}`;

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
                const confirmar = confirm("Você deseja excluir essa publicação");

                if(!confirmar){
                    return;
                }

                const resposta = await fetch(`/posts/${post.id}`,{
                    method: "DELETE"
                });
                const dados = await resposta.json();
    
                console.log(dados);

                if (dados.sucesso){
                    artigo.remove();
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

        artigo.appendChild(footer);

        footer.appendChild(whatsapp)

    })
}

carregarPosts();
carregarUsuario();