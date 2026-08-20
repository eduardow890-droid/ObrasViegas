const express =  require('express');
const app = express();
const porta = 3000;
const path = require('path');
const session = require("express-session");
const db = require("./database/database");
const bcrypt = require("bcrypt");




app.use(session({
    secret: "chave-de-autentificacao",
    resave: false,
    saveUninitialized: false,
    cookie:{
        httpOnly:true,
        sameSite: "lax"
    }
}))

app.use(express.json());// permite que o expresse interprete o JSON do req.body
// Arquivos públicos (CSS, JavaScript, imagens e as telas de login/cadastro).
app.use(express.static(path.join(__dirname, "public")));

function verificarLogin(req, res, next){
    if(!req.session.usuarioId){
        return res.redirect("/index.html");
    }
    //impede o navegador de armazenar a pagina privada em cache
    res.set("Cache-Control", "no-store");

    next();
}

function verificarApi(req, res, next){
    if(!req.session.usuarioId){
        return res.status(401).json({
            sucesso: false,
            mensagem: "Você precisa estar logado"
        });

    }
    next();
}


app.post("/cadastrar", async(req, res) => {// Criar a rota Post /cadastrar para recebe os dados do formulario enviados pelo script.js

    console.log("Dados recebidos:", req.body)

    const {nome, email, senha} = req.body;//crias os campos do formulário dentro do servidor

    // Verificação se os campos estão preencidos
    if(!nome || !email || !senha){
        return res.status(400).json({
            sucesso: false,
            mensagem: "Preencha todos os campos"
        });
    }
    //Verificação para os campos não ficarem vazios
    if(
        nome.trim() === "" ||
        email.trim() === "" ||
        senha.trim() === ""
    ) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Os campos não podem ficar vazios"
        })
    }
    // Verificação numero de caracteres
    if (senha.length < 8){
        return res.status(400).json({
        sucesso: false,
        mensagem: "A senha deve conter pelo menos 8 caracteres"
        });
    }
    // Verificação de Senha forte
    const senhaValida =
       /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if(!senhaValida.test(senha)){
        return res.status(400).json({
            sucesso: false,
            mensagem: "A senha deve ter pelo menos 8 caracteres, uma letra, um numero e um caractere especial"
        })
    }
    
    try{// o try vai tentar executar o codigo caso tenha algum erro ao inver de quebrar sera passado para o catch
        const senhaHash = await bcrypt.hash(senha, 10);// essa linha significa "pegue a senha recebida e aplique o bcrypt e espere o resultado"
        const inserirUsuario = db.prepare(`
            INSERT INTO usuarios (nome, email, senha)
            VALUES (?, ?, ?)
            `);// Aqui o banco esta sendo preparado para receber as informações enviadas pelo JavaScript

            inserirUsuario.run(nome, email, senhaHash);// run é oque vai executar o comando com os valores enviados
            
            res.status(201).json({// retorna a situação dentro do console
                sucesso: true,// validação para retorno do usuario para o index.html após cadastro realizado
                mensagem: "Usuario cadastrado"        
                
        
            });
    } catch (erro){// o catch vai tratar o erro no cadastro nesse caso se ja existe o email que estão tentando cadastrar
        if (erro.code === "SQLITE_CONSTRAINT_UNIQUE"){// esse trecho tem uma regra definida no banco de dados dizendo que dois usuarios não podem ter o mesmo email
            return res.status(409).json({
                sucesso: false,
                mensagem: "Email já cadastrado"
            });
        }

        console.log(erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao cadastrar o usuário"
        });
    } 
    
});

app.post('/login', async (req, res) =>{// rota de login
    const {email, senha} = req.body;// objetos que serão requisitados para autentificação e entrada na private/main

    const buscarUsuario = db.prepare(`
        SELECT id, nome, email, senha
        FROM usuarios
        WHERE email = ?
        `);
        // nesse trecho o SELECT define oq sera procurado
        //o FROM define a tabela que sera procurado
        // o WHERE verifica se o valor do email cadastrado é igual ao digitado pelo usuario
    const usuario =  buscarUsuario.get(email);// Executa a consulta usando o email enviado pelo usuário 
    
    if(!usuario){
        return res.status(401).json({
            sucesso: false,
            mensagem: "Email ou Senha incorretos"
        })
    };
    // Verifica se existe um usuário cadastrado com esse email
    
    const senhaValida = await bcrypt.compare(senha, usuario.senha);// Compara a senha digitada com o hash armazenado no banco

    if(!senhaValida){
        return res.status(401).json({
            sucesso: false,
            mensagem: "Email ou Senha incorretos"
        });
    };
    // verifica se a senha que foi requisitada é igual a que esta inserida no array

    req.session.usuarioId = usuario.id;// Armazena na sessão o ID do usuário que foi autenticado

    return res.status(200).json({// Responde ao front end que o login foi realizado
        sucesso: true,
        mensagem: "Login Realizado com sucesso"
    })

});

