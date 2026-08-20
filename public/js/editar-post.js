const params = new URLSearchParams(window.location.search);
const formEditarPost = document.getElementById("formEditarPost");
const postId = params.get("id");

const inputTitulo = document.getElementById("inputTitulo");
const selectTipo = document.getElementById("selectTipo");
const selectBairro = document.getElementById("selectBairro");
const inputOutroBairro = document.getElementById("inputOutroBairro");
const textareaDescricao = document.getElementById("textareaDescricao");
const inputWhatsapp = document.getElementById("inputWhatsapp");




console.log("ID DO POST:", postId);
async function carregarPost() {
    const resposta = await fetch(`/posts/${postId}`);

    const dados = await resposta.json();

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

    console.log("submit executada");

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

    const resposta = await fetch(`/posts/${postId}`, {
        method: "PUT",
        headers: {
            "Content-type":"application/json"
        },
        body: JSON.stringify(dadosAtualizados)
    })
    const dados = await resposta.json();
     if(!resposta.ok){
         alert(dados.mensagem);

         
        }
        if(dados.sucesso){
        console.log("vou direcionar para a main")
         window.location.href = "/main";
        };
     }   
)
carregarPost();