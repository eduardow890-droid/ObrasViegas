const form = document.getElementById("formLogin");

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const usuario = {
        email: document.getElementById("email").value,
        senha: document.getElementById("senha").value
    };

    try {

        const resposta = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(usuario)
        });

        const data = await resposta.json();

        console.log(data);

        if (data.sucesso) {

            alert(data.mensagem);

            window.location.href = "/main";

            return;
        }

        alert(data.mensagem || "Não foi possível realizar o login.");

    } catch (erro) {

        console.error("Erro ao realizar login:", erro);

        alert("Não foi possível conectar ao servidor. Tente novamente.");
    }
});

document.getElementById('FazerCadastro').addEventListener('click', () => {

    window.location.href = "cadastro.html";

});

