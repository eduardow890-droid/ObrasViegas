//JAVASCRIPT responsavel pelo cadastro

const form = document.getElementById("formCadastro");

function setloading(btn, textoOriginal, carregando){
    btn.disabled = carregando;
    btn.textContent = carregando ? "Aguarde..." : textoOriginal;
    btn.style.opacity = carregando ? "0.7" : "1";
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

        const btn = event.submitter || form.querySelector("button[type='submit']");


    const usuario = {
        nome: document.getElementById("nomeUsuario").value,
        email: document.getElementById("emailCadastro").value,
        senha: document.getElementById("senhaCadastro").value
    };

    if (usuario.nome.trim() === "" ||
        usuario.email.trim() === "" ||
        usuario.senha.trim() === ""
    ) {
        alert("Preencha os campos para finalizar o cadastro");
        return;
    }

    // Mesma regra de complexidade validada no server.js — feedback imediato
    const senhaValida = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!senhaValida.test(usuario.senha)) {
        alert("A senha deve ter pelo menos 8 caracteres, uma letra, um número e um caractere especial (@$!%*?&).");
        return;
    }

    try {

        setloading(btn, "Finalizar Cadastro", true);

        const resposta = await fetch("/cadastrar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(usuario)
        });

        const data = await resposta.json();


        if (!resposta.ok || !data.sucesso) {
            alert(data.mensagem || "Não foi possível concluir o cadastro.");
            return;
        }

        alert(data.mensagem || "Cadastro realizado com sucesso!");
        window.location.href = "/index.html";

    } catch (erro) {

        console.error("Erro ao cadastrar:", erro);

        alert("Erro ao conectar com o servidor.");
    } finally {
        setloading(btn, "Finalizar Cadastro", false);
    }
});
