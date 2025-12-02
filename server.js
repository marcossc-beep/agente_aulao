require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');

fastify.register(cors, {
    origin: true 
});

// --- BANCO DE DADOS EM MEMÓRIA ---
const lista_usuarios = []; // Armazena { username, password }
const chatSessions = new Map(); // Armazena o histórico por usuário (username -> history[])

// --- ENDPOINT: CADASTRO ---
fastify.post('/api/register', async (request, reply) => {
    const { username, password } = request.body;

    if (!username || !password) {
        return reply.status(400).send({ error: 'Username e senha são obrigatórios' });
    }

    // Verifica se já existe
    const usuarioExistente = lista_usuarios.find(u => u.username === username);
    if (usuarioExistente) {
        return reply.status(409).send({ error: 'Usuário já existe' });
    }

    // Adiciona na lista (Push)
    lista_usuarios.push({ username, password });
    
    return { message: 'Usuário cadastrado com sucesso!' };
});

// --- ENDPOINT: LOGIN ---
fastify.post('/api/login', async (request, reply) => {
    const { username, password } = request.body;
    let usuarioEncontrado = null;

    // Loop para verificar usuário e senha (conforme solicitado)
    for (let i = 0; i < lista_usuarios.length; i++) {
        const u = lista_usuarios[i];
        if (u.username === username && u.password === password) {
            usuarioEncontrado = u;
            break;
        }
    }

    if (!usuarioEncontrado) {
        return reply.status(401).send({ error: 'Usuário ou senha incorretos' });
    }

    // Retorna sucesso e o username para o front salvar
    return { message: 'Login realizado', username: usuarioEncontrado.username };
});

// --- ENDPOINT: CHAT (PSICÓLOGO) ---
fastify.post('/api/generate', async (request, reply) => {
    const { prompt, username } = request.body;

    if (!prompt) return reply.status(400).send({ error: 'Prompt é obrigatório' });
    if (!username) return reply.status(401).send({ error: 'Usuário não identificado. Faça login.' });

    // 1. Recupera ou cria histórico do usuário
    let userHistory = chatSessions.get(username) || [];

    // 2. Define a Persona
    const contextoDoAgente = `
        Você é um psicólogo empático, profissional e acolhedor.
        Sua abordagem é baseada na Terapia Cognitivo-Comportamental (TCC).
        
        Diretrizes:
        1. Valide sempre os sentimentos do usuário primeiro.
        2. Faça perguntas abertas para encorajar a reflexão.
        3. Nunca dê diagnósticos médicos; sugira procurar ajuda profissional presencial se for grave.
        4. Mantenha respostas concisas e reconfortantes.
        5. Se o usuário falar de autolesão, forneça imediatamente contatos de emergência (como o CVV 188).
    `;

    // 3. Monta o payload para o Gemini (Histórico + Prompt Atual)
    // Adiciona o prompt atual ao histórico temporário para envio
    const contentsParaEnvio = [
        ...userHistory,
        { role: "user", parts: [{ text: prompt }] }
    ];

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const dataEnvio = {
        systemInstruction: {
            parts: [{ text: contextoDoAgente }]
        },
        contents: contentsParaEnvio
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataEnvio)
        });

        const result = await response.json();

        if (!response.ok) {
            fastify.log.error(result);
            return reply.status(response.status).send({ error: result.error?.message || 'Erro na API do Google' });
        }

        const textoResposta = result.candidates[0].content.parts[0].text;

        // 4. Atualiza a memória do servidor
        // Salvamos a pergunta do usuário e a resposta do modelo
        const novoHistorico = [
            ...userHistory,
            { role: "user", parts: [{ text: prompt }] },
            { role: "model", parts: [{ text: textoResposta }] }
        ];
        chatSessions.set(username, novoHistorico);

        return { response: textoResposta };

    } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Erro interno no servidor' });
    }
});

fastify.listen({ port: 3000 }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    console.log(`Servidor rodando em ${address}`);
});

















// ISSO É SIMPLESAO

// require('dotenv').config();
// const fastify = require('fastify')({ logger: true });
// const cors = require('@fastify/cors');

// fastify.register(cors, {
//     origin: true 
// });

// fastify.post('/api/generate', async (request, reply) => {
//     const { prompt } = request.body;

//     if (!prompt) {
//         return reply.status(400).send({ error: 'Prompt é obrigatório' });
//     }

//     const apiKey = process.env.GEMINI_API_KEY;
//     const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    
//     const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

//     const contextoDoAgente = `
//         Você é um psicólogo empático, profissional e acolhedor.
//         Sua abordagem é baseada na Terapia Cognitivo-Comportamental (TCC).
        
//         Diretrizes:
//         1. Valide sempre os sentimentos do usuário primeiro.
//         2. Faça perguntas abertas para encorajar a reflexão.
//         3. Nunca dê diagnósticos médicos; sugira procurar ajuda profissional presencial se for grave.
//         4. Mantenha respostas concisas e reconfortantes.
//         5. Se o usuário falar de autolesão, forneça imediatamente contatos de emergência (como o CVV 188).
//     `;

//     const dataEnvio = {
//         systemInstruction: {
//             parts: [{ text: contextoDoAgente }]
//         },
//         contents: [
//             {
//                 parts: [{ text: prompt }]
//             }
//         ]
//     };

//     try {
//         const response = await fetch(url, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(dataEnvio)
//         });

//         const result = await response.json();

//         if (!response.ok) {
//             fastify.log.error(result);
//             return reply.status(response.status).send({ error: result.error?.message || 'Erro na API do Google' });
//         }

//         return {response: result.candidates[0].content.parts[0].text};

//     } catch (error) {
//         fastify.log.error(error);
//         return reply.status(500).send({ error: 'Erro interno no servidor' });
//     }
// });

// fastify.listen({ port: 3000 });
