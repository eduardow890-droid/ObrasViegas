//JAVASCRIPT responsavel pelo cadastro


const form = document.getElementById("formCadastro");// conecta com o formulario do cadastro.html

form.addEventListener("submit", async (event) => {// evento onde o usuario envia o cadastro 
    event.preventDefault();// impede a pagina de recarregar para o envio ser feito pelo fetch

    const usuario = {// itens que serão enviados para o servidor
        nome: document.getElementById("nomeUsuario").value,
        email: document.getElementById("emailCadastro").value,
        senha: document.getElementById("senhaCadastro").value
};
if(usuario.nome.trim() === "" ||
    usuario.email.trim() === "" ||
    usuario.senha.trim() === ""
){
    
    alert("preencha os campos para finalizar o cadastro")
    return;
};
// validação para evitar o preenchimento vazio


const resposta = await fetch("/cadastrar", {// envia uma requisição para a rota /cadastrar e espera a resposta
    method: "POST",// metodo para enviar dados para o servidor
    headers: {// informa que tipos de formatos serão enviados
        "Content-Type":"application/json"
    },
    body: JSON.stringify(usuario)// transforma o objeto em json para ir no corpo/body da requisição
});

const data =  await resposta.json();// aqui é onde tera a responta em json do servidor

if(data.sucesso){
    window.location.href = "/index.html";
} else{
    alert(data.mensagem)
}
console.log(data)
});