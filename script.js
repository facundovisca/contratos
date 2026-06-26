const contenedor = document.getElementById('contenedor-frases');
const buscador = document.getElementById('buscador');

let todasLasFrases = [];

async function cargarFrases() {
    try {
        const respuesta = await fetch('frases.json');
        todasLasFrases = await respuesta.json();
        mostrarFrases(todasLasFrases);
    } catch (error) {
        console.error("Error al cargar las frases:", error);
        contenedor.innerHTML = `<p style="color: red; text-align: center;">Error al cargar el libro de frases.</p>`;
    }
}

function mostrarFrases(listaDeFrases) {
    contenedor.innerHTML = "";

    if (listaDeFrases.length === 0) {
        contenedor.innerHTML = `<p style="color: var(--text-muted); text-align: center; grid-column: 1/-1;">No se encontraron frases.</p>`;
        return;
    }

    listaDeFrases.forEach(item => {
        const tarjeta = document.createElement('article');
        tarjeta.classList.add('card-frase');

        tarjeta.innerHTML = `
            <div class="foto-perfil">
                <img src="${item.foto}" alt="Foto de ${item.autor}">
            </div>
            <div class="contenido">
                <p class="frase">"${item.frase}"</p>
                <h3 class="autor">${item.autor}</h3>
            </div>
        `;

        contenedor.appendChild(tarjeta);
    });
}

buscador.addEventListener('input', (e) => {
    const textoBusqueda = e.target.value.toLowerCase();
    const frasesFiltradas = todasLasFrases.filter(item => {
        return (
            item.autor.toLowerCase().includes(textoBusqueda) ||
            item.frase.toLowerCase().includes(textoBusqueda)
        );
    });
    mostrarFrases(frasesFiltradas);
});

cargarFrases();