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
    mostrarToast("Preencha os campos para finalizar o cadastro", "aviso");        
    return;
    }

    // Mesma regra de complexidade validada no server.js — feedback imediato
    const senhaValida = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!senhaValida.test(usuario.senha)) {
    mostrarToast("A senha deve ter pelo menos 8 caracteres, uma letra, um número e um caractere especial.", "aviso");        
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
            mostrarToast(data.mensagem || "Não foi possível concluir o cadastro.", "erro");            
            return;
        }

        mostrarToast(data.mensagem || "Cadastro realizado com sucesso!", "sucesso");
        window.location.href = "/index.html";

    } catch (erro) {

        console.error("Erro ao cadastrar:", erro);

        mostrarToast("Erro ao conectar com o servidor.", "erro");
    } finally {
        setloading(btn, "Finalizar Cadastro", false);
    }
});
