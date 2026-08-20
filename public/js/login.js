const form = document.getElementById("formLogin");// cria a constante global form

form.addEventListener('submit', async (event) => {// inicia um evento no botão do arquivo index.html
    event.preventDefault()
    const usuario ={// objeto javascript que será enviado ao servidor para ser verificado 
        email: document.getElementById("email").value,
        senha: document.getElementById("senha").value
    };

    const resposta = await fetch("/login", {// entra na rota /login para fazer a verificação do login
        method: "POST",// metodo http de requisição do formLogin
        headers:{
            "Content-Type":"application/json"//tipo de formatação que sera enviado
        },
        body: JSON.stringify(usuario)// formatação enviada ao req.body
    });
    const data = await resposta.json();// espera a resposta da requisição do /login

    console.log(data);

    if(data.sucesso) {// após a resposta aqui é visto se o login foi realizado com sucesso
        alert(data.mensagem)// resposta do servido 
        window.location.href = "/main";// rota de verificação da session
    }else{
        alert(data.mensagem)
    };
});

document.getElementById('FazerCadastro').addEventListener('click', ()=>{// leva o usuario que não possui cadastro para realizar em cadastro.html
    window.location.href = "cadastro.html";
});