app.get("/me", (req, res) => {// rota de autentificação do usuario
    if (!req.session.usuarioId){
        return res.status(401).json({
            autenticado: false,
            mensagem: "Não autenticado"
        });
    }
    const buscarSessao = db.prepare(`
        SELECT id, nome, email
        FROM usuarios
        WHERE id = ?
        `); 
        // nesse trecho o SELECT define oq sera procurado
        //o FROM define a tabela que sera procurado
        // o WHERE vai fazer a comparação do item procurado para o item enviado

        const usuario = buscarSessao.get(req.session.usuarioId);// aqui é enviado para o buscarSessao para la ser visto se o valor é igual

    if(!usuario){// verifica a existencia do usuario pelo id
        return res.status(401).json({
            autenticado: false,
            mensagem: "Usuário não encontrado"
        });
    }
    return res.json({// retorna a o resultado caso o resultado de id.session seja igual o id do array
        autenticado: true,
        usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        }
        });

});
//-------------------------------rotas----------------------------------
app.get('/main', verificarLogin,(req, res) =>{
    res.sendFile(path.join(__dirname, "private", "main.html"));
});

app.get("/buscar", verificarLogin, (req, res) => {
    res.sendFile(path.join(__dirname, "private", "buscar.html"));
});

app.get("/postar", verificarLogin, (req, res) => {
    res.sendFile(path.join(__dirname, "private", "postar.html"));
});

app.get("/perfil", verificarLogin, (req, res) => {
    res.sendFile(path.join(__dirname, "private", "perfil.html"));
});
app.get("/editar-post", verificarLogin, (req, res) => {
    res.sendFile(path.join(__dirname, "private", "editar-post.html"));
});
//-----------------------------------------------------------------------------------------
app.post("/logout", (req, res) => {
    req.session.destroy((erro) => {

        if(erro){
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao Sair"
            });
        }
        res.json({
            sucesso: true,
            mensagem: "Logout realizado"
        })
    })
});
//--------------------------------Aplicações para a main.html/js------------------------------------
app.post("/posts", verificarApi, (req, res)=>{
    
    const {tipo, titulo, bairro, descricao, whatsapp} = (req.body);

    const usuarioId =  req.session.usuarioId;

    console.log("Dados do post:", {
        tipo,
        titulo,
        bairro,
        descricao,
        whatsapp
    });

    if (!usuarioId){
        return res.status(401).json({
            sucesso: false,
            mensagem: "Você precisa estar logado"
        });
    }

    if(!tipo || !titulo || !bairro || !descricao || !whatsapp){
        return res.status(400).json({
            sucesso: false,
            mensagem:  "Preencha todos os campos"
        });
    }
    try{
        const inserirPostagem = db.prepare(`
            INSERT INTO posts (
            usuario_id,
            tipo,
            titulo,
            bairro,
            descricao,
            whatsapp
            )VALUES(?, ?, ?, ?, ?, ?)
            
        `)
        inserirPostagem.run(usuarioId, tipo, titulo, bairro, descricao, whatsapp)
        
        const posts = db.prepare("SELECT * FROM posts").all();

        console.log("Posts cadastrados:", posts);

        res.status(201).json({
            sucesso: true,
            mensagem: "Post puclicado com sucesso"
        })
    }catch(erro){

        console.log(erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao publicar o post"
        });
    }
});

