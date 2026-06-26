const contenedor = document.getElementById('contenedor-frases');
const buscador = document.getElementById('buscador');
const btnToggleForm = document.getElementById('btn-toggle-form');

let todasLasFrases = [];
let formularioActivo = false;

// Lista oficial de autores con sus nombres completos y fotos correspondientes
const autoresDisponibles = [
    { nombre: "Sol Belous", foto: "img/sol.png" },
    { nombre: "Daniel Casal", foto: "img/dani.png" },
    { nombre: "Lucas Leguizamón", foto: "img/pela.png" },
    { nombre: "Alejandro Diaz Miguez", foto: "img/ale.png" },
    { nombre: "Facundo Visca", foto: "img/facu.png" },
    { nombre: "Monserrat Juan Grassetti", foto: "img/monse.png" },
    { nombre: "Agostina Vega", foto: "img/agos.png" },
    { nombre: "Bettina Cordero", foto: "img/beti.png" },
    { nombre: "Santino Mezzotero", foto: "img/santi.png" },
    { nombre: "Adriel Pérez de Barradas", foto: "img/adri.png" },
    { nombre: "Natalia Miloslavich", foto: "img/nata.png" },
    { nombre: "Rosario Blanco", foto: "img/ro.png" },
    { nombre: "Gabriela Lopez", foto: "img/gaby.png" },
    { nombre: "Lucas Pereiro", foto: "img/lucas.png" }
];

// Estilos dinámicos para los componentes interactivos
const estilosAdicionales = document.createElement('style');
estilosAdicionales.innerHTML = `
    .btn-flotante-mas {
        position: fixed; bottom: 30px; right: 30px;
        width: 60px; height: 60px; border-radius: 50%;
        background: var(--accent); border: none;
        color: #0f1423; font-size: 2rem; font-weight: bold;
        cursor: pointer; box-shadow: 0 4px 20px var(--accent-glow);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 100; display: flex; align-items: center; justify-content: center;
    }
    .btn-flotante-mas:hover { transform: scale(1.1) rotate(90deg); }
    .btn-flotante-mas.activo { background: #64748b; transform: scale(0.9) rotate(45deg); }
    
    .input-premium {
        width: 100%; background: rgba(15, 23, 42, 0.5);
        border: 1px solid var(--border-color); border-radius: 12px;
        padding: 12px; color: var(--text-main); font-family: inherit;
        margin-bottom: 15px; outline: none; transition: border-color 0.3s;
    }
    .input-premium:focus { border-color: var(--accent); }
    .select-premium { cursor: pointer; }
    
    .btn-insertar {
        background: var(--accent); color: #0f1423;
        border: none; padding: 12px 24px; border-radius: 50px;
        font-weight: 600; cursor: pointer; width: 100%;
        transition: transform 0.2s;
    }
    .btn-insertar:hover { transform: translateY(-2px); }
`;
document.head.appendChild(estilosAdicionales);

// Cargar datos iniciales
async function cargarFrases() {
    try {
        const respuesta = await fetch('frases.json');
        todasLasFrases = await respuesta.json();
        renderizarPantalla();
    } catch (error) {
        console.error("Error al cargar las frases:", error);
        contenedor.innerHTML = `<p style="color: red; text-align: center;">Error al cargar el libro.</p>`;
    }
}

// Renderizado general de la interfaz (Formulario inline + Frases)
function renderizarPantalla(frasesAMostrar = todasLasFrases) {
    contenedor.innerHTML = "";

    // Si el panel de carga está activo, se inyecta la tarjeta-formulario al principio de la grilla
    if (formularioActivo) {
        const tarjetaForm = document.createElement('article');
        tarjetaForm.classList.add('card-frase');
        
        // Generamos el menú select dinámicamente con los nombres completos ordenados
        let opcionesSelect = autoresDisponibles.map(a => `<option value="${a.nombre}" data-foto="${a.foto}">${a.nombre}</option>`).join('');

        tarjetaForm.innerHTML = `
            <h3 style="color: var(--accent); margin-bottom: 20px; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px;">Inmortalizar Frase</h3>
            <form id="form-inline" style="width: 100%;">
                <textarea id="ins-frase" class="input-premium" rows="3" placeholder="Escribí la frase acá..." required></textarea>
                <select id="ins-autor" class="input-premium select-premium" required>
                    <option value="" disabled selected>¿Quién la dijo?</option>
                    ${opcionesSelect}
                </select>
                <button type="submit" class="btn-insertar">Agregar frase</button>
            </form>
        `;
        contenedor.appendChild(tarjetaForm);

        // Evento para procesar el formulario cuando se envía
        tarjetaForm.querySelector('#form-inline').addEventListener('submit', (e) => {
            e.preventDefault();
            const texto = document.getElementById('ins-frase').value.trim();
            const select = document.getElementById('ins-autor');
            const autor = select.value;
            const foto = select.options[select.selectedIndex].getAttribute('data-foto');

            const nuevoObjeto = { id: todasLasFrases.length + 1, frase: texto, autor: autor, foto: foto };
            
            todasLasFrases.push(nuevoObjeto);
            formularioActivo = false;
            btnToggleForm.classList.remove('activo');
            
            renderizarPantalla();
            console.log("Copia esta estructura actualizada para tu frases.json:", JSON.stringify(todasLasFrases, null, 4));
        });
    }

    // Dibujar las tarjetas vigentes en la pantalla
    frasesAMostrar.forEach(item => {
        const tarjeta = document.createElement('article');
        tarjeta.classList.add('card-frase');
        tarjeta.innerHTML = `
            <div class="foto-perfil">
                <img src="${item.foto}" alt="Foto de ${item.autor}">
            </div>
            <div class="contenido">
                <p class="frase">"${item.frase.replace(/"/g, '')}"</p>
                <h3 class="autor">${item.autor}</h3>
            </div>
        `;
        contenedor.appendChild(tarjeta);
    });
}

// Evento del botón flotante para desplegar u ocultar la tarjeta de carga
btnToggleForm.addEventListener('click', () => {
    formularioActivo = !formularioActivo;
    btnToggleForm.classList.toggle('activo');
    renderizarPantalla();
});

// Filtro del buscador en tiempo real
buscador.addEventListener('input', (e) => {
    const texto = e.target.value.toLowerCase();
    const filtradas = todasLasFrases.filter(item => 
        item.autor.toLowerCase().includes(texto) || item.frase.toLowerCase().includes(texto)
    );
    renderizarPantalla(filtradas);
});

cargarFrases();