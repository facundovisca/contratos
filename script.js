// Credenciales de conexión a tu base de datos de Supabase
const SUPABASE_URL = "https://pwpyuszdeatoordzkimt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3cHl1c3pkZWF0b29yZHpraW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NjI4OTEsImV4cCI6MjA5ODAzODg5MX0.BUb5wl_7fzTS14H7QCFYjM6tGqpL8s0iXK_ZQJYcoNU";

const contenedor = document.getElementById('contenedor-frases');
const contenedorFraseDia = document.getElementById('frase-del-dia-container');
let todasLasFrases = [];
let formularioActivo = false;

// Lista oficial de autores con nombres completos y fotos correspondientes
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
    { nombre: "Natasha Miloslavich", foto: "img/nata.png" },
    { nombre: "Rosario Blanco", foto: "img/ro.png" },
    { nombre: "Gabriela Lopez", foto: "img/gaby.png" },
    { nombre: "Lucas Pereiro", foto: "img/lucas.png" }
];

// Inyección de estilos dinámicos estrictamente necesarios para el Formulario Dinámico
const estilosAdicionales = document.createElement('style');
estilosAdicionales.innerHTML = `
    .btn-flotante-mas {
        position: fixed; bottom: 30px; right: 30px;
        width: 60px; height: 60px; border-radius: 50%;
        background: var(--accent); border: none;
        color: #0f1423; font-size: 2rem; font-weight: bold;
        cursor: pointer; box-shadow: 0 4px 20px var(--accent-glow);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); z-index: 100;
        display: flex; align-items: center; justify-content: center;
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
    
    .btn-insertar {
        background: var(--accent); color: #0f1423; border: none;
        padding: 12px 24px; border-radius: 50px; font-weight: 600;
        cursor: pointer; width: 100%; transition: transform 0.2s;
    }
    .btn-insertar:hover { transform: translateY(-2px); }
`;
document.head.appendChild(estilosAdicionales);

// 1. OBTENER FRASES (GET de Supabase)
async function cargarFrases() {
    try {
        const respuesta = await fetch(`${SUPABASE_URL}/rest/v1/frases?select=*`, {
            method: 'GET',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        
        if (!respuesta.ok) throw new Error(`HTTP error! status: ${respuesta.status}`);
        const datos = await respuesta.json();
        
        if (Array.isArray(datos)) {
            todasLasFrases = datos;
            
            // --- ¡CAMBIO ACÁ! Mezclamos las tarjetas al azar en cada refrescada ---
            todasLasFrases.sort(() => Math.random() - 0.5);
        }
        
        renderizarFraseDelDia();
        renderizarPantalla();
    } catch (error) {
        console.error("Error al conectar con Supabase:", error);
        if (contenedor) {
            contenedor.innerHTML = `<p style="color: #ef4444; text-align: center; grid-column: 1/-1; font-weight: 600;">Error al sincronizar con la base de datos en la nube.</p>`;
        }
    }
}
// LÓGICA DE SELECCIÓN RANDOM DIARIA FIJA (Matemática basada en fecha)
function renderizarFraseDelDia() {
    if (!contenedorFraseDia || todasLasFrases.length === 0) return;

    const fecha = new Date();
    const semillaFecha = fecha.getFullYear() * 10000 + (fecha.getMonth() + 1) * 100 + fecha.getDate();
    
    const indiceDelDia = semillaFecha % todasLasFrases.length;
    const itemHoy = todasLasFrases[indiceDelDia];

    contenedorFraseDia.innerHTML = `
        <div class="card-del-dia">
            <div class="foto-horizontal">
                <img src="${itemHoy.foto || 'img/default.png'}" alt="Foto de ${itemHoy.autor}">
            </div>
            <div class="info-horizontal">
                <p class="frase-dia-texto">"${itemHoy.frase.replace(/"/g, '')}"</p>
                <h3 class="autor-dia-texto">${itemHoy.autor}</h3>
            </div>
        </div>
    `;
}

// 2. ENVIAR NUEVA FRASE (POST a Supabase)
async function guardarFraseEnBD(textoFrase, autorFrase, rutaFoto) {
    try {
        const respuesta = await fetch(`${SUPABASE_URL}/rest/v1/frases`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ frase: textoFrase, autor: autorFrase, foto: rutaFoto })
        });

        if (respuesta.ok) {
            await cargarFrases();
        } else {
            alert("No se pudo guardar la frase. Verifica tus políticas RLS.");
        }
    } catch (error) {
        console.error("Error al insertar:", error);
        alert("Error de red al intentar guardar.");
    }
}

// Pintar la grilla tradicional abajo
function renderizarPantalla(frasesAMostrar = todasLasFrases) {
    if (!contenedor) return;
    contenedor.innerHTML = "";

    if (formularioActivo) {
        const tarjetaForm = document.createElement('article');
        tarjetaForm.classList.add('card-frase');
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

        tarjetaForm.querySelector('#form-inline').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btnInsertar = tarjetaForm.querySelector('.btn-insertar');
            btnInsertar.innerText = "Guardando...";
            btnInsertar.disabled = true;

            const texto = document.getElementById('ins-frase').value.trim();
            const select = document.getElementById('ins-autor');
            const autor = select.value;
            const foto = select.options[select.selectedIndex].getAttribute('data-foto');

            formularioActivo = false;
            document.getElementById('btn-toggle-form').classList.remove('activo');
            await guardarFraseEnBD(texto, autor, foto);
        });
    }

    if (frasesAMostrar.length === 0 && !formularioActivo) {
        contenedor.innerHTML = `<p style="color: var(--text-muted); text-align: center; grid-column: 1/-1; font-style: italic;">El libro de frases está vacío. ¡Inmortalizá una!</p>`;
        return;
    }

    frasesAMostrar.forEach(item => {
        if (!item.frase || !item.autor) return;
        const tarjeta = document.createElement('article');
        tarjeta.classList.add('card-frase');
        tarjeta.innerHTML = `
            <div class="foto-perfil">
                <img src="${item.foto || 'img/default.png'}" alt="Foto de ${item.autor}">
            </div>
            <div class="contenido">
                <p class="frase">"${item.frase.replace(/"/g, '')}"</p>
                <h3 class="autor">${item.autor}</h3>
            </div>
        `;
        contenedor.appendChild(tarjeta);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const btnToggleForm = document.getElementById('btn-toggle-form');
    const buscador = document.getElementById('buscador');

    if (btnToggleForm) {
        btnToggleForm.addEventListener('click', () => {
            formularioActivo = !formularioActivo;
            btnToggleForm.classList.toggle('activo');
            renderizarPantalla();
        });
    }

    if (buscador) {
        buscador.addEventListener('input', (e) => {
            const texto = e.target.value.toLowerCase();
            const filtradas = todasLasFrases.filter(item => 
                (item.autor && item.autor.toLowerCase().includes(texto)) || 
                (item.frase && item.frase.toLowerCase().includes(texto))
            );
            renderizarPantalla(filtradas);
        });
    }

    cargarFrases();
});
