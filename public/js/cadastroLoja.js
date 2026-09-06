document.getElementById("formCadastroLoja").addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const contato = document.getElementById("contato").value;
    const bairro = document.getElementById("bairro").value;
    const categoria = document.getElementById("categoria").value;

    try {
        const resposta = await fetch("/cadastrar-loja", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nome, email, senha, contato, bairro, categoria })
        });

        const dados = await resposta.json();

        if (resposta.ok && dados.sucesso) {
            // Utiliza o sistema UI.JS para exibir o toast de sucesso
            mostrarToast(dados.mensagem || "Loja cadastrada com sucesso!", "sucesso");
            
            document.getElementById("formCadastroLoja").reset();

            // Aguarda os 2 segundos exibindo o toast antes de redirecionar
            setTimeout(() => {
                window.location.href = "/index.html";
            }, 2000);
        } else {
            // Captura erros de validação do servidor (ex: e-mail duplicado, senha fraca)
            mostrarToast(dados.mensagem || "Não foi possível cadastrar a loja.", "erro");
        }

    } catch (erro) {
        console.error("Erro na requisição:", erro);
        mostrarToast("Erro na rede. Verifique se o servidor está ativo.", "erro");
    }
});
