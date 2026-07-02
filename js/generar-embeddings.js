// ================================================================
// generar-embeddings.js
// ------------------------------------------------------------------
// Script OFFLINE (se corre una sola vez, o cada vez que cambie
// BASE_CONOCIMIENTO en data.js). Calcula el embedding de cada
// entrada de la KB usando Ollama y guarda el resultado en
// embeddings.json, listo para que el navegador haga búsqueda
// semántica sin tener que re-vectorizar nada en tiempo real.
//
// Requisitos:
//   - Node.js 18+ (usa fetch nativo)
//   - Ollama corriendo local:      ollama serve
//   - Modelo de embeddings bajado: ollama pull nomic-embed-text
//
//     Nota: NO uses gemma4 aquí. Los modelos de chat/generación
//     como gemma4:12b no están entrenados como "embedders" — dan
//     vectores de peor calidad y son mucho más lentos para esto.
//     nomic-embed-text (274M) es rápido y da muy buen resultado
//     para RAG con bases de conocimiento pequeñas/medianas.
//
// Uso:
//   node generar-embeddings.js
// ================================================================

const fs = require('fs');
const path = require('path');
const { BASE_CONOCIMIENTO } = require('./data.js');

const OLLAMA_EMBED_URL = 'http://localhost:11434/api/embed';
const MODELO_EMBEDDING = 'nomic-embed-text';

async function obtenerEmbedding(texto) {
    const res = await fetch(OLLAMA_EMBED_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: MODELO_EMBEDDING, input: texto })
    });

    if (!res.ok) {
        throw new Error(`Ollama respondió ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    // /api/embed devuelve { embeddings: [[...]] } (soporta batch)
    return data.embeddings[0];
}

// Texto que se vectoriza por cada entrada de la KB.
// Combinamos tags + respuesta: los tags capturan cómo pregunta la
// gente en lenguaje natural, la respuesta aporta el contenido real.
function textoParaEmbeber(item) {
    return `${item.tags.join(', ')}. ${item.resp}`;
}

async function main() {
    console.log(`Generando embeddings para ${BASE_CONOCIMIENTO.length} entradas de la KB...`);
    console.log(`Modelo: ${MODELO_EMBEDDING}\n`);

    const salida = [];

    for (let i = 0; i < BASE_CONOCIMIENTO.length; i++) {
        const item = BASE_CONOCIMIENTO[i];
        const texto = textoParaEmbeber(item);
        process.stdout.write(`  [${i + 1}/${BASE_CONOCIMIENTO.length}] ${texto.slice(0, 55)}... `);

        try {
            const embedding = await obtenerEmbedding(texto);
            salida.push({
                id: i,
                tags: item.tags,
                resp: item.resp,
                url: item.url || null,
                info: item.info || null,
                embedding
            });
            console.log('OK');
        } catch (err) {
            console.log('ERROR');
            console.error('   ->', err.message);
        }
    }

    const destino = path.join(__dirname, 'embeddings.json');
    fs.writeFileSync(destino, JSON.stringify(salida, null, 2), 'utf-8');

    console.log(`\n✅ Listo: ${salida.length}/${BASE_CONOCIMIENTO.length} entradas guardadas en ${destino}`);
    if (salida[0]) {
        console.log(`   Dimensiones del vector: ${salida[0].embedding.length}`);
    }
    console.log('\nCopia embeddings.json junto a tu index.html para que el navegador lo pueda cargar con fetch().');
}

main().catch(err => {
    console.error('Error fatal:', err);
    process.exit(1);
});