app.get("/posts", verificarApi, (req, res) =>{

    const buscarPosts = db.prepare(`
        SELECT
        posts.id,
        posts.usuario_id,
        posts.tipo,
        posts.titulo,
        posts.bairro,
        posts.descricao,
        posts.whatsapp,
        posts.created_at,
        usuarios.nome
        FROM posts
        INNER JOIN usuarios
        ON posts.usuario_id = usuarios.id
        ORDER BY posts.created_at DESC
        `);

        const posts = buscarPosts.all();

        return res.json({
            sucesso: true,
            posts: posts
        });
    })
    
    app.delete("/posts/:id", verificarApi, (req, res) =>{

        if(!req.session.usuarioId){// verifica se existe um id na sessão
            return res.status(401).json({
                sucesso: false,
                mensagem: "Você precisa estar logado"
            });
        }

        const postId = req.params.id; // pega o id da URL e armazena ele na constante


        // esta se preparando para pesquisar o req.params.id pela const post
        const buscarPost = db.prepare(`
            SELECT id, usuario_id
            FROM posts
            WHERE id = ?
            `);

        const post = buscarPost.get(postId);// faz a busca no banco de dados
        
        if(!post){// esta verificando se a busca de cima terá algum retorno se não tiver ira retorna nao encontrado
            return res.status(404).json({
                sucesso: false,
                mensagem: "Post não encontrado"
            });
        }
        // O dono do post é o mesmo usuário que está logado? Se não for, bloqueia.
        if  (post.usuario_id !== req.session.usuarioId){
            return res.status(403).json({
                sucesso: false,
                mensagem: "Você não pode excluir esse post"
            });
        };

        // prepara para excluir pelo id
        const excluirPost = db.prepare(`
            DELETE FROM posts
            WHERE id = ?
            `);

            excluirPost.run(postId);// envia o id que será excluido e executa

        return res.json({
            sucesso: true,
            mensagem: "Post excluido com sucesso"
        })
    })
    app.get("/posts/:id",verificarApi, (req, res) => {
        if(!req.session.usuarioId){
            return res.status(401).json({
                sucesso: false,
                mensagem: "Você precisa estar logado"
            })
        }

        const postId = req.params.id;

        const buscarId = db.prepare(`
            SELECT id, usuario_id, titulo, tipo, bairro, descricao, whatsapp
            FROM posts
            WHERE id = ?`)

       const post = buscarId.get(postId);

       if(!post){
        return res.status(404).json({
            sucesso: false,
            mensagem: "Post não encontrado"
        });
       }

        return res.json(post);
        
    })

    app.put("/posts/:id", verificarApi, (req, res) =>{

        if(!req.session.usuarioId){
            return res.status(401).json({
                sucesso: false,
                mensagem: "Você precisa estar logado"
            })
        };

        const postId = req.params.id;

        const {titulo, tipo, bairro, descricao, whatsapp } = req.body;

        const buscarPost = db.prepare(`
            SELECT id, usuario_id
            FROM posts
            WHERE id = ?
            `);

            const post = buscarPost.get(postId);

        if (!post){
            return res.status(404).json({
                sucesso: false,
                mensagem: "Post não encontrado"
            })
        }

        if(post.usuario_id !== req.session.usuarioId){
            return res.status(403).json({
                sucesso: false,
                mensagem: "Você não pode editar esse post"
            })
        }
        
        const atualizarPost = db.prepare
        (`UPDATE posts
            SET titulo = ?,
            tipo = ?,
            bairro = ?,
            descricao = ?,
            whatsapp = ?
            WHERE id = ?
        `)

       const atualizacao = atualizarPost.run(titulo,
            tipo,
            bairro,
            descricao,
            whatsapp,
            postId
        );

        return res.json({
            sucesso:true,
            mensagem: "Post atualizado com sucesso"
        });
        

    })

    app.get("/posts", verificarApi, (req, res) =>{

        const { busca, bairro, tipo } = req.query;

        let sql = `
        SELECT
            posts.id,
            posts.usuario_id,
            posts.tipo,
            posts.titulo,
            posts.bairro,
            posts.descricao,
            posts.whatsapp,
            posts.created_at,
            usuarios.nome
            FROM posts
            INNER JOIN usuarios
            ON posts.usuario_id = usuarios.id
            WHERE 1 = 1 `;

            const valores = [];

            if(busca){
                sql +=`
                    AND (
                        posts.titulo LIKE ?
                        OR posts.descricao LIKE ?
                        OR usuarios.nome LIKE ?
            )
                        `;

                   const termoBusca = `%${busca}%`;

                   valores.push(
                    termoBusca,
                    termoBusca,
                    termoBusca
                   )
            };
            if (bairro){
                sql += `
                AND posts.bairro = ?
                `;

                valores.push(bairro);
            };
            if(tipo){
                sql += `AND posts.tipo = ?
                `;
                valores.push(tipo);
            }
            sql += `
            ORDER BY posts.created_at DESC
            `;

            const buscarPosts = db.prepare(sql);
            const posts = buscarPosts.all(...valores);
            return res.json({
                sucesso: true,
                posts: posts
            });
    })
//------------------------------------Porta do servidor------------------------------------------
app.listen(porta, () => {
  console.log(`Servidor rodando em http://localhost:${porta}`);
});
