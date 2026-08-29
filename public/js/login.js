const form = document.getElementById("formLogin");

function setloading(btn, textoOriginal, carregando){
    btn.disabled = carregando;
    btn.textContent = carregando ? "Aguarde..." : textoOriginal;
    btn.style.opacity = carregando ? "0.7" : "1";
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const btn = event.submitter || form.querySelector("button[type='submit']");


    const usuario = {
        email: document.getElementById("email").value,
        senha: document.getElementById("senha").value
    };

    try {

        setloading(btn, "Entrar", true);

        const resposta = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(usuario)

            
        });

        const data = await resposta.json();

        if (data.sucesso) {

            mostrarToast(data.mensagem, "sucesso");

            window.location.href = "/main";

            return;
        }

mostrarToast(data.mensagem || "Não foi possível realizar o login.", "erro");

    } catch (erro) {

        console.error("Erro ao realizar login:", erro);

mostrarToast("Não foi possível conectar ao servidor. Tente novamente.", "erro");

} finally {
        setloading(btn, "Entrar", false);
    }
});

document.getElementById('FazerCadastro').addEventListener('click', () => {

    window.location.href = "cadastro.html";

});

