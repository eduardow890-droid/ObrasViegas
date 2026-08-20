const formPost = document.getElementById('formPost');
const tipo = document.querySelector('input[name="tipo"]:checked').value;
const selectBairro = document.getElementById("selectBairro");
const inputOutroBairro = document.getElementById("inputOutroBairro");

formPost.addEventListener('submit', async(event) => {
    event.preventDefault()

    const confirmacao = confirm("Você deseja publicar esse post?")

    let bairro = selectBairro.value;

        if (bairro === "Outro") {
            bairro = inputOutroBairro.value.trim();
        }

    const usuario = {
        tipo: document.querySelector('input[name="tipo"]:checked').value,        
        titulo: document.getElementById('titulo').value,
        bairro: bairro,
        descricao: document.getElementById('descricao').value,
        whatsapp: document.getElementById('whatsapp').value

    }

    const resposta = await fetch("/posts", {
        method: "POST",
        headers: {
            "Content-Type":"application/json"
        },
        body: JSON.stringify(usuario)

    });
    const data = await resposta.json();

    if(data.sucesso){
        
        window.location.href = "/main"
    }

    console.log(data);
});
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